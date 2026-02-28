---
id: index
title: Architecture Decision Records
sidebar_label: ADR Index
tags: [adr, architecture]
---

# Architecture Decision Records

> ADRs capture significant architectural and design decisions that are hard to reverse, affect multiple stories, or will confuse future engineers.
>
> Each ADR is immutable once `Accepted`. Superseded decisions use `Superseded by ADR-NNN`.

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [ADR-001](./adr-001-postgresql-database-design) | PostgreSQL 16 Schema Design Standards | Accepted | 2026-02-21 |
| [ADR-005](./adr-005-iam-domain-boundary) | IAM Domain Boundary — role management, audit logging, Keycloak sync | Accepted | 2026-02-21 |
| [ADR-006](./adr-006-bulgarian-vehicle-apis) | Bulgarian Vehicle API Integration Strategy — МВР, АПИ, ГО, Виньетка | Accepted | 2026-02-25 |
| [ADR-007](./adr-007-payment-gateway) | Payment Gateway Selection for Membership Fees | Research Complete — Decision Deferred | 2026-02-25 |

---

## When to Write an ADR

Write an ADR when:
- Choosing a technology that affects multiple teams or stories
- Making a schema decision that all domain tables must follow
- Deviating from an existing pattern (explain why)
- Making a security or auth architecture choice

## ADR Lifecycle

```
Proposed → Accepted → (Deprecated | Superseded by ADR-NNN)
```

- **Proposed**: Written, not yet reviewed by @architect
- **Accepted**: Reviewed and approved by @architect — binding for all implementation
- **Deprecated**: No longer applicable but kept for history
- **Superseded**: Replaced by a newer ADR — link to replacement
