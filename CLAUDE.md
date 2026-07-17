@AGENTS.md

# Cooked — project rules

- `design_handoff_cooked_app/Cooked Product Documentation.md` is the requirements source of truth; the `.dc.html` prototypes in `design_handoff_cooked_app/design_reference/` are the visual source of truth. Match them exactly (colours, Young Serif + Instrument Sans, textures, hard offset shadows, motion).
- Design tokens live in `app/globals.css` as CSS custom properties; components use CSS Modules. No Tailwind, no UI libraries.
- Every protected mutation is authorised server-side (session + editor-role check in the handler, RLS as the independent second lock). Hiding UI is never the security boundary (AC-SEC-001).
- All user input is validated server-side (zod, with length limits — e.g. recipe titles); only parameterised Supabase queries; validate source URLs (http/https) and uploads (type/size).
- Accessibility target WCAG 2.2 AA: keyboard nav, visible focus (2px `--primary` outline), labels, 44px touch targets, `prefers-reduced-motion` support.
- Tests reference acceptance-criteria IDs from the product doc. Unit tests: Vitest (`npm test`). CI runs lint, typecheck, tests.
- Work in PR-sized milestones (see README checklist). Ask before adding any dependency, page, or feature not in the product doc.
- Public signup grants the `viewer` role only; editor/admin are granted by an administrator. Recipe deletion is a hard delete (MVP decision).
