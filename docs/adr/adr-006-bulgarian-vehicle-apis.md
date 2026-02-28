---
id: adr-006-bulgarian-vehicle-apis
title: "ADR-006: Bulgarian Vehicle API Integration Strategy"
sidebar_label: "ADR-006: Vehicle APIs"
tags: [adr, integration, feign, resilience4j, accepted]
---

# ADR-006: Bulgarian Vehicle API Integration Strategy

| Field    | Value |
|----------|-------|
| Status   | ✅ Accepted |
| Date     | 2026-02-25 |
| Author   | @architect |
| Deciders | @architect, @ivko |

---

## Context

Story 020 requires integration with 4 Bulgarian government / semi-official services so club members can check their vehicle obligations without leaving the RCB app:

| Service | Domain |
|---------|--------|
| МВР (Ministry of Interior) | Unpaid traffic fines |
| АПИ (Road Infrastructure Agency) | Annual road tax (винетка тол) |
| ГО (Civil Liability Insurance) | Third-party liability insurance validity |
| Виньетка (АППИ Electronic Vignette) | Electronic vignette validity |

---

## Research Findings

### 1. МВР — Unpaid Traffic Fines

| Item | Finding |
|------|---------|
| Public REST API | **None.** МВР provides only an HTML form. |
| Web scraping | Legally risky — МВР prohibits automated access. |
| Decision | **UNAVAILABLE** — return a placeholder with a direct link to `e-uslugi.mvr.bg`. |

### 2. АПИ — Road Tax

| Item | Finding |
|------|---------|
| Public REST API | Yes — documented at `api.bg` |
| Authentication | Requires merchant/company registration + API key |
| Request | `GET /check?plate={licensePlate}` |
| Decision | **IMPLEMENT** — Feign client with `@CircuitBreaker` fallback |

### 3. ГО — Civil Liability Insurance

| Item | Finding |
|------|---------|
| Public REST API | Semi-official endpoint at `gar.bg` |
| Authentication | None required for public check endpoint |
| Decision | **IMPLEMENT** — Feign client with `@CircuitBreaker` fallback |

### 4. Виньетка — Electronic Vignette

| Item | Finding |
|------|---------|
| Public REST API | Yes — АППИ public check service |
| Authentication | None required |
| Decision | **IMPLEMENT** — Feign client with `@CircuitBreaker` fallback |

---

## Decision

Implement **3 of 4** checks via OpenFeign clients with Resilience4j circuit breakers:

| Service | Implementation |
|---------|---------------|
| МВР | ❌ UNAVAILABLE — hardcoded result with link to `e-uslugi.mvr.bg` |
| АПИ | ✅ `ApiCheckClient` Feign interface — returns UNAVAILABLE until merchant credentials added |
| ГО | ✅ `GoCheckClient` Feign interface — circuit breaker fallback to UNAVAILABLE |
| Виньетка | ✅ `VignetteCheckClient` Feign interface — circuit breaker fallback to UNAVAILABLE |

All 4 checks run in **parallel** using Java 21 virtual threads (`Executors.newVirtualThreadPerTaskExecutor()`).

Results are **cached 30 minutes per carId** via Caffeine (keyed on `carId` UUID to avoid PII in cache keys).

**Membership gate:** The service layer checks `MembershipService.isMemberActive()` before executing any external call. Non-members receive 403 Forbidden.

---

## Consequences

### Positive

- 3 of 4 checks are functional
- МВР is UNAVAILABLE with a helpful link
- Circuit breakers prevent cascading failures
- PII (license plate) is never stored in cache keys

### Negative

- АПИ requires merchant registration before returning live data

### Risk

- ГО endpoint (`gar.bg`) is undocumented; may break if Guarantee Fund changes its API. Mitigated by circuit breaker + UNAVAILABLE fallback.

---

## References

- Story 020: Bulgarian Vehicle Checks implementation
- [Resilience4j CircuitBreaker](https://resilience4j.readme.io/docs/circuitbreaker)
- [Spring Cloud OpenFeign](https://docs.spring.io/spring-cloud-openfeign/docs/current/reference/html/)
- [ADR Index](./)
