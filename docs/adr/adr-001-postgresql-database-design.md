---
id: adr-001-postgresql-database-design
title: "ADR-001: PostgreSQL 16 Schema Design Standards"
sidebar_label: "ADR-001: PostgreSQL Schema"
tags: [adr, database, postgresql, schema, accepted]
---

# ADR-001: PostgreSQL 16 Schema Design Standards for Renault Club Bulgaria Rewrite

| Field    | Value |
|----------|-------|
| Status   | ✅ Accepted |
| Date     | 2026-02-21 |
| Author   | @db-designer |
| Deciders | @architect, @ivko |
| Reviewed | @architect — 2026-02-21 |

---

## Context

The Renault Club Bulgaria application is being rewritten from Spring Boot 2.1 / Java 11 / MySQL to Spring Boot 3.5.x / Java 21 / PostgreSQL 16. The legacy system accumulated schema debt: inconsistent timestamp handling (no timezone awareness), missing audit columns, absent FK indexes on join tables, no soft-delete strategy, and no full-text search capability.

As the rewrite progresses through 41 planned stories, every new domain table must conform to a single set of schema design decisions made once and applied consistently. Without an authoritative ADR, individual story implementations will produce diverging conventions that become progressively harder to reconcile.

---

## Decision

We enforce the following 10 schema design standards on all tables in the PostgreSQL 16 database. These are non-negotiable for all new tables.

---

### Standard 1 — UUID Primary Keys

All tables use UUID as the primary key type.

```sql
id UUID DEFAULT gen_random_uuid() PRIMARY KEY
```

**Rationale:** No sequential ID leakage (prevents enumeration attacks). Consistent with Keycloak user identifiers. Allows offline ID generation for event sourcing / eventual consistency.

**JPA mapping:**
```java
@Id
@GeneratedValue(strategy = GenerationType.UUID)
private UUID id;
```

---

### Standard 2 — Audit Columns (Mandatory on Every Table)

Every table must have all four audit columns:

```sql
created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
updated_at  TIMESTAMP WITH TIME ZONE,
created_by  VARCHAR(255),   -- Keycloak subject of creating user (NULL = system)
updated_by  VARCHAR(255)    -- Keycloak subject of last modifier (NULL = system)
```

**Rationale:** GDPR Article 30 requires records of processing activities. `created_by` / `updated_by` store the Keycloak subject (not email — email can change, Keycloak subject is stable).

---

### Standard 3 — TIMESTAMP WITH TIME ZONE (TIMESTAMPTZ) for All Timestamps

```sql
-- ✅ Correct
created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()

-- ❌ Wrong — drops timezone, causes bugs on DST changes
created_at  TIMESTAMP NOT NULL DEFAULT NOW()

-- ✅ Date-only columns
issue_date  DATE NOT NULL
```

**Rationale:** PostgreSQL stores TIMESTAMPTZ internally in UTC. Plain TIMESTAMP has no timezone context — it causes silent bugs when servers run in non-UTC timezones or when daylight saving time changes.

---

### Standard 4 — Mandatory FK Index on Every Foreign Key Column

```sql
-- Every FK gets an index
CREATE INDEX idx_applications_user_id   ON applications(user_id);
CREATE INDEX idx_applications_event_id  ON applications(event_id);
CREATE INDEX idx_news_author_id         ON news(author_id);
```

**Rationale:** PostgreSQL does NOT automatically create indexes on FK columns. Without an index, `JOIN`, `WHERE fk_col = ?`, and referential integrity checks require full table scans.

---

### Standard 5 — Enum Storage as VARCHAR + Application Validation

```sql
-- ✅ VARCHAR with known valid values checked in service layer
status VARCHAR(50) NOT NULL DEFAULT 'PENDING'

-- ❌ Not used — harder to add new values in PostgreSQL
CREATE TYPE event_status AS ENUM ('UPCOMING', 'ACTIVE', 'FINISHED', 'CANCELLED');
```

