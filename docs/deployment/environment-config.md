---
id: environment-config
title: Environment Variables & Secrets
sidebar_label: Environment Config
sidebar_position: 4
tags: [env, secrets, configuration, github-secrets]
---

# Environment Variables & Secrets

All configuration is injected via environment variables. No secrets are committed to git.

---

## File Locations

| File | Location | Purpose |
|------|----------|---------|
| `.env` | `/opt/rcb/.env` on VPS only | Production runtime config |
| `.env.example` | `infra/local/.env.example` (git) | Template — copy to `.env` |
| `alertmanager.yml` | `/opt/rcb/infra/local/observability/alertmanager/alertmanager.yml` | Generated from template, gitignored |
| `alertmanager.yml.template` | `infra/local/observability/alertmanager/alertmanager.yml.template` (git) | Committed template with `${VAR}` placeholders |

---

## Production `.env` — Full Reference

```bash
# ──────────────────────────────────────────────────────────────────
# Domain
# ──────────────────────────────────────────────────────────────────
DOMAIN=rcb.bg
ACME_EMAIL=admin@rcb.bg

# ──────────────────────────────────────────────────────────────────
# PostgreSQL
# ──────────────────────────────────────────────────────────────────
DB_PASSWORD=<strong-random-password>

# ──────────────────────────────────────────────────────────────────
# Spring Boot / JASYPT encryption master password
# Decrypts ENC(...) values in application.yaml
# ──────────────────────────────────────────────────────────────────
JASYPT_PASSWORD=<jasypt-encryptor-master-password>

# ──────────────────────────────────────────────────────────────────
# Keycloak admin credentials (production)
# ──────────────────────────────────────────────────────────────────
KC_ADMIN_USER=admin
KC_ADMIN_PASSWORD=<strong-keycloak-admin-password>

# ──────────────────────────────────────────────────────────────────
# Grafana admin password
# ──────────────────────────────────────────────────────────────────
GRAFANA_ADMIN_PASSWORD=<strong-grafana-password>

# ──────────────────────────────────────────────────────────────────
# Traefik BasicAuth — generate with: htpasswd -nb admin yourpassword
# Note: $$ escapes $ in docker-compose
# ──────────────────────────────────────────────────────────────────
TRAEFIK_BASICAUTH=admin:$$apr1$$...

# ──────────────────────────────────────────────────────────────────
# GHCR (GitHub Container Registry) — read:packages PAT
# Used by deploy.sh to pull Docker images
# ──────────────────────────────────────────────────────────────────
GHCR_TOKEN=<github-personal-access-token>

# ──────────────────────────────────────────────────────────────────
# Docker image tags — updated automatically by CI/CD on each deploy
# Format: sha-XXXXXXX (short git SHA)
# ──────────────────────────────────────────────────────────────────
BACKEND_TAG=sha-abc1234
FRONTEND_TAG=sha-def5678

# ──────────────────────────────────────────────────────────────────
# Ghost CMS
# ──────────────────────────────────────────────────────────────────
GHOST_DB_PASSWORD=<strong-random>
GHOST_MAIL_FROM=noreply@rcb.bg
SENDGRID_API_KEY=<sendgrid-api-key>

# ──────────────────────────────────────────────────────────────────
# Alertmanager — Slack webhook
# Used by alertmanager.yml (generated via envsubst from .template)
# Also used directly by GitHub Actions for deploy notifications
# ──────────────────────────────────────────────────────────────────
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T.../B.../...
```

---

## Variable Reference Table

### Infrastructure

| Variable | Used By | Description |
|----------|---------|-------------|
| `DOMAIN` | Traefik, Keycloak, Ghost | Root domain — `rcb.bg` |
| `ACME_EMAIL` | Traefik | Let's Encrypt certificate email |
| `TRAEFIK_BASICAUTH` | Traefik labels | BasicAuth for dashboard at `traefik.${DOMAIN}` |

### Database

| Variable | Used By | Description |
|----------|---------|-------------|
| `DB_PASSWORD` | PostgreSQL, Spring Boot, Keycloak | Shared DB password for `rcb_db` |
| `GHOST_DB_PASSWORD` | Ghost, ghost-db | Isolated Ghost database password |

