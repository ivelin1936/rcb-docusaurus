# rcb-docusaurus — Documentation Site

This is the **Docusaurus 3.x documentation site** for the Renault Club Bulgaria platform.

---

## Project Purpose

Single source of truth for all RCB technical documentation:
- Architecture Decision Records (ADRs)
- Developer setup guides (BE + FE)
- Architecture overview
- API reference (future)

**Live site:** https://ivelin1936.github.io/rcb-docusaurus/

---

## Key Rules

- **Base branch:** `main` — always PR into `main`
- **NEVER commit directly to `main`**
- ADRs are **immutable once Accepted** — create a new ADR to supersede
- All docs must be in English (technical content) or have English as the primary language

---

## Available Agents

| Agent | Role |
|-------|------|
| `@tech-writer` | Write/migrate ADRs, guides, runbooks, API docs |
| `@frontend` | Customize Docusaurus theme, components, sidebar |
| `@devops` | Docker, GitHub Actions, deployment pipeline |
| `@architect` | Architecture review, approve ADRs |
| `@reviewer` | Review documentation quality and accuracy |

---

## Content Structure

```
docs/
├── overview/        ← Architecture overview, tech stack
├── guides/          ← BE Setup, FE Setup, deployment guides
├── adr/             ← Architecture Decision Records
└── (future)
    ├── reference/   ← API reference
    └── tutorials/   ← Developer tutorials
```

---

## Local Development

```bash
npm install
npm start         # http://localhost:3000
npm run build     # Production build (also checks for broken links)
npm run serve     # Serve production build locally
```

---

## Adding Content

1. Create `.md` file in the appropriate `docs/` subdirectory
2. Add Docusaurus frontmatter: `id`, `title`, `sidebar_label`, `tags`
3. Update `sidebars.ts` if adding a new section
4. Run `npm run build` to verify no broken links
5. Commit and push → GitHub Actions deploys to GitHub Pages
