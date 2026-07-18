# Cooked

A public, mobile-first recipe library: browse, search, and cook without an account; invited editors manage the content. Paper-scrapbook visual language — textured cards, hard offset shadows, Young Serif + Instrument Sans.

**Requirements source of truth:** [`design_handoff_cooked_app/Cooked Product Documentation.md`](design_handoff_cooked_app/Cooked%20Product%20Documentation.md) (acceptance criteria AC-PUB / AC-AUTH / AC-FAV / AC-ACC / AC-SEC / AC-SEO / AC-E2E).
**Visual source of truth:** the interactive prototypes in [`design_handoff_cooked_app/design_reference/`](design_handoff_cooked_app/design_reference/) — open the `.dc.html` files in a browser.

## Stack

- **Next.js** (App Router, TypeScript) on **Vercel**
- **Supabase** — Postgres, Auth, Storage, Row Level Security
- **Vitest** (unit) + **Playwright** (e2e, from milestone 2) in GitHub Actions CI

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in the Supabase keys
npm run dev
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server at localhost:3000 |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest unit tests |
| `npm run build` | Production build |

## Environment variables

| Variable | Where | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | client + server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client + server | Public anon key (RLS enforced) |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | Account deletion / admin tasks |
| `NEXT_PUBLIC_SITE_URL` | client + server | Canonical origin for SEO + auth redirects |

Set the same variables in Vercel (Production + Preview). The Supabase MCP server is configured in [.mcp.json](.mcp.json) for agent-driven migrations.

## Security model

Every protected mutation is authorised **server-side**: route handlers verify the session and editor role, and Postgres RLS policies are the second, independent lock (AC-SEC-001). Hiding UI is never the security boundary. All user input is validated server-side with length limits before it touches the database; queries only ever go through the parameterised Supabase client.

## Milestones

- [x] **M0** — repo, CI, Supabase MCP wiring
- [x] **M1** — design tokens, fonts, textures, shared UI primitives
- [x] **M2** — public read path: feed, search/filter/sort, recipe page, SEO
- [x] **M3** — auth: login, logout, password reset, viewer-role signup
- [x] **M4** — editor CRUD: recipe form, image upload, tag combobox
- [x] **M5** — notes (post-its), author-scoped editing
- [ ] **M6** — favourites + snapshot-ordered “Favourites first”
- [ ] **M7** — account settings, delete account
- [ ] **M8** — motion polish, breakpoints, a11y audit, full e2e suite
