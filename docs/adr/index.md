---
id: index
title: Architecture Decision Records
sidebar_label: ADR Index
tags: [adr, architecture, governance]
---

import { StatusBadge } from '@site/src/components';

# Architecture Decision Records

> ADRs capture significant architectural and design decisions that are hard to reverse, affect multiple stories, or will confuse future engineers.
>
> Each ADR is **immutable once `Accepted`**. Never modify an existing ADR — create a new ADR with `Supersedes: ADR-NNN` instead.
>
> **ADR gate (Story 041):** Any architectural change MUST have an `Accepted` ADR before implementation begins.
> CODEOWNERS enforces `@architect` approval on all changes to `docs/adr/`.

---

## ADR Registry

| ADR | Title | Status | Date | Superseded By |
|-----|-------|--------|------|---------------|
| [ADR-001](./adr-001-postgresql-database-design) | PostgreSQL 16 Schema Design Standards | <StatusBadge status="Accepted" /> | 2026-02-21 | — |
| [ADR-005](./adr-005-iam-domain-boundary) | IAM Domain Boundary — role management, audit logging, Keycloak sync | <StatusBadge status="Accepted" /> | 2026-02-21 | — |
| [ADR-006](./adr-006-bulgarian-vehicle-apis) | Bulgarian Vehicle API Integration Strategy — МВР, АПИ, ГО, Виньетка | <StatusBadge status="Accepted" /> | 2026-02-25 | — |
| [ADR-007](./adr-007-payment-gateway) | Payment Gateway Selection for Membership Fees | <StatusBadge status="Deferred" label="Decision Deferred" /> | 2026-02-25 | — |

---

## ADR Lifecycle

```
Proposed → Accepted → Deprecated
                   ↘ Superseded by ADR-NNN
```

### Status Definitions

| Status | Meaning | Who can set it |
|--------|---------|----------------|
| <StatusBadge status="Proposed" /> | Written and submitted for review; not yet binding | Any agent |
| <StatusBadge status="Accepted" /> | Reviewed and approved by @architect — **binding for all implementation** | `@architect` only |
| <StatusBadge status="Rejected" /> | Reviewed and rejected — kept for history and reasoning | `@architect` only |
| <StatusBadge status="Deprecated" /> | No longer applicable but kept for historical context | `@architect` only |
| <StatusBadge status="Superseded" /> | Replaced by a newer ADR — link to replacement | `@architect` only |

### Status Transition Rules

| From | To | Trigger | What must be updated |
|------|----|---------|----------------------|
| Proposed | Accepted | @architect approves the PR | ADR status field; this index table |
| Proposed | Rejected | @architect rejects with reasoning | ADR status field; add rejection reason to ADR body |
| Accepted | Deprecated | Decision is no longer valid (technology retired, etc.) | ADR status field; add deprecation note with date |
| Accepted | Superseded | New ADR replaces this one | Old ADR: status + link to new ADR; New ADR: `Supersedes: ADR-NNN` field |

---

## When to Write an ADR

### Requires an ADR

| Category | Examples |
|----------|---------|
| Docusaurus | Switching version, adding/removing major plugins, changing preset |
| ArgoCD | Changing sync strategy (manual ↔ auto), adding new watched component |
| Infrastructure | New service in docker-compose, new Traefik route, new external dependency |
| Database | New database technology, migration strategy change |
| Security | New auth mechanism, OAuth2 client type change, cookie policy change |
| Backend | New Spring module, new cross-cutting pattern (Outbox, Saga, CQRS) |
| Frontend | New state management library, UI framework change |

### Does NOT Require an ADR

- Bug fixes and hotfixes
- UI copy changes
- Adding a new endpoint in an existing domain following established patterns
- Adding or improving tests
- Minor/patch version dependency bumps

---

## Creating a New ADR

1. Copy the template: [`adr-template.md`](./adr-template)
2. Name the file: `adr-NNN-short-title.md` (next sequential number)
3. Fill in all sections (Context, Decision Drivers, Considered Options, Decision Outcome, Consequences)
4. Open a PR against `main` in `rcb-docusaurus`
5. CODEOWNERS automatically requests `@architect` review
6. Do NOT start implementation until ADR status is changed to `Accepted`
7. Reference the ADR in your implementation PR: `Implements ADR-NNN`
8. Update this index table after the ADR is accepted

---

## ADR Template

→ [docs/adr/adr-template.md](./adr-template)
