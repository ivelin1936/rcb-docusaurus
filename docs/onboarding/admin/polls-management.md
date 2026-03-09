---
id: polls-management
title: Polls Management
sidebar_label: Polls Management
sidebar_position: 10
---

# Polls Management

## Overview

Admins create and manage community polls with multiple-choice options and a closing deadline. Polls auto-close when their `closesAt` time passes (via nightly scheduler).

---

## Step-by-Step: Create a Poll

1. Navigate to **Admin → Polls** (`/admin/polls`).
2. Click **"Create Poll"**.
3. Fill in:
   - **Question** (e.g., "What should our next event be?")
   - **Options** (at least 2, e.g., "Drag Race", "Track Day", "Show & Shine")
   - **Closes At** (date + time for poll expiry)
4. Click **"Publish"**.
5. The poll is immediately visible to all authenticated members.

---

## Step-by-Step: Close a Poll Manually

1. Find the poll in the admin list.
2. Click **"Close Poll"** → sets `isActive = false` immediately.
3. The poll disappears from the member view.

---

## Scheduler

| Scheduler | Schedule | Description |
|-----------|----------|-------------|
| `PollAutoCloseScheduler` | Daily 00:30 UTC | Bulk sets `isActive = false` for expired polls |

---

## Security Notes

- **ADMIN only** for create / edit / delete / close polls.
- Poll **results** are visible to admins at all times (open or closed).
- Members only see **active polls** — closed polls are hidden.
- The `closesAt` timestamp is hidden from members (prevents gaming by voting right before close).

---

## QA Checklist

- [ ] Create poll → visible to members immediately
- [ ] Member votes → results visible to that member
- [ ] Poll passes closesAt → auto-closed within 24 hours
- [ ] Manually close poll → removed from member list immediately
- [ ] Delete poll → removed permanently
- [ ] Admin views closed poll results → results accessible even after close
