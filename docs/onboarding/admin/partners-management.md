---
id: partners-management
title: Partners Management
sidebar_label: Partners Management
sidebar_position: 8
---

# Partners Management

## Overview

Admins manage the list of official club partners (sponsors). Partners are categorized by tier (BRONZE / SILVER / GOLD) and displayed across the platform.

---

## Step-by-Step: Add a Partner

1. Navigate to **Admin → Partners**.
2. Click **"Add Partner"**.
3. Fill in: name, tier (BRONZE / SILVER / GOLD), website URL, optional description.
4. Click **"Save"** then upload the partner logo.
5. The partner appears immediately on the Partners page and the home page Partners Strip.

---

## Step-by-Step: Update Partner Logo

1. Open the partner in admin view.
2. Click **"Upload Logo"**.
3. Select an image file.
4. The logo is uploaded to Cloudinary and updated across the platform.

---

## Application Properties

| Property | Default | Description |
|----------|---------|-------------|
| `cloudinary.cloud-name` | `renaultclubbulgaria` | Partner logo CDN |

---

## Security Notes

- **ADMIN only** for partner management.
- Logos served via Cloudinary CDN — no binary data in the database.

---

## QA Checklist

- [ ] Create GOLD partner → appears prominently in partners list
- [ ] Upload logo → logo visible on partner card
- [ ] Edit tier → tier badge updates
- [ ] Delete partner → removed from all partner displays
