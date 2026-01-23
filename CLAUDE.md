# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Jiu Jitsu Journal is a Next.js 16 full-stack application for tracking Brazilian Jiu Jitsu training sessions, techniques, and achievements. It uses the App Router with React Server Components by default.

## Commands

```bash
# Development
npm run dev              # Start dev server on http://localhost:3000

# Build & Deploy
npm run build            # Production build
npm run start            # Start production server

# Code Quality
npm run lint             # ESLint
npm test                 # Run Jest tests
npm run test:watch       # Jest in watch mode
npm run test:coverage    # Coverage report

# Database (Drizzle ORM + PostgreSQL)
npm run db:push          # Push schema changes directly to DB
npm run db:generate      # Generate migration SQL files
npm run db:studio        # Open Drizzle Studio GUI at localhost:4983
```

## Architecture

### Stack
- **Frontend**: Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, Radix UI primitives
- **Backend**: Next.js API routes (serverless)
- **Database**: PostgreSQL (Neon serverless) with Drizzle ORM
- **Auth**: NextAuth.js 4 with Credentials provider (JWT strategy)
- **State**: TanStack Query 5 for client data fetching
- **Validation**: Zod schemas

### Directory Structure

```
app/                     # Next.js App Router
├── api/                 # API routes (CRUD operations)
│   ├── auth/[...nextauth]/   # NextAuth configuration
│   ├── achievements/         # Achievement endpoints
│   ├── journal-entries/      # Journal entry CRUD
│   ├── profiles/             # User profile management
│   ├── techniques/           # Technique CRUD
│   └── register/             # User registration
├── auth/                 # Authentication pages
├── dashboard/            # Main dashboard
├── calendar/             # Training calendar view
├── settings/             # User settings
├── layout.tsx            # Root layout with providers
└── globals.css           # Design tokens + Tailwind imports

components/
├── ui/                   # Radix UI primitives (Button, Dialog, etc.)
├── navigation/           # Sidebar, navigation components
├── progress/             # Progress tracking components
└── *.tsx                 # Domain-specific components

lib/
├── api/
│   ├── client.ts         # Authenticated fetch wrapper (get, post, patch, del)
│   └── errors.ts         # Error utilities
├── db/
│   ├── index.ts          # Database connection
│   └── schema.ts         # Drizzle schema + relations + types
├── hooks/                # TanStack Query hooks (useJournalEntries, etc.)
├── validations/          # Zod schemas
├── auth.ts               # NextAuth configuration
└── utils.ts              # Utilities
```

## Database Schema

All tables use UUID primary keys. Key entities:

- **users**: NextAuth user records (email, password hash, name)
- **profiles**: BJJ-specific data (belt, stripes, monthlyGoal, currentBeltDate)
- **journalEntries**: Training sessions (entryDate, sessionType, notes, intensityLevel, durationMinutes)
- **techniques**: Linked to journal entries (name, youtubeUrl, notes)
- **achievements**: Belt/stripe promotions (type, title, achievedDate)

Relations are defined in `lib/db/schema.ts` using Drizzle's `relations()`.

## API Routes Pattern

All API routes follow this pattern:
1. Get session from `getServerSession()`
2. Return 401 if unauthenticated
3. Validate request body with Zod
4. Perform database operation
5. Return JSON response

Example: `app/api/journal-entries/route.ts`

## Client-Side Data Fetching

Use TanStack Query hooks from `lib/hooks/`:
- `useJournalEntries()` - Fetch all entries
- `useInfiniteJournalEntries(sort)` - Paginated entries
- `useCreateJournalEntry()` - Mutation for creating
- Pattern: query keys are exported as `resourceKeys.all`, `resourceKeys.list(sort)`, etc.

## Authentication

- **Configuration**: `lib/auth.ts` exports `authOptions`
- **Server**: Use `getServerSession(authOptions)` in API routes
- **Client**: Use `useSession()` hook from `next-auth/react`
- **JWT includes**: user.id (added via callback in auth.ts)
- All API routes require authentication except `/api/register`

## Component Guidelines

- **Default to Server Components** - Only add `'use client'` when necessary
- **UI Components**: Use Radix UI primitives from `components/ui/`
- **Forms**: React Hook Form + Zod validation
- **Theme**: next-themes for dark/light mode, design tokens in `app/globals.css`

## Validation Schemas

Zod schemas in `lib/validations/schema.ts`:
- `authSchema`, `signUpSchema`
- `profileUpdateSchema`
- `journalEntrySchema`, `journalEntryUpdateSchema`
- `techniqueSchema`, `techniqueUpdateSchema`
- `achievementSchema`

Types are exported as `*Input` from each schema.

## Adding New Features

1. **Schema changes**: Edit `lib/db/schema.ts`, run `npm run db:push`
2. **Validation**: Add Zod schema to `lib/validations/schema.ts`
3. **API route**: Create in `app/api/resource-name/route.ts`
4. **Client hook**: Create in `lib/hooks/use-resource.ts` following existing patterns
5. **Components**: Add to `components/`, use existing UI primitives
6. **Pages**: Add to `app/` directory

## Design System

Colors use OKLCH in `:root` and `.dark`:
- Primary: `oklch(0.55 0.25 260)` - Electric blue/violet
- Dark mode: `#020617` (slate-950) background with glass cards
- Components have glassmorphism effect with `backdrop-blur` and semi-transparent backgrounds
