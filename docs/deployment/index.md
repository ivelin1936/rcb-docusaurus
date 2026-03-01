---
id: index
title: Deployment & Operations
sidebar_label: Overview
sidebar_position: 1
tags: [deployment, ops, vps, ci-cd, alertmanager, slack]
---

# Deployment & Operations Guide

End-to-end guide for deploying and operating the **Renault Club Bulgaria** platform on a Hetzner VPS.

Follow the guides **in order** — each step builds on the previous one.

---

## What You'll Set Up

```
GitHub Actions CI/CD
      │
      ▼  push to `future` / `master`
   ┌──────────────────────────────────────────┐
   │  1. Maven build + tests  (BE)            │
   │  2. Docker build + push → GHCR          │
   │  3. SSH → VPS → deploy.sh               │
   │  4. Health gate (120 s / 60 s)           │
   │  5. Slack ✅ / 🔴 notification           │
   └──────────────────────────────────────────┘
      │
      ▼
Hetzner VPS  /opt/rcb/
      │
      ├── Traefik v3        (TLS termination)
      ├── rcb-backend        (Spring Boot 3.x)
      ├── rcb-frontend       (React 19 / nginx)
      ├── Keycloak 26        (SSO / Auth)
      ├── PostgreSQL 16      (Primary DB)
      ├── Ghost CMS          (Blog)
      ├── Prometheus         (Metrics)
      ├── Alertmanager  ──► Slack #rcb-alerts
      ├── Grafana            (Dashboards)
      └── Loki               (Log aggregation)
```

---

## Guide Index

| # | Guide | Responsibility |
|---|-------|----------------|
| 1 | [Architecture Overview](./architecture-overview) | How all components connect |
| 2 | [VPS Bootstrap](./vps-bootstrap) | One-time server setup |
| 3 | [Environment Variables & Secrets](./environment-config) | All `.env` keys and GitHub Secrets |
| 4 | [GitHub Actions CI/CD](./github-actions-cicd) | Automated build → push → deploy pipeline |
| 5 | [Deploy & Rollback](./deploy-rollback) | Daily operations: deploy, rollback, health check |
| 6 | [Alertmanager Setup](./alertmanager-setup) | Prometheus alerts → Slack |
| 7 | [Slack Notifications](./slack-notifications) | Slack incoming webhook configuration |

---

## Quick-Start Checklist

Before running anything in production, verify these prerequisites:

- [ ] Hetzner VPS created (Ubuntu 22.04 LTS, 2 vCPU / 4 GB RAM minimum)
- [ ] Domain name pointing to VPS IP (`rcb.bg` → VPS)
- [ ] GitHub repos with Actions enabled: `ivelin1936/Renault-Club-Bulgaria`, `ivelin1936/renault-club-bulgaria-fe`
- [ ] Slack workspace with incoming webhook URL (see [Slack Notifications](./slack-notifications))
- [ ] GHCR (GitHub Container Registry) — free with GitHub account, no setup needed
- [ ] Docker installed on VPS (see [VPS Bootstrap](./vps-bootstrap))
