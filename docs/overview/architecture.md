---
id: architecture
title: Architecture Overview
sidebar_label: Architecture
tags: [architecture, overview, spring-boot, react]
---

# Project Overview — Renault Club Bulgaria Rewrite

## What is this?

Renault Club Bulgaria (RCB) is an online platform for the largest Renault fan club in Bulgaria. This is a full rewrite of the legacy Spring Boot 2.1 / Java 11 / Thymeleaf / MySQL monolith into a modern, maintainable architecture.

---

## Architecture

### Backend — Maven Multi-Module

```
rcb/                        ← root POM (BOM imports, plugins)
├── api/                    ← OpenAPI YAML specs + generated Java interfaces
├── core/                   ← Business logic (services, mappers, domain, security config)
├── rest/                   ← HTTP layer (controllers, exception advice, Spring Boot entry point)
├── persistence/            ← JPA entities, repositories, Liquibase changesets
└── aggregate-report/       ← JaCoCo aggregated coverage report
```

**Module dependency rules (enforced by ArchUnit):**
```
rest     → core, api, persistence
core     → api, persistence
api      → (no internal deps)
persistence → (no internal deps)
```

### Frontend — React SPA

```
frontend/
├── src/app/                ← Router, providers (Query, Keycloak, Theme)
├── src/features/           ← One folder per domain (events, news, etc.)
├── src/shared/             ← Shared components, hooks, utils
├── src/theme/              ← MUI theme tokens
└── src/keycloak-theme/     ← Keycloakify custom auth UI
```

---

## Tech Stack

| Concern | Choice | Reason |
|---------|--------|--------|
| Language | Java 21 | Virtual threads, records, pattern matching |
| Framework | Spring Boot 3.5.x | LTS, native support, Spring Security 6 |
| Auth | Keycloak 26.x | SSO, MFA, brute-force protection, email verification |
| API Contract | OpenAPI 3.1 (YAML-first) | Generated interfaces prevent drift |
| DB | PostgreSQL 16 | Full text search, JSONB, production-grade |
| Migrations | Liquibase | Versioned, repeatable, CI-safe |
| DTO Mapping | MapStruct | Compile-time, type-safe, no reflection |
| Secrets | JASYPT | Encrypted `ENC(...)` values in YAML |
| HTTP Clients | Spring Cloud OpenFeign | Declarative, testable |
| Scheduling | ShedLock | Distributed locks on scheduled tasks |
| Error Format | RFC 7807 Problem+JSON | Standard, machine-readable errors |
| Frontend | React 19 + TypeScript strict | Current LTS |
| UI | MUI v6 | Consistent, accessible, RCB-branded |
| State | TanStack Query v5 + Zustand v5 | Server state + client state separation |
| Build | Vite | Fast HMR |
| Testing (BE) | JUnit 5, Testcontainers, ArchUnit | Real DB, module boundary validation |
| Testing (FE) | Vitest + Playwright | Unit + E2E |
| Local Storage | MinIO | S3-compatible; replaces Cloudinary on `local` profile |
| Local Email | Mailpit | SMTP trap + web UI; replaces SendGrid on `local` profile |
| Infrastructure | Docker Compose + Traefik v3 | Hetzner VPS, single-server |
| CI/CD | GitHub Actions (free tier) + GHCR | No paid features |
| Observability | Micrometer + OpenTelemetry + Prometheus | Standard stack |

---

## Domain Model

### Core Entities

| Entity | Key Fields | Relationships |
|--------|-----------|---------------|
| `UserEntity` | keycloakSubject, email, firstName, lastName, phoneNumber, lastLogin | OneToOne→MembershipCardEntity, ManyToMany→RoleEntity, ManyToMany→EventEntity |
| `EventEntity` | name, description, organizer, location, date, fee, status | ManyToMany↔User, OneToMany→Sponsor, OneToMany→Application |
| `NewsEntity` | title, subTitle, description, source, views, issuedOn, category | ManyToOne→User (author) |
| `CampaignEntity` | title, description, startDate, endDate | OneToMany→Sponsor, OneToMany→ClubProduct |
| `MembershipCardEntity` | type (NORMAL/SILVER/GOLDEN), validFrom, validUntil; computed `isActive()` | FK on users.membership_card_id |
| `PartnerEntity` | name, description, logoUrl, website, type | OneToMany→Advertisement |
| `CarEntity` | model, manufactureYear, registrationNumber, horsePower, engineVolume | FK on users.car_id |
| `GalleryEntity` | name, imageUrl, author | — |
| `CommentEntity` | body (TEXT), targetType (NEWS\|EVENT), targetId, deleted | ManyToOne→UserEntity (author), self-ref (max depth 2) |

### Enums

| Enum | Values |
|------|--------|
| `ApplicationStatus` | `PENDING`, `ACCEPTED`, `REJECTED` |
| `EventStatus` | `UPCOMING`, `ACTIVE`, `FINISHED`, `CANCELLED` |
| `MembershipCardType` | `NORMAL`, `SILVER`, `GOLDEN` |
| `PartnerType` | `DIAMOND`, `PLATED`, `GOLDEN`, `SILVER`, `BRONZE`, `ORGANIZATIONAL`, `MEDIA` |
| `CommentTargetType` | `NEWS`, `EVENT` |
| `CheckStatus` | `VALID`, `EXPIRING_SOON`, `INVALID`, `UNAVAILABLE` |

---

## Security Model

**Roles (Keycloak realm roles):** `USER`, `MODERATOR`, `ADMIN`, `ROOT_ADMIN`

| Role | Permissions |
|------|-------------|
| `USER+` | Apply to events, view own profile/car/membership, browse public content |
| `MODERATOR+` | Create/edit events and news |
| `ADMIN+` | Issue membership cards, manage partners/campaigns, lock/unlock users |
| `ROOT_ADMIN` | Delete users, change any user's role |

**JWT flow:** Keycloak issues JWT → `JwtAuthenticationConverter` maps `realm_access.roles` → `@PreAuthorize` guards all endpoints

---

## Database Schema Standards

All tables comply with **[ADR-001](../adr/adr-001-postgresql-database-design)**:

- **Primary keys:** UUID (`gen_random_uuid()`)
- **Timestamps:** `TIMESTAMP WITH TIME ZONE` (TIMESTAMPTZ)
- **Audit columns:** `created_at`, `updated_at`, `created_by`, `updated_by` on every table
- **FK indexes:** every foreign key column has a B-Tree index
- **Soft-delete:** `deleted_at`, `deleted_by` on user-facing tables

---

## Deployment

Production runs on a **Hetzner VPS** (Linux) using:
- **Docker Compose** — all services in containers
- **Traefik v3** — reverse proxy + automatic Let's Encrypt TLS
- **GitHub Actions** — CI (build + test) + CD (SSH deploy via `appleboy/ssh-action`)
- **GHCR** — container registry (GitHub free tier)

See [BE Setup Guide](../guides/be-setup) for local development instructions.
