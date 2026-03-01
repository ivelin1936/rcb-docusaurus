---
id: architecture-overview
title: Architecture Overview
sidebar_label: Architecture Overview
sidebar_position: 2
tags: [architecture, ci-cd, vps, docker, traefik]
---

# Architecture Overview

This page describes the full production architecture: how source code flows from a developer's machine to a live URL, and how alerts are fired when something goes wrong.

---

## CI/CD Flow

```mermaid
flowchart TD
    DEV([Developer pushes\nto `future` branch]) --> GH_BUILD

    subgraph GH["GitHub Actions — BE Workflow"]
        GH_BUILD["① Build & Test\n./mvnw clean verify"]
        GH_BUILD --> GH_DOCKER["② Docker Build\n+ Push to GHCR\nghcr.io/ivelin1936/rcb-backend:sha-abc1234"]
        GH_DOCKER --> GH_DEPLOY["③ SSH Deploy\nappleboy/ssh-action"]
        GH_DEPLOY --> GH_SLACK["④ Slack Notification\n✅ success  /  🔴 failure"]
    end

    GH_DEPLOY -->|"SSH: bash deploy.sh backend rcb-backend"| VPS_DEPLOY

    subgraph VPS["Hetzner VPS  /opt/rcb/"]
        VPS_DEPLOY["deploy.sh\n• sed BACKEND_TAG in .env\n• docker compose pull rcb-backend\n• docker compose up -d --no-deps rcb-backend"]
        VPS_DEPLOY --> VPS_HEALTH["Health Gate\npoll 120s — wait for healthy"]
        VPS_HEALTH --> VPS_LOG["Append to deploy.log\nTIMESTAMP deploy backend sha-abc OK"]
    end

    style GH fill:#1e3a5f,color:#fff
    style VPS fill:#1a3a1a,color:#fff
```

---

## Production Stack

```mermaid
graph LR
    INTERNET([Internet]) -->|"80/443"| TRAEFIK

    subgraph VPS["Hetzner VPS — Docker Compose (rcb_public network)"]
        TRAEFIK["Traefik v3\nTLS + Reverse Proxy"]
        TRAEFIK -->|"api.rcb.bg"| BACKEND["rcb-backend\nSpring Boot 3.x :8080"]
        TRAEFIK -->|"rcb.bg"| FRONTEND["rcb-frontend\nReact 19 / nginx :80"]
        TRAEFIK -->|"auth.rcb.bg"| KEYCLOAK["Keycloak 26\n:8080"]
        TRAEFIK -->|"rcb.bg/blog"| GHOST["Ghost CMS :2368"]
        TRAEFIK -->|"grafana.rcb.bg"| GRAFANA["Grafana :3000"]
        TRAEFIK -->|"traefik.rcb.bg"| TRAEFIK_DASH["Traefik Dashboard\nBasicAuth"]
    end

    subgraph INTERNAL["rcb_internal network (not exposed)"]
        BACKEND -->|"JDBC"| POSTGRES["PostgreSQL 16\n:5432"]
        KEYCLOAK -->|"JDBC"| POSTGRES
        BACKEND -->|"metrics :8080/actuator/prometheus"| PROMETHEUS["Prometheus :9090"]
        TRAEFIK -->|"metrics :8082"| PROMETHEUS
        PROMETHEUS -->|"alert rules"| ALERTMANAGER["Alertmanager :9093"]
        ALERTMANAGER -->|"Slack webhook"| SLACK([Slack\n#rcb-alerts])
        PROMETHEUS --> GRAFANA
        LOKI["Loki :3100"] --> GRAFANA
    end

    style INTERNAL fill:#1a2a1a,color:#ddd
    style VPS fill:#1e2a3f,color:#ddd
```

---

## Network Architecture

| Network | Purpose | Who's on it |
|---------|---------|-------------|
| `rcb_public` | Internet-facing; Traefik routes here | traefik, backend, frontend, keycloak, ghost, grafana |
| `rcb_internal` | Isolated; never exposed to internet | postgres, prometheus, alertmanager, loki, backend, keycloak, grafana |
| `ghost_internal` | Ghost-only isolation | ghost, ghost-db |

**Rule:** PostgreSQL, Prometheus, Alertmanager, and Loki are **never** on `rcb_public`. They cannot be reached from the internet.

---

## Authentication Flow

```mermaid
sequenceDiagram
    participant U as Browser
    participant FE as rcb-frontend
    participant KC as Keycloak (auth.rcb.bg)
    participant BE as rcb-backend (api.rcb.bg)

    U->>FE: Load app
    FE->>KC: Redirect to /realms/rcb/protocol/openid-connect/auth
    U->>KC: Enter credentials
    KC-->>FE: Authorization code
    FE->>KC: Exchange code → access_token + refresh_token
    FE->>BE: API request with Authorization: Bearer {access_token}
    BE->>KC: Validate JWT (JWKS endpoint)
    KC-->>BE: Token valid ✓
    BE-->>FE: API response
```

---

## Image Tagging Convention

Every Docker image is tagged with the short Git SHA at the time of the push:

```
ghcr.io/ivelin1936/rcb-backend:sha-abc1234
ghcr.io/ivelin1936/rcb-backend:future       ← branch tag (latest on future)
ghcr.io/ivelin1936/rcb-frontend:sha-abc1234
ghcr.io/ivelin1936/rcb-frontend:master
```

The SHA tag is used for rollback. The branch tag (`future` / `master`) is always the latest deployed image.

---

## Repositories

| Repo | Purpose | Branch |
|------|---------|--------|
| [`ivelin1936/Renault-Club-Bulgaria`](https://github.com/ivelin1936/Renault-Club-Bulgaria) | Spring Boot BE, infra scripts, backlog | `future` |
| [`ivelin1936/renault-club-bulgaria-fe`](https://github.com/ivelin1936/renault-club-bulgaria-fe) | React FE | `master` |
| [`ivelin1936/rcb-docusaurus`](https://github.com/ivelin1936/rcb-docusaurus) | This documentation site | `main` |