**Rationale:** Adding a new value to a PostgreSQL ENUM type requires an `ALTER TYPE ... ADD VALUE` DDL statement which cannot be run inside a transaction in older PostgreSQL versions.

---

### Standard 6 — Soft-Delete for User-Facing Content Tables

```sql
deleted_at  TIMESTAMP WITH TIME ZONE,    -- NULL = active, timestamp = deleted
deleted_by  VARCHAR(255)                  -- Keycloak subject who performed deletion
```

**Tables requiring soft-delete:** `users`, `events`, `news`, `club_partners`

**GDPR erasure:** `DELETE` is replaced by pseudonymisation — set `email` to `deleted-{uuid}@rcb.deleted`, `first_name`/`last_name` to NULL.

---

### Standard 7 — Full-Text Search (GIN Index) on Searchable Content

```sql
-- Events: generated column + GIN index
ALTER TABLE events
    ADD COLUMN search_vector tsvector
    GENERATED ALWAYS AS (
        to_tsvector('simple', name || ' ' || COALESCE(description, ''))
    ) STORED;
CREATE INDEX idx_events_fts ON events USING GIN(search_vector);
```

**Rationale:** `ILIKE '%keyword%'` requires full table scan. GIN tsvector indexes enable O(log N) full-text search.

---

### Standard 8 — Keycloak Identity Model

```sql
keycloak_subject VARCHAR(255) NOT NULL UNIQUE  -- JWT 'sub' claim — stable Keycloak UUID
email            VARCHAR(255) NOT NULL UNIQUE  -- mirrored from Keycloak, indexed
```

**Rules:**
- `keycloak_subject` is the join key between Keycloak and local DB.
- No `password_hash`, `salt`, or `verification_token` columns in the rewrite.

---

### Standard 9 — Cascade Delete Strategy

| Relationship | FK Column | On Delete |
|---|---|---|
| users → users_events | users_events.user_id | CASCADE |
| events → applications | applications.event_id | CASCADE |
| users → news (author) | news.author_id | SET NULL |
| partners → advertisements | advertisements.partner_id | CASCADE |

---

### Standard 10 — Composite Unique Constraints for Concurrency Safety

```sql
-- Prevents duplicate event applications under concurrent load
ALTER TABLE applications
    ADD CONSTRAINT uq_applications_event_user UNIQUE (event_id, user_id);
```

**Rationale:** Service-layer uniqueness checks have a TOCTOU race condition under concurrent requests.

---

## Consequences

### Positive

- Consistent schema across all 41 stories — no per-team drift
- TIMESTAMPTZ prevents an entire class of timezone bugs in EU deployments
- Audit columns provide GDPR Article 30 compliance traceability
- FK indexes prevent table scan performance regressions as data grows
- Soft-delete enables GDPR right-to-erasure without destroying data integrity
- GIN full-text search enables search without Elasticsearch dependency

### Negative

- Backfill migrations needed for already-created tables (TIMESTAMP → TIMESTAMPTZ, add audit columns, add FK indexes)
- Soft-delete requires `@Where` or explicit predicates on all repository queries

---

## Alternatives Considered

### Option A: Keep TIMESTAMP (without timezone)
**Pros:** No migration needed.
**Cons:** Silent bugs on DST changes. Risk outweighs cost.

### Option B: PostgreSQL ENUM types for status columns
**Pros:** Database enforces valid values.
**Cons:** `ALTER TYPE ADD VALUE` cannot run inside a transaction in older PostgreSQL versions.

### Option C: Hard DELETE for user accounts
**Pros:** Simpler implementation.
**Cons:** Violates GDPR right-to-erasure requirements.

---

## References

- [PostgreSQL 16 Timestamp With Time Zone](https://www.postgresql.org/docs/16/datatype-datetime.html)
- [GDPR Article 30 — Records of Processing Activities](https://gdpr.eu/article-30-records-of-processing-activities/)
- [Spring Data JPA Auditing](https://docs.spring.io/spring-data/jpa/reference/auditing.html)
- [ADR Index](./)
