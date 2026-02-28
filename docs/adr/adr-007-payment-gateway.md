---
id: adr-007-payment-gateway
title: "ADR-007: Payment Gateway Selection"
sidebar_label: "ADR-007: Payment Gateway"
tags: [adr, payments, epay, deferred]
---

# ADR-007: Payment Gateway Selection for Membership Fees

| Field    | Value |
|----------|-------|
| Status   | ⏳ Research Complete — Decision Deferred |
| Date     | 2026-02-25 |
| Author   | @architect |
| Story    | 030 — Club Member Page Enhancement |

---

## Context

Story 030 requires researching Bulgarian-compatible payment gateways for future online membership fee collection. The club currently processes membership payments manually (bank transfer, admin marks as paid).

---

## Options Evaluated

| Gateway | Bulgarian Cards | Setup Requirements | Transaction Fee | Notes |
|---------|----------------|--------------------|-----------------|-------|
| ePay.bg | All BG banks + Visa/MC | Bulgarian company/organisation registration + ePay.bg merchant agreement | 1.8–2.5% | Most popular in Bulgaria; supports online banking, debit cards |
| Stripe | International Visa/MC | Simple API, no company required | 1.5% + €0.25 | Limited BG local bank support; best for international cards |
| PayPal | International | Simple account setup | 3.4% + fixed fee | High fees, poor UX for Bulgarian users; declining usage |

---

## Decision

**Deferred.** ePay.bg is the recommended gateway for the Bulgarian market because:
1. Highest local bank coverage (all major BG banks)
2. Most recognisable brand for Bulgarian users
3. Lower fee than PayPal

However, integration requires:
1. Bulgarian company or registered association account
2. ePay.bg merchant registration and agreement
3. Implementation estimated at 13 story points (separate story)

Stripe is the recommended fallback if ePay.bg registration proves too complex.

---

## Current State

Online membership payments remain **manual** (admin-processed via bank transfer).
Admin marks payments as received and activates membership cards manually.

When the business requirement is formally confirmed, create a new story for payment gateway implementation using this ADR as input.

---

## References

- Story 030: Club Member Page Enhancement
- Future story: Online Membership Payment (not yet created)
- [ePay.bg](https://www.epay.bg/)
- [ADR Index](./)
