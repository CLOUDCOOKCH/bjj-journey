# Repository Guidelines

## Project Structure

`app/` contains Next.js App Router pages and `app/api/` contains route handlers. Shared components live in `components/`, with Radix-based primitives in `components/ui/`. TanStack Query hooks live in `lib/hooks/`, API helpers in `lib/api/`, and Zod schemas in `lib/validations/`. Update the Drizzle schema in `lib/db/schema.ts` and keep migrations in `drizzle/`. Static assets and screenshots live in `public/`.

## Build, Test, and Development Commands

Use Node.js 20 and pnpm 10 to match CI. Run commands from the repository root.

- `pnpm install --frozen-lockfile` installs dependencies from the CI lockfile.
- `pnpm dev` starts Next.js with hot reload on port 3000.
- `pnpm build` builds the production app. `pnpm start` serves that build.
- `pnpm test` runs Jest. `pnpm test:coverage` checks coverage.
- `pnpm exec tsc --noEmit --incremental false` checks types independently of the build. `pnpm lint` checks the repository with ESLint.

Use `.env.example` as a template for an ignored `.env` with `DATABASE_URL`, `NEXTAUTH_URL`, and a locally generated `NEXTAUTH_SECRET`. Apply database changes to a dedicated development database using the documented migration runner.

## Coding Style and Naming

Use TypeScript, two-space indentation, and the quote style of the surrounding file. Use PascalCase for React components, kebab-case for filenames such as `dashboard-stats.tsx`, and names like `useJournalEntries` for hooks. Default to Server Components and add `'use client'` where interactivity requires it. Reuse the existing auth and Zod validation helpers in API routes.

## Testing Guidelines

Jest uses jsdom and React Testing Library. Add `*.test.ts` or `*.test.tsx` files alongside the code they exercise or under `__tests__/`. Jest enforces 70% global coverage for branches, functions, lines, and statements across its configured files.

## Commits and Pull Requests

Follow the prevalent `type(scope): summary` style, with an optional scope, such as `fix(ui): improve video player layout`. Describe the user-facing change and checks run in the PR. Link related issues, include screenshots for UI changes, and call out database or environment changes contributors need to apply.
