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

## E2E Test Environment Variables

These variables are used by the Playwright E2E test suite. They are set as GitHub Actions secrets in the FE repository and passed to the `e2e` job in `ci.yml`.

```bash
# ──────────────────────────────────────────────────────────────────
# Playwright E2E
# ──────────────────────────────────────────────────────────────────

# If set, Playwright skips starting the dev server and connects to this URL.
# Leave unset for local development (dev server auto-starts).
# Set to remote URL for staging/production smoke tests.
PLAYWRIGHT_BASE_URL=https://staging.rcb.bg

# ──────────────────────────────────────────────────────────────────
# Keycloak — used by auth.fixture.ts (ROPC token exchange)
# ──────────────────────────────────────────────────────────────────
KEYCLOAK_URL=http://localhost:8180          # Keycloak base URL
KEYCLOAK_REALM=rcb                          # Keycloak realm
KEYCLOAK_CLIENT_ID=rcb-frontend-test        # Test-only client (ROPC must be enabled)

# ──────────────────────────────────────────────────────────────────
# Test user credentials
# These users must exist in the Keycloak realm with appropriate roles.
# Store passwords as GitHub Actions secrets — never commit them.
# ──────────────────────────────────────────────────────────────────
TEST_USER_USERNAME=testuser@rcb.bg
TEST_USER_PASSWORD=<secret>                 # GitHub secret: TEST_USER_PASSWORD

TEST_ADMIN_USERNAME=testadmin@rcb.bg
TEST_ADMIN_PASSWORD=<secret>                # GitHub secret: TEST_ADMIN_PASSWORD

TEST_MOD_USERNAME=testmod@rcb.bg
TEST_MOD_PASSWORD=<secret>                  # GitHub secret: TEST_MOD_PASSWORD
```

### E2E Variable Reference Table

| Variable | Used By | Description |
|----------|---------|-------------|
| `PLAYWRIGHT_BASE_URL` | Playwright config (`playwright.config.ts`) | Override base URL; if unset, dev server starts automatically |
| `KEYCLOAK_URL` | `e2e/fixtures/auth.fixture.ts` | Keycloak server base URL for ROPC token exchange |
| `KEYCLOAK_REALM` | `e2e/fixtures/auth.fixture.ts` | Keycloak realm name |
| `KEYCLOAK_CLIENT_ID` | `e2e/fixtures/auth.fixture.ts` | Test client ID — must have Direct Access Grants enabled |
| `TEST_USER_PASSWORD` | `e2e/fixtures/auth.fixture.ts` | Password for regular member test user |
| `TEST_ADMIN_PASSWORD` | `e2e/fixtures/auth.fixture.ts` | Password for admin test user |
| `TEST_MOD_PASSWORD` | `e2e/fixtures/auth.fixture.ts` | Password for moderator test user |

### Keycloak ROPC Setup

The auth fixture uses the ROPC (Resource Owner Password Credentials) grant. This must be enabled on a **dedicated test client only**:

1. Keycloak Admin Console → Realm `rcb` → Clients → `rcb-frontend-test`
2. Settings → Direct Access Grants → **Enabled: ON**
3. The production client `rcb-frontend` must have Direct Access Grants **disabled**

---

## NVD API Key (OWASP Dependency Check)

The optional `NVD_API_KEY` speeds up the OWASP Dependency Check's NVD database download from 5–10 minutes to under 30 seconds in CI.

```bash
# ──────────────────────────────────────────────────────────────────
# OWASP NVD API Key (optional)
# Speeds up NVD database updates for dependency-check -Powasp
# Register at: https://nvd.nist.gov/developers/request-an-api-key
# ──────────────────────────────────────────────────────────────────
NVD_API_KEY=<nvd-api-key>
```

Set this as a GitHub Actions secret (`NVD_API_KEY`) in the BE repository. Local development works without it — the first run will be slow while the NVD database is downloaded, but subsequent runs use the Maven local repository cache.

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
