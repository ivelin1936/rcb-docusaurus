---
id: adr-template
title: ADR Template
sidebar_label: ADR Template
tags: [adr, template]
---

import { StatusBadge } from '@site/src/components';

# ADR-NNN — Decision Title

> Copy this file to `docs/adr/adr-NNN-short-title.md` and fill in all sections.
> See the [ADR Index](../adr) for naming conventions and the ADR lifecycle.

| Field | Value |
|-------|-------|
| **Date** | YYYY-MM-DD |
| **Status** | <StatusBadge status="Proposed" /> |
| **Proposer** | @agent-name |
| **Supersedes** | — (or ADR-NNN if this replaces another) |
| **Superseded By** | — (filled in when a newer ADR replaces this) |

---

## Context

<!--
What is the situation or problem that prompted this decision?
- What forces are at play?
- What constraints exist (cost, timeline, team capability, existing stack)?
- What happens if we do nothing?

Keep this section factual and brief (3–8 sentences).
-->

## Decision Drivers

<!--
List the key requirements and concerns that shaped the decision.
Use bullet points. Example:
- Must work within free-tier GitHub infrastructure
- Must not require a managed cloud database (VPS-only deployment)
- Must support soft-delete at the application layer
-->

- Driver 1
- Driver 2
- Driver 3

---

## Considered Options

<!--
List all viable alternatives that were evaluated.
For each option: give a 1-sentence summary, then pros and cons.
-->

### Option A: [Name]

**Summary:** One sentence describing this option.

**Pros:**
- Pro 1
- Pro 2

**Cons:**
- Con 1
- Con 2

### Option B: [Name]

**Summary:** One sentence describing this option.

**Pros:**
- Pro 1

**Cons:**
- Con 1

---

## Decision Outcome

**Chosen option:** Option A — [Name]

**Rationale:** Why this option over the others? Reference the decision drivers.

### Positive Consequences

- Consequence 1
- Consequence 2

### Negative Consequences / Trade-offs

- Trade-off 1 — mitigation: ...
- Trade-off 2 — mitigation: ...

---

## Implementation Notes

<!--
Optional: specific guidance for the implementing agent.
- Which story/task implements this decision?
- Any gotchas or constraints for the implementer?
- Links to reference docs or examples.
-->

Related story: NNN_story-name
Implementation PR must include: `Implements ADR-NNN` in the PR description.

---

## References

<!--
Links to docs, RFCs, blog posts, or other ADRs that informed this decision.
-->

- [Reference 1](https://example.com)
- Related: ADR-NNN — replace with a link to the related ADR once it exists
