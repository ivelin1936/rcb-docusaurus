---
id: index
title: Developer Guides
sidebar_label: Guides Index
tags: [guides, setup]
---

# Developer Guides

Step-by-step guides for setting up and working with the Renault Club Bulgaria platform.

| Guide | Description |
|-------|-------------|
| [BE Setup](./be-setup) | Spring Boot 3.5.x backend — clone, configure, Docker Compose, run locally |
| [FE Setup](./fe-setup) | React 19 frontend — clone, install, environment variables, run locally |

---

## Quick Reference

### Start the full stack

```bash
# 1. Start infrastructure (PostgreSQL, Keycloak, MinIO, Mailpit)
cd renault-club-bulgaria-be
docker compose -f infra/local/docker-compose.yml -f infra/local/docker-compose.override.yml up -d

# 2. Start backend
./mvnw spring-boot:run -pl rest -Dspring-boot.run.profiles=local

# 3. Start frontend (separate terminal)
cd renault-club-bulgaria-fe
npm install && npm run dev
```

### Test users

| Email | Password | Role |
|-------|----------|------|
| `root@rcb.bg` | `Test1234!` | ROOT_ADMIN |
| `admin@rcb.bg` | `Test1234!` | ADMIN |
| `mod@rcb.bg` | `Test1234!` | MODERATOR |
| `user@rcb.bg` | `Test1234!` | USER |
