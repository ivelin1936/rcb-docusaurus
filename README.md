# Renault Club Bulgaria — Documentation

[![Deploy to GitHub Pages](https://github.com/ivelin1936/rcb-docusaurus/actions/workflows/deploy.yml/badge.svg)](https://github.com/ivelin1936/rcb-docusaurus/actions/workflows/deploy.yml)

Official technical documentation for the **Renault Club Bulgaria** platform.

**Live site:** https://ivelin1936.github.io/rcb-docusaurus/

> **One-time setup:** Enable GitHub Pages at [repo Settings → Pages → Source → GitHub Actions](https://github.com/ivelin1936/rcb-docusaurus/settings/pages)

---

## Contents

| Section | Description |
|---------|-------------|
| [Overview](docs/overview/architecture.md) | Architecture, tech stack, domain model |
| [BE Setup](docs/guides/be-setup.md) | Spring Boot backend local development guide |
| [FE Setup](docs/guides/fe-setup.md) | React frontend local development guide |
| [ADRs](docs/adr/index.md) | Architecture Decision Records |

---

## Local Development

**Prerequisites:** Node.js 20+ LTS

```bash
npm install
npm start          # Dev server → http://localhost:3000
```

**Production build:**

```bash
npm run build      # Outputs to ./build/
npm run serve      # Serve built site locally
```

> Note: Local search only works in the production build (`npm run build && npm run serve`).

---

## Docker

```bash
# Build and run with Docker Compose
docker compose up --build

# Site available at http://localhost:8080
```

---

## Adding Documentation

1. Create or edit a `.md` / `.mdx` file in `docs/`
2. Run `npm start` to preview
3. Commit and push to `main` — GitHub Actions deploys automatically

---

## Repositories

| Repo | Description |
|------|-------------|
| [`renault-club-bulgaria`](https://github.com/ivelin1936/Renault-Club-Bulgaria) | Spring Boot 3.5.x backend |
| [`renault-club-bulgaria-fe`](https://github.com/ivelin1936/renault-club-bulgaria-fe) | React 19 frontend |
| [`rcb-docusaurus`](https://github.com/ivelin1936/rcb-docusaurus) | This documentation site |
