---
id: membership-cards
title: Membership Cards
sidebar_label: Membership Cards
sidebar_position: 11
---

# Membership Cards

## Overview

Admins issue, manage, and revoke digital membership cards for club members. Each card has a tier (NORMAL / SILVER / GOLDEN) and an expiry date. Members use their card QR code as proof of membership.

---

## Workflow

```mermaid
flowchart TD
    A[Admin visits /admin/memberships] --> B[List all membership cards\nGET /api/v1/memberships]
    B --> C{Action}
    C -- Issue card --> D[POST /api/v1/memberships/issue\n{ userId, tier, expiresAt }]
    D --> E[MembershipCardEntity created\nrandom UUID token assigned]
    C -- Update card --> F[PATCH /api/v1/memberships/:cardId\ntier or expiresAt]
    C -- Revoke card --> G[DELETE /api/v1/memberships/:cardId\nrevokedAt timestamp set]
    G --> H[Member's QR verification shows REVOKED]
```

---

## Membership Tiers

| Tier | Description | Typical Use |
|------|-------------|-------------|
| NORMAL | Standard member | Default for new members |
| SILVER | Premium member | Active contributors |
| GOLDEN | VIP member | Long-standing or high-KT members |

---

## Step-by-Step: Issue a Membership Card

1. Navigate to **Admin → Memberships** (`/admin/memberships`).
2. Click **"Issue Card"**.
3. Search for the member by name/email.
4. Select: tier, expiry date.
5. Click **"Issue"**.
6. The member can immediately generate their QR card at `/membership`.

---

## Step-by-Step: Revoke a Card

1. Find the member's active card in the admin list.
2. Click **"Revoke"** → confirm the dialog.
3. The `revokedAt` timestamp is set.
4. When anyone scans the member's QR, the verification page shows **"REVOKED"**.

---

## Admin QR Management Page

The **Admin QR Page** (`/admin/qr`) provides a broader view of all QR-related entities:
- List all membership cards with status (active / expired / revoked)
- Filter by tier or status
- Export as PDF (using `usePdfExport` hook)

---

## Application Properties

| Property | Default | Description |
|----------|---------|-------------|
| `rcb.membership.tiers` | `[NORMAL, SILVER, GOLDEN]` | Available tier configurations |

---

## Security Notes

- **ADMIN only** can issue, update, and revoke cards.
- Each card has a **random UUID token** (not sequential) — cannot be guessed or enumerated.
- The public verification endpoint exposes only: member name, tier, validity. No PII beyond name.

---

## QA Checklist

- [ ] Issue SILVER card to member → member can generate QR
- [ ] Member verifies their QR → shows correct name, tier, expiry
- [ ] Revoke card → verification page shows REVOKED
- [ ] Issue new card after revocation → new card works
- [ ] Expired card → verification shows EXPIRED
- [ ] List all cards → paginated with status filter working
