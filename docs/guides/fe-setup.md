---
id: fe-setup
title: Frontend Local Development Setup
sidebar_label: FE Setup (React)
tags: [guide, frontend, react, vite, setup]
---

# Frontend Local Development Setup

Step-by-step guide to run the Renault Club Bulgaria **React frontend** locally.

**Repository:** [`ivelin1936/renault-club-bulgaria-fe`](https://github.com/ivelin1936/renault-club-bulgaria-fe)

:::info Prerequisites
The **backend must be running** before starting the frontend. Follow the [BE Setup Guide](./be-setup) first.
:::

---

## Prerequisites

| Tool | Version | Download |
|------|---------|----------|
| Node.js | 20+ LTS | https://nodejs.org |
| npm | 10+ | bundled with Node.js |
| Git | 2.x | https://git-scm.com |

---

## 1. Clone the Repository

```bash
git clone https://github.com/ivelin1936/renault-club-bulgaria-fe.git
cd renault-club-bulgaria-fe
git checkout master    # main development branch
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```bash
# Keycloak SSO (must match the Keycloak realm running in Docker)
VITE_KEYCLOAK_URL=http://localhost:8180
VITE_KEYCLOAK_REALM=rcb
VITE_KEYCLOAK_CLIENT_ID=rcb-frontend

# Backend API
VITE_API_BASE_URL=http://localhost:8080
```

:::tip Vite proxy
Vite dev server automatically proxies `/api` → `http://localhost:8080` (configured in `vite.config.ts`).
You only need `VITE_API_BASE_URL` for direct API calls outside the proxy.
:::

---

## 4. Run the Development Server

```bash
npm run dev
```

Frontend starts on **http://localhost:5173**

Open your browser and click "Login" — it will redirect to Keycloak at `http://localhost:8180`.

---

## 5. Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server (port 5173) |
| `npm run build` | Production build (outputs to `dist/`) |
| `npm run lint` | ESLint check |
| `npm run type-check` | TypeScript type check |
| `npm run test` | Vitest unit tests |
| `npm run test:coverage` | Unit tests with coverage report |
| `npm run e2e` | Playwright E2E tests (backend + frontend must be running) |

---

## 6. Tech Stack

| Concern | Technology |
|---------|-----------|
| Framework | React 19 |
| Language | TypeScript 5 — strict mode |
| Build | Vite 6 — instant HMR, Rollup prod build |
| UI | Material UI v6 — `sx` prop, theme tokens |
| Routing | React Router v7 — `createBrowserRouter`, loaders |
| Server state | TanStack Query v5 — `useQuery`, `useMutation` |
| Client state | Zustand v5 — UI/client state only |
| Forms | React Hook Form v7 + Zod (schema + `z.infer<>`) |
| Auth | `@react-keycloak/web` + `keycloak-js` → JWT Bearer token |
| Custom auth UI | Keycloakify v11 — React components in Keycloak login UI |
| HTTP client | Axios — Bearer interceptor, 401 → `keycloak.login()` |
| Unit tests | Vitest + React Testing Library + MSW v2 |
| E2E tests | Playwright |
| Linting | ESLint 9 flat config + `@typescript-eslint` |
| Formatting | Prettier 3 |

---

## 7. Project Structure

```
src/
├── app/                    # App shell: router, providers, Keycloak init
│   ├── App.tsx             # Root: ReactKeycloakProvider > QueryClientProvider > ThemeProvider > RouterProvider
│   ├── keycloak.ts         # Keycloak instance (VITE_KEYCLOAK_URL/REALM/CLIENT_ID)
│   └── router.tsx          # createBrowserRouter — all routes
│
├── features/               # One folder per domain
│   └── {feature}/
│       ├── api/            # {feature}.api.ts (axios calls) + {feature}.queries.ts (TanStack hooks)
│       ├── components/     # Feature UI components
│       ├── hooks/          # Feature-specific custom hooks
│       ├── stores/         # Zustand slice
│       ├── types/          # TypeScript types
│       └── index.ts        # Public API
│
├── shared/                 # Cross-feature reusables
│   ├── components/         # Generic UI (Button, Modal, DataTable)
│   ├── hooks/              # Generic hooks (useAuth, useDebounce)
│   ├── stores/             # Global Zustand stores (auth, notifications)
│   ├── utils/              # apiClient.ts (Axios + Bearer), formatDate, parseError
│
├── theme/                  # MUI createTheme — primary #fcd434, secondary #1a1a1a
│
├── keycloak-theme/         # Keycloakify v11 — KcApp, Login, Register, etc.
│
└── test/                   # Vitest setup, renderWithProviders, MSW handlers
```

---

## 8. Routes

| Path | Description |
|------|-------------|
| `/` | Homepage |
| `/events` | Events list |
| `/events/:id` | Event detail + comments |
| `/news` | News list |
| `/news/:id` | News detail + comments |
| `/gallery` | Photo galleries |
| `/campaigns` | Club campaigns |
| `/cars` | Garage / car management |
| `/membership` | Membership card |
| `/partners` | Club partners |
| `/assistance` | Club assistance (Leaflet map) |
| `/profile` | User profile |
| `/admin` | Admin panel |

---

## 9. Features

### Authentication
- Keycloak SSO with PKCE flow
- JWT Bearer token injected via Axios interceptor
- Token refresh via `@react-keycloak/web`
- Custom login/register UI via Keycloakify v11

### Theme
- MUI v6 with Renault brand colors: primary `#fcd434` (yellow), secondary `#1a1a1a` (dark)
- Dark/light mode support

### Events
- Paginated card grid with status chips (UPCOMING / ACTIVE / FINISHED / CANCELLED)
- Event detail with apply button (authenticated users only)
- Comment section with 2-level nesting

### Garage
- Personal car list with maintenance alerts panel
- Vehicle Checks Modal — calls backend `GET /api/v1/garage/{carId}/checks`
- Shows МВР, АПИ, ГО, Виньетка check status

### Club Assistance
- Leaflet map (OpenStreetMap tiles) showing nearby members
- Location sharing toggle + radius slider (5/10/25/50 km)
- 429 rate limit → Snackbar; 403 (no membership) → banner

---

## 10. Troubleshooting

| Problem | Solution |
|---------|----------|
| **Blank page after login** | Check DevTools → Console for Keycloak errors; verify `VITE_KEYCLOAK_URL` |
| **401 on API calls** | Token may have expired; Keycloak must be running |
| **`/api` calls fail with CORS** | Backend must be running on `localhost:8080` |
| **`npm install` fails** | Use Node.js 20+ LTS: `node -v` |
| **Keycloak login loop** | Verify `VITE_KEYCLOAK_CLIENT_ID=rcb-frontend` matches Keycloak realm config |
| **Map not loading** | Check browser console; Leaflet CSS must be imported in `main.tsx` |
