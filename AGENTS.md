# AGENTS.md

Contract for AI agents (Claude Code, Augment, Cursor, etc.) working in this repo. Read this before touching code.

## Stack

- **Framework:** Next.js 16 (App Router) + React 19
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS v4 + shadcn/ui (Radix primitives)
- **Package manager:** pnpm (lockfile is `pnpm-lock.yaml` — do not introduce npm/yarn lockfiles)
- **Node:** Use the version pinned by Next 16 (Node 20+; Node 24 LTS preferred on Vercel)
- **Deploy target:** Vercel

## Commands

Only these scripts exist in `package.json`. Do not invent others.

| Command | Purpose |
| --- | --- |
| pnpm dev | Start dev server on http://localhost:3000 |
| pnpm build | Production build (also surfaces TS + lint errors) |
| pnpm start | Run the built app |
| pnpm lint | ESLint (Next core-web-vitals + TypeScript rules) |
| pnpm format | Prettier write across the repo |
| pnpm format:check | Prettier check (used by pnpm check) |
| pnpm test | Vitest unit/component tests (one-shot run) |
| pnpm test:watch | Vitest watch mode |
| pnpm test:e2e | Playwright smoke tests (chromium, boots pnpm dev automatically) |
| pnpm check | One-shot gate: lint + format:check + tsc --noEmit + test + build |

`pnpm check` is the single gate to know whether your work is ready. It runs `lint && format:check && tsc --noEmit && test && build`. If it exits 0 on a clean tree, you're good. E2E is intentionally **excluded** from `pnpm check` because it's too slow for the inner loop — run `pnpm test:e2e` separately for UI changes (CI runs it on PRs).

Pre-commit hooks live in the tracked `.githooks/` directory and are wired up automatically — the `prepare` lifecycle runs `git config core.hooksPath .githooks`, so hooks fire from any worktree or fresh clone after `pnpm install`. On commit, staged JS/TS files run `eslint --fix` then `prettier --write`; staged JSON/MD/CSS/YAML run `prettier --write`. If hooks aren't firing, re-run `pnpm install` or set `core.hooksPath` manually with `git config core.hooksPath .githooks`.

## Repository layout

```
src/
  app/                 Next.js App Router routes
    api/               Route handlers (availability, booking-confirmation, checkout, contact, pricing)
    booking/           /booking page
    layout.tsx         Root layout
    page.tsx           Home page
  components/
    sections/          Page sections (hero, units, booking, reviews, area-guide, house-rules, contact)
    ui/                shadcn/ui primitives — DO NOT hand-edit; regenerate via `pnpm dlx shadcn@latest add ...`
    *.tsx              App-specific shared components
  data/                Static content (units, reviews, area-guide, house-rules, photos, navigation)
  hooks/               Client hooks (use-availability, use-pricing) — SWR-based
  lib/                 Server/shared utilities (stripe, pricelabs, ical-parser, fonts, utils)
public/                Static assets (photos, icons)
```

Path alias: `@/*` → `src/*`.

## Conventions

### Server vs Client components

- Default to **Server Components**. Only add `"use client"` when you need state, effects, browser APIs, or event handlers.
- API keys, Stripe secret, Resend, PriceLabs, iCal URLs — server-only. Never import `src/lib/stripe.ts`, `src/lib/pricelabs.ts`, or any module that reads `process.env.*_SECRET_*` / `*_API_KEY` from a client component.
- Data fetching for guest-facing UI (availability, pricing) goes through `src/app/api/*` route handlers, consumed by the SWR hooks in `src/hooks/`.

### React 19 specifics

- `useCallback` and `useMemo` are **banned** by ESLint (`no-restricted-imports`). The React 19 compiler handles memoization. Use plain functions and values.
- shadcn/ui files under `src/components/ui/**` are exempt from the project's lint overrides — leave them as generated.

### Environment variables

Public (browser-exposed) vars are prefixed `NEXT_PUBLIC_`. Everything else is server-only. The full list of expected env vars lives in `TODO.md` under "Set env variables on Vercel". Pull local values with `vercel env pull` once the project is linked. Never commit `.env*` files (already in `.gitignore`).

### Styling

- Tailwind v4 (PostCSS plugin). Global styles in `src/app/globals.css`.
- Compose with `cn()` from `src/lib/utils.ts` (clsx + tailwind-merge).
- Use shadcn/ui components from `src/components/ui` over hand-rolling.

### Data & content

- Static content (unit descriptions, reviews, area guide, house rules) lives in `src/data/*.ts`. Edit those files rather than hardcoding strings in components.
- Photos go under `public/photos/<unit>/` and are referenced from `src/data/units.ts` / `src/data/photos.ts`.

## Definition of done (agent checklist)

Before claiming a task is complete:

1. **Gate passes:** `pnpm check` exits 0 (this runs lint, format:check, tsc --noEmit, vitest, and build in one shot — the single source of truth for "am I done?").
2. **E2E smoke passes for UI changes:** `pnpm test:e2e` runs clean. This is **required** for any change that touches `src/app/**`, `src/components/**`, or page-level styling. Add or update a test in `e2e/` if the change introduces a new flow.
3. **Manual smoke for UI changes:** start `pnpm dev`, exercise the changed flow in a browser, confirm no console errors. If you cannot run a browser, say so explicitly — do not claim verification you didn't do.
4. **No scope creep:** changes are limited to what the task asked for. No drive-by refactors, no reformatting unrelated files, no new abstractions for hypothetical future use.
5. **Secrets safe:** no API keys, `.env*` contents, or server-only modules leaked into client bundles or commits.
6. **Conventions honored:** Server-by-default, no `useCallback`/`useMemo`, shadcn primitives untouched, path alias `@/*` used over relative climbs.

If any step fails or is skipped, surface it in your final report rather than marking the task done.

## PR workflow

- Branch off `main`. Keep PRs focused — one logical change per PR.
- Reference any linked Jira/issue ticket in the PR description.
- Vercel auto-deploys: every PR gets a preview URL; merging to `main` ships to production.
- Do not push directly to `main`; do not force-push shared branches.

## Things to avoid

- Adding test frameworks, CI configs, or new tooling without an explicit task asking for it.
- Editing `src/components/ui/**` by hand.
- Switching package managers or regenerating the lockfile under a different tool.
- Adding `vercel.json` / `vercel.ts` unless the task requires routing/header/cron config that can't be expressed in code.