### Application

| Variable | Used By | Description |
|----------|---------|-------------|
| `JASYPT_PASSWORD` | Spring Boot (`rcb-backend`) | Master key to decrypt `ENC(...)` properties |
| `KC_ADMIN_USER` | Keycloak | Admin console username |
| `KC_ADMIN_PASSWORD` | Keycloak | Admin console password |
| `GRAFANA_ADMIN_PASSWORD` | Grafana | Dashboard admin password |

### CI/CD & Deployment

| Variable | Used By | Description |
|----------|---------|-------------|
| `GHCR_TOKEN` | `deploy.sh`, GitHub Actions | PAT with `read:packages` — pulls Docker images |
| `BACKEND_TAG` | `docker-compose.prod.yml` | Active backend image tag (updated by `deploy.sh`) |
| `FRONTEND_TAG` | `docker-compose.prod.yml` | Active frontend image tag (updated by `deploy.sh`) |

### Notifications

| Variable | Used By | Description |
|----------|---------|-------------|
| `SLACK_WEBHOOK_URL` | Alertmanager, GitHub Actions | Slack incoming webhook — used for both Prometheus alerts and CI/CD deploy notifications |

### Email / External

| Variable | Used By | Description |
|----------|---------|-------------|
| `SENDGRID_API_KEY` | Ghost CMS | SMTP relay via SendGrid for Ghost emails |
| `GHOST_MAIL_FROM` | Ghost CMS | Sender address for Ghost notifications |

---

## GitHub Actions Secrets

Set these in each repo under **Settings → Secrets and variables → Actions**:

### Backend repo (`ivelin1936/Renault-Club-Bulgaria`)

| Secret | Value |
|--------|-------|
| `VPS_HOST` | VPS IP or hostname |
| `VPS_USER` | SSH deploy user (e.g. `deploy`) |
| `VPS_SSH_KEY` | SSH private key (Ed25519 or RSA) |
| `GHCR_TOKEN` | GitHub PAT — `read:packages` scope |
| `SLACK_WEBHOOK_URL` | Slack webhook URL |

### Frontend repo (`ivelin1936/renault-club-bulgaria-fe`)

Same secrets as BE — the FE workflow uses the same VPS and Slack channel.

---

## Frontend Environment Variables (Vite)

The FE uses `VITE_` prefixed variables, baked into the JS bundle at build time:

```bash
VITE_KEYCLOAK_URL=https://auth.rcb.bg    # Keycloak server URL
VITE_KEYCLOAK_REALM=rcb                  # Keycloak realm name
VITE_KEYCLOAK_CLIENT_ID=rcb-frontend     # Keycloak public client ID
VITE_API_BASE_URL=https://api.rcb.bg     # Backend API base URL
```

In GitHub Actions CI, these are passed as `env:` in the Build step. They do not need to be secrets (they are public URLs).

:::info No VITE_ in .env
`VITE_` variables are compile-time constants baked into the React bundle. They are not read from the VPS `.env` file at runtime.
:::

---

## Generating Secure Passwords

```bash
# Random 32-char password (good for DB_PASSWORD, KC_ADMIN_PASSWORD, etc.)
openssl rand -base64 32

# Traefik BasicAuth hash
htpasswd -nb admin yourpassword
# Output: admin:$apr1$...
# In docker-compose use $$ to escape $ signs
```

---

## Secret Rotation

When rotating a secret:

1. Update the value in `/opt/rcb/.env` on the VPS
2. If rotating `SLACK_WEBHOOK_URL`, regenerate `alertmanager.yml`:
   ```bash
   envsubst < infra/local/observability/alertmanager/alertmanager.yml.template \
     > infra/local/observability/alertmanager/alertmanager.yml
   docker compose -f docker-compose.prod.yml restart alertmanager
   ```
3. Update the corresponding GitHub Actions secret in both repos
4. Restart affected services: `docker compose -f docker-compose.prod.yml restart <service>`
