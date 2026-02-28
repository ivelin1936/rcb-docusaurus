---
id: be-setup
title: Backend Local Development Setup
sidebar_label: BE Setup (Spring Boot)
tags: [guide, backend, spring-boot, docker, setup]
---

# Backend Local Development Setup

Step-by-step guide to run the Renault Club Bulgaria **Spring Boot backend** locally.

**Repository:** [`ivelin1936/Renault-Club-Bulgaria`](https://github.com/ivelin1936/Renault-Club-Bulgaria)

---

## Prerequisites

Install the following before starting:

| Tool | Version | Download |
|------|---------|----------|
| Java (JDK) | 21+ | https://adoptium.net |
| Maven | 3.9+ | bundled via `./mvnw` wrapper |
| Docker Desktop | latest | https://www.docker.com/products/docker-desktop |
| Git | 2.x | https://git-scm.com |

---

## 1. Clone the Repository

```bash
git clone https://github.com/ivelin1936/Renault-Club-Bulgaria.git
cd Renault-Club-Bulgaria
git checkout future    # rewrite branch (master = frozen legacy)
```

---

## 2. Configure Environment Variables

```bash
cp .env.example .env
```

Open `.env` and fill in the required values:

```dotenv
# PostgreSQL
POSTGRES_DB=rcb_db
POSTGRES_USER=rcb_user
POSTGRES_PASSWORD=rcb_local_pass

# Keycloak
KC_ADMIN=admin
KC_ADMIN_PASSWORD=admin

# JASYPT — used to decrypt ENC(...) values in application.yaml
JASYPT_ENCRYPTOR_PASSWORD=<choose a strong password>
```

:::info
**Cloudinary and SendGrid credentials are NOT needed for local development.**

On `spring.profiles.active=local`, image uploads go to MinIO and emails go to Mailpit — both run in Docker Compose with no external accounts required.
:::

---

## 3. Start Infrastructure

```bash
docker compose -f infra/local/docker-compose.yml -f infra/local/docker-compose.override.yml up -d
```

This starts five services:

| Service | URL | Purpose |
|---------|-----|---------|
| **PostgreSQL 16** | `localhost:5432` | Primary database (`rcb_db`) |
| **Keycloak 26** | `http://localhost:8180` | SSO — realm `rcb` auto-imported |
| **MinIO** | `http://localhost:9001` (console) · `localhost:9000` (API) | Local S3-compatible object storage |
| **minio-init** | — | One-shot init container — creates `rcb-files` bucket and exits |
| **Mailpit** | `http://localhost:8025` (web UI) · `localhost:1025` (SMTP) | Local email trap |

Wait ~30 seconds for Keycloak to finish importing the realm. Verify:

```bash
docker compose ps
# All services → "healthy"; minio-init → "Exited (0)" (expected)

curl -s http://localhost:8180/realms/rcb | jq .realm
# expected: "rcb"
```

---

## 4. Configure the Local Spring Profile

```bash
cd rest/src/main/resources
cp application-local.yaml.template application-local.yaml
```

`application-local.yaml` is gitignored — safe to store local secrets here. The template is pre-filled with all MinIO and Mailpit settings.

---

## 5. Build and Run

```bash
./mvnw clean install -DskipTests    # first build (downloads dependencies)
./mvnw spring-boot:run -pl rest -Dspring-boot.run.profiles=local
```

Backend starts on `http://localhost:8080`.

**Verify:**

```bash
curl http://localhost:8080/actuator/health
# expected: {"status":"UP"}
```

**Expected log output on `local` profile:**

```
MinioStorageService — endpoint=http://localhost:9000, bucket=rcb-files
JavaMailEmailDispatcher — routing email to Mailpit SMTP at localhost:1025
```

---

## 6. Run Tests

```bash
./mvnw test                    # unit tests
./mvnw verify                  # unit + integration tests (Testcontainers — requires Docker)
./mvnw spotless:check          # code style check
```

---

## 7. Test Users (Pre-seeded in Keycloak)

| Email | Password | Role |
|-------|----------|------|
| `root@rcb.bg` | `Test1234!` | ROOT_ADMIN |
| `admin@rcb.bg` | `Test1234!` | ADMIN |
| `mod@rcb.bg` | `Test1234!` | MODERATOR |
| `user@rcb.bg` | `Test1234!` | USER |

---

## 8. Verify MinIO and Mailpit

**MinIO console** — http://localhost:9001
- Login: `minioadmin` / `minioadmin`
- The `rcb-files` bucket should already exist

**Mailpit inbox** — http://localhost:8025
- All emails sent by the application appear here
- Test: `POST http://localhost:8080/api/v1/newsletter/subscribe` with `{"email":"test@example.com"}`

---

## 9. Keycloak Admin Console

Access `http://localhost:8180/admin` with `KC_ADMIN` / `KC_ADMIN_PASSWORD` from `.env`.

The `rcb` realm is pre-configured with:
- Roles: `USER`, `MODERATOR`, `ADMIN`, `ROOT_ADMIN`
- Clients: `rcb-frontend` (public PKCE), `rcb-backend` (confidential), `rcb-test` (integration tests)
- 4 test users (see above)

---

## 10. Stop Services

```bash
docker compose down            # stop containers (data preserved)
docker compose down -v         # stop + delete volumes (fresh start)
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| **Keycloak fails to start** | Check Docker is running; verify port 8180 not in use |
| **Backend fails with "JWT issuer not found"** | Wait 30s for Keycloak realm import; `curl http://localhost:8180/realms/rcb` |
| **PostgreSQL connection refused** | Check port 5432 not in use; `docker compose logs db` |
| **`./mvnw` permission denied** | `chmod +x mvnw` |
| **`rcb-files` bucket missing in MinIO** | `docker compose restart minio-init` |
| **Uploads go to Cloudinary (not MinIO)** | Verify `spring.profiles.active=local` is active |
| **`minio-init` shows `Exited (0)`** | Expected — this is a one-shot init container. Success. |

---

## Environment Variables Reference

| Variable | Description | Local | Staging/Prod |
|----------|-------------|-------|--------------|
| `POSTGRES_DB` | Database name | `rcb_db` | required |
| `POSTGRES_USER` | DB user | `rcb_user` | required |
| `POSTGRES_PASSWORD` | DB password | `rcb_local_pass` | required |
| `KC_ADMIN` | Keycloak admin username | `admin` | required |
| `KC_ADMIN_PASSWORD` | Keycloak admin password | `admin` | required |
| `JASYPT_ENCRYPTOR_PASSWORD` | Decrypts `ENC(...)` secrets | required | required |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account name | not needed (local profile uses MinIO) | required |
| `VITE_KEYCLOAK_URL` | Keycloak URL for frontend | `http://localhost:8180` | required |
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:8080` | required |
