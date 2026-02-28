---
id: adr-005-iam-domain-boundary
title: "ADR-005: IAM Domain Boundary"
sidebar_label: "ADR-005: IAM Boundary"
tags: [adr, iam, security, keycloak, accepted]
---

# ADR-005: IAM Domain Boundary

| Field    | Value |
|----------|-------|
| Status   | ✅ Accepted |
| Date     | 2026-02-21 |
| Author   | @architect |
| Deciders | @architect, @ivko |

---

## Context

As the Renault Club Bulgaria platform grows, identity and access management (IAM) concerns risk becoming scattered across business domains. For example:

- `EventService` checking roles inline
- `NewsService` duplicating membership validation
- Each domain importing Keycloak classes directly

This creates maintenance burden, makes security auditing difficult, and violates Domain-Driven Design principles (supporting domain vs. core domain).

---

## Decision

All IAM concerns are consolidated into a dedicated `iam` domain:

**Package structure:**

- `com.rcb.core.service.iam.*` — role assignment, audit logging, Keycloak sync
- `com.rcb.rest.controller.iam.*` — IAM HTTP endpoints
- `com.rcb.persistence.entity.iam.*` — `RoleEntity`, `AuditLogEntity`
- `com.rcb.persistence.repository.iam.*` — `RoleRepository`, `AuditLogRepository`

**What IAM domain does:**

- Administrative role management (assign/revoke roles via `IamService`)
- GDPR audit logging (who accessed/changed what personal data)
- Optional: Keycloak Admin API sync for role changes (`@ConditionalOnProperty`)

**What IAM domain does NOT do:**

- Runtime authorization checks — these use `@PreAuthorize` with JWT claims directly
- Business logic (events, news, campaigns)
- Membership validation (stays in `MembershipService` in the membership domain)

---

## Boundary Rules (enforced by ArchUnit)

1. **Business domains do NOT import `IamService`:**
   - `EventService`, `NewsService`, `CampaignService`, etc. must NOT call `IamService`
   - They use `@PreAuthorize("hasRole('...')")` for runtime security
   - `IamService` is used only for administrative operations (changing roles, audit logging)

2. **`IamService` is used only by `IamController` and `SecurityConfig`**

3. **Module boundary:** `persistence/` IAM entities do NOT import from `core/`

---

## Consequences

### Positive

- Clear domain responsibility — single place for all IAM operations
- GDPR audit trail is centralized and consistent
- ArchUnit enforces boundaries at CI build time — violations caught early
- Adding new roles or permissions only touches the `iam` domain
- Security audit only needs to review the `iam` domain for identity-related vulnerabilities

### Negative

- Slight overhead for admin operations (must go through `IamService`)
- Two-step authorization: runtime (`@PreAuthorize`) + administrative (`IamService`) — can be confusing initially

### Neutral

- Role changes in DB are reflected in JWT on next Keycloak token refresh (not immediate) — acceptable for a small community site

---

## References

- DDD: Supporting Domain pattern
- Story 034: IAM Module implementation
- Story 035: GDPR Compliance (uses `AuditLogService` from this domain)
- [ArchUnit docs](https://www.archunit.org/)
- [ADR-001](./adr-001-postgresql-database-design) — PostgreSQL schema standards
- [ADR Index](./)
