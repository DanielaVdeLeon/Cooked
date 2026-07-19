# Claude Code Kickoff Prompt — Cooked

Copy the prompt below into Claude Code from inside an empty repo folder, with this handoff package (`design_handoff_cooked_app/`) placed in the repo root.

---

I'm building **Cooked**, a public, mobile-first recipe library. This repo contains a handoff package at `design_handoff_cooked_app/`:

- `Cooked Product Documentation.md` — the full product requirements: user types (public visitor / editor / admin), public-access rules, recipe structure, favourites behaviour, account settings, required interface states, and acceptance criteria (AC-PUB, AC-AUTH, AC-FAV, AC-ACC, AC-SEC, AC-SEO, AC-E2E). Treat this as the requirements source of truth.
- `design_reference/` — high-fidelity interactive HTML prototypes: `Cooked Website.dc.html` (the full app: homepage, recipe page, add/edit form, login/reset, settings, favourites, notes, toasts, confirm dialogs), `Cooked Design System Docs.dc.html` (colours, type, surfaces, buttons, tag patterns, motion & interactivity specs, access-control table, asset rules), `Cooked Breakpoint Boards.dc.html` (responsive layouts), plus `assets/` (logo, illustrations, textures — production-ready, copy them into the app). These are **design references, not production code**: open them in a browser, recreate them faithfully in the real stack. Match colours, type (Young Serif + Instrument Sans), spacing, textures, hard offset shadows, and motion exactly — this is a hifi handoff.

## Stack

- **Next.js** (App Router, TypeScript) deployed on **Vercel**
- **Supabase** for Postgres, auth, storage (recipe photos), and Row Level Security
- **GitHub** repo with CI (lint, typecheck, tests) and Vercel preview deployments

## How I want to work

1. Start by reading the product doc and opening the prototypes, then propose: data model (recipes, ingredients, instructions, tags, notes, favourites, profiles/roles), RLS policy plan, route map, and a milestone plan. **Wait for my approval before scaffolding.**
2. Build in vertical slices, one PR-sized milestone at a time, in roughly this order:
   - Scaffold + design tokens/fonts/textures + shared UI primitives from the design system
   - Public read path: homepage feed, search/filter/sort, recipe page, empty states, SEO (stable URLs, metadata)
   - Auth: login, logout, password reset (token-gated email), session handling; editor role via invite/admin only — public signup must not grant editing
   - Editor CRUD: add/edit/delete recipe (same form), image upload to Supabase Storage, tag combobox, unsaved-changes warning
   - Notes: public read, editor create/edit/delete scoped to author (post-it presentation)
   - Favourites: per-user star, "Favourites first" sort (most→least recently favourited, order snapshotted when the sort is selected), "Clear favourites" with confirmation
   - Account settings: name/email/password (re-verify current password server-side), delete account with confirmation
   - Polish: tactile motion (whole-card hover lift + title underline, staggered desktop grid fades for initial/filter/search/sort changes, physical button press states, mobile scroll fade, reduced-motion support), toasts, responsive breakpoints per the boards
3. Every protected mutation must be authorised **server-side** (RLS + route handlers) — hiding UI is never the security boundary. AC-SEC-001 applies to every endpoint.
4. Accessibility target is WCAG 2.2 AA: keyboard nav, focus states, labels, 44px touch targets, reduced motion.
5. Write tests against the acceptance criteria IDs in the product doc (unit for authorisation rules, e2e for AC-E2E-001..003), and check them off as you go.
6. Ask me before adding any dependency, page, or feature that isn't in the product doc.

Set up the GitHub repo and Vercel/Supabase wiring first (I'll provide credentials/env vars when you tell me what's needed), then begin milestone 1.
