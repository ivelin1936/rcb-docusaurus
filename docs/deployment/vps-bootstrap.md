---
id: vps-bootstrap
title: VPS Bootstrap
sidebar_label: VPS Bootstrap
sidebar_position: 3
tags: [vps, hetzner, docker, bootstrap, setup]
---

# VPS Bootstrap

One-time server setup for the Hetzner VPS. Run these steps exactly once when provisioning a new server.

---

## Prerequisites

| Requirement | Value |
|-------------|-------|
| Server | Hetzner CX22 (2 vCPU / 4 GB RAM) or larger |
| OS | Ubuntu 22.04 LTS |
| DNS | `rcb.bg`, `api.rcb.bg`, `auth.rcb.bg`, `grafana.rcb.bg`, `traefik.rcb.bg` → VPS IP |
| Access | SSH root or sudo user |

---

## Step 1 — Initial Server Hardening

```bash
# Update packages
apt-get update && apt-get upgrade -y

# Create a non-root deploy user
adduser deploy
usermod -aG sudo deploy
usermod -aG docker deploy    # add after Docker install

# Copy your SSH public key
mkdir -p /home/deploy/.ssh
cat ~/.ssh/id_ed25519.pub >> /home/deploy/.ssh/authorized_keys
chmod 700 /home/deploy/.ssh && chmod 600 /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy/.ssh

# Disable root password login (optional but recommended)
sed -i 's/^PermitRootLogin.*/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config
systemctl restart ssh
```

---

## Step 2 — Install Docker

```bash
# Install Docker Engine (official method)
apt-get install -y ca-certificates curl gnupg
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  | tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Verify
docker --version
docker compose version
```

---

## Step 3 — Set Up `/opt/rcb` Directory Structure

```bash
# Create directory layout
mkdir -p /opt/rcb/scripts
mkdir -p /opt/rcb/infra/local/observability/alertmanager
mkdir -p /opt/rcb/infra/local/observability/prometheus

chown -R deploy:deploy /opt/rcb
```

---

## Step 4 — Clone the Repository

```bash
su - deploy
cd /opt/rcb

# Clone the backend repo (contains infra scripts)
git clone https://github.com/ivelin1936/Renault-Club-Bulgaria.git .

# Verify key files are present
ls infra/scripts/deploy.sh
ls infra/prod/docker-compose.prod.yml
ls infra/Makefile
```

---

## Step 5 — Create the `.env` File

```bash
# Copy the template and fill in production values
cp infra/local/.env.example /opt/rcb/.env
nano /opt/rcb/.env
```

See [Environment Variables & Secrets](./environment-config) for the full list of required values.

**Minimum required for first boot:**

```bash
# /opt/rcb/.env
DOMAIN=rcb.bg
ACME_EMAIL=admin@rcb.bg
DB_PASSWORD=<strong-random>
JASYPT_PASSWORD=<strong-random>
KC_ADMIN_USER=admin
KC_ADMIN_PASSWORD=<strong-random>
GRAFANA_ADMIN_PASSWORD=<strong-random>
TRAEFIK_BASICAUTH=admin:$$apr1$$...   # generated with: htpasswd -nb admin yourpassword
GHCR_TOKEN=<github-pat-read-packages>
BACKEND_TAG=sha-abc1234
FRONTEND_TAG=sha-def5678
GHOST_DB_PASSWORD=<strong-random>
GHOST_MAIL_FROM=noreply@rcb.bg
SENDGRID_API_KEY=<key>
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
```

:::danger Never commit `.env` to git
The `.env` file is gitignored. It lives **only** on the VPS at `/opt/rcb/.env`.
:::

---

## Step 6 — Generate Alertmanager Config

The `alertmanager.yml.template` uses `${SLACK_WEBHOOK_URL}` — generate the real file:

```bash
envsubst < /opt/rcb/infra/local/observability/alertmanager/alertmanager.yml.template \
  > /opt/rcb/infra/local/observability/alertmanager/alertmanager.yml
```

Verify it contains your real webhook URL (not the `${...}` placeholder).

---

## Step 7 — Set Up Symlinks

```bash
# Convenience symlink for docker-compose.prod.yml at /opt/rcb root
ln -sf /opt/rcb/infra/prod/docker-compose.prod.yml /opt/rcb/docker-compose.prod.yml

# Symlink Makefile to /opt/rcb root
ln -sf /opt/rcb/infra/Makefile /opt/rcb/Makefile

# Symlink scripts
ln -sf /opt/rcb/infra/scripts /opt/rcb/scripts
```

---

## Step 8 — Log in to GHCR

```bash
echo "$GHCR_TOKEN" | docker login ghcr.io -u ivelin1936 --password-stdin
```

---

## Step 9 — First Boot

```bash
cd /opt/rcb

# Start the full stack
docker compose -f docker-compose.prod.yml --env-file .env up -d

# Watch startup logs
docker compose -f docker-compose.prod.yml logs -f
```

Wait for all services to become healthy (Keycloak takes ~2 minutes on first boot):

```bash
make health
```

Expected output:
```
── Containers ───────────────────────────────────────────────────
  ✓  rcb_backend   healthy
  ✓  rcb_frontend  healthy
  ✓  rcb_postgres  healthy
  ✓  rcb_keycloak  healthy

── HTTPS / API  (domain: rcb.bg) ───────────────────────────────
  ✓  Frontend reachable      https://rcb.bg
  ✓  Backend actuator UP     https://api.rcb.bg/actuator/health
  ✓  Keycloak OIDC config    https://auth.rcb.bg/realms/rcb
  ✓  TLS certificate valid   https://rcb.bg
```

---

## Step 10 — Set Up Log Rotation

```bash
# Copy logrotate config (included in repo)
cp /opt/rcb/infra/logrotate/rcb-deploy /etc/logrotate.d/rcb-deploy

# Test logrotate config
logrotate -d /etc/logrotate.d/rcb-deploy
```

---

## Step 11 — Configure GitHub Actions Secrets

In both GitHub repos, add the following repository secrets under **Settings → Secrets → Actions**:

| Secret | Description |
|--------|-------------|
| `VPS_HOST` | VPS IP address or hostname |
| `VPS_USER` | SSH username (e.g. `deploy`) |
| `VPS_SSH_KEY` | Private SSH key (matching the public key on VPS) |
| `GHCR_TOKEN` | GitHub PAT with `read:packages` scope |
| `SLACK_WEBHOOK_URL` | Slack incoming webhook URL |

See [GitHub Actions CI/CD](./github-actions-cicd) for full pipeline details.

---

## Firewall Rules

Allow only the necessary ports:

```bash
ufw allow 22/tcp     # SSH
ufw allow 80/tcp     # HTTP (redirected to HTTPS by Traefik)
ufw allow 443/tcp    # HTTPS
ufw enable
```

All other ports (9090 Prometheus, 9093 Alertmanager, 5432 Postgres, 3100 Loki) remain closed to the internet — they are only accessible within Docker internal networks.
