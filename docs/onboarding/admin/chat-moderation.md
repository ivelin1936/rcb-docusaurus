---
id: chat-moderation
title: Chat Moderation
sidebar_label: Chat Moderation
sidebar_position: 9
---

# Chat Moderation

## Overview

Admins and Moderators can manage chat rooms, delete inappropriate messages, and ban disruptive users. All moderation actions propagate in real time to connected clients via STOMP broadcasts.

---

## Workflow

```mermaid
flowchart TD
    A[Admin visits /admin/chat] --> B[AdminChatPage\nRoom list + moderation tools]
    B --> C{Action}
    C -- Create room --> D[POST /api/v1/admin/chat/rooms\nslug, name, topic]
    C -- Update room --> E[PATCH /api/v1/admin/chat/rooms/:roomId]
    C -- Delete message --> F[DELETE /api/v1/admin/chat/messages/:messageId\nsoft-delete: isDeleted=true]
    F --> G[Broadcast MESSAGE_DELETED event\nto /topic/chat.{roomSlug}]
    G --> H[Connected clients remove message in real time]
    C -- Ban user --> I[POST /api/v1/admin/chat/bans\n{ userId, reason }]
    I --> J[ChatBanEntity created\nUser cannot send or receive]
    C -- Lift ban --> K[DELETE /api/v1/admin/chat/bans/:userId]
```

---

## Step-by-Step: Create a Chat Room

1. Navigate to **Admin → Chat** (`/admin/chat`).
2. Click **"Create Room"**.
3. Fill in: slug (URL-friendly ID), name, topic, room type (PUBLIC / MEMBERS_ONLY / MODEL_SPECIFIC).
4. Click **"Save"**.
5. The room is immediately available to members.

---

## Step-by-Step: Delete a Message

1. In the admin chat view, find the message to remove.
2. Click the **delete icon** next to the message.
3. The message is soft-deleted (`isDeleted = true`) and a `MESSAGE_DELETED` event is broadcast.
4. All connected users see the message replaced by "[Message removed]" in real time.

---

## Step-by-Step: Ban a User

1. Navigate to **Admin → Chat** → **Bans** tab.
2. Click **"Ban User"**.
3. Enter the user ID (or search by name/email) and provide a reason.
4. Click **"Confirm Ban"**.
5. The user is immediately prevented from sending messages.

---

## Step-by-Step: Lift a Ban

1. Navigate to the **Bans** tab in Admin Chat.
2. Find the banned user.
3. Click **"Lift Ban"**.
4. The `ChatBanEntity.liftedAt` is set — the user can chat again.

---

## Security Notes

- **ADMIN / ROOT_ADMIN**: create rooms, ban users.
- **ADMIN / MODERATOR**: delete messages, manage bans.
- Soft-deleted messages are filtered from new clients connecting — they never receive deleted content.
- Bans are **user-level** (not IP-based) — a banned user cannot bypass by opening a new tab.

---

## QA Checklist

- [ ] Create room → appears in member chat room list
- [ ] Delete message → instantly removed from all connected clients' views
- [ ] Ban user → banned user gets error when trying to send message
- [ ] Lift ban → user can send messages again
- [ ] Access admin chat endpoints as MODERATOR → can delete messages but not create rooms
