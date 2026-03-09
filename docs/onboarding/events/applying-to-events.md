---
id: applying-to-events
title: Applying to Events
sidebar_label: Applying to Events
sidebar_position: 2
---

# Applying to Events

## Overview

Authenticated members can apply to upcoming events. Applications go through an approval workflow: PENDING → ACCEPTED or REJECTED. Approved applicants can also request a car number for competition events.

---

## Application Workflow

```mermaid
sequenceDiagram
    participant M as Member
    participant FE as Frontend
    participant BE as Backend
    participant ADM as Admin

    M->>FE: Click "Apply" on event detail page
    FE->>BE: POST /api/v1/events/{eventId}/applications
    BE-->>FE: ApplicationEntity (status: PENDING)
    FE-->>M: "Application submitted"

    ADM->>BE: PATCH /api/v1/events/{eventId}/applications/{appId}\n{ status: "ACCEPTED" }
    BE->>BE: SendGrid email → Member notified
    BE-->>ADM: Updated application

    M->>FE: View event detail → "Your application: ACCEPTED"
    M->>FE: Click "Get Check-in QR"
    FE->>BE: GET /api/v1/qr/event-checkin/{eventId}
    BE-->>FE: QR PNG (15-min expiry JWT)
```

---

## Step-by-Step: Apply to an Event

1. Log in and navigate to an event detail page.
2. Click **"Apply to Event"**.
3. Your application is submitted with status **PENDING**.
4. Wait for the admin to review. You will receive an **email notification** when accepted or rejected.
5. View your application status on the event detail page.

---

## Step-by-Step: Withdraw Application

1. Navigate to the event detail page.
2. If your application is PENDING, click **"Withdraw Application"**.
3. The application is removed.

---

## Step-by-Step: Request a Car Number

For competition events, approved participants can request a car number:

1. After your application is ACCEPTED, the **Car Number** section appears on the event detail page.
2. Select the car from your garage that you will compete with.
3. Click **"Request Car Number"**.
4. The admin assigns a number. You will be notified when it is assigned and when payment is confirmed.

---

## Application Properties

| Property | Default | Description |
|----------|---------|-------------|
| `rcb.sendgrid.application-accepted-template-id` | *(SendGrid template ID)* | Email sent when application is accepted |
| `rcb.sendgrid.application-rejected-template-id` | *(SendGrid template ID)* | Email sent when application is rejected |

---

## Security Notes

- Only authenticated members (ROLE_USER+) can apply.
- A member **cannot apply to the same event twice** (unique constraint).
- Car number assignment is admin-only.

---

## QA Checklist

- [ ] Apply to event while logged in → status PENDING shown
- [ ] Apply again to same event → error (already applied)
- [ ] Apply while logged out → redirect to login
- [ ] Admin accepts application → member receives email, status updates to ACCEPTED
- [ ] Admin rejects application → member receives email, status updates to REJECTED
- [ ] Withdraw PENDING application → application removed
- [ ] Request car number after acceptance → request submitted
- [ ] Admin assigns car number → member sees assigned number
