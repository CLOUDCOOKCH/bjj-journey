<p align="center">
  <img src="public/screenshots/image.png" alt="BJJ Journey Dashboard" width="100%" />
</p>

<h1 align="center">BJJ Journey</h1>

<p align="center">
  <strong>Your complete Brazilian Jiu Jitsu training companion</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=flat-square&logo=postgresql" alt="PostgreSQL" />
</p>

<p align="center">
  Track your sessions. Document your techniques. Celebrate your progress.
</p>

<p align="center">
  <a href="https://bjj-journey.netlify.app/"><img src="https://img.shields.io/badge/Live_Demo-bjj--journey.netlify.app-00C7B7?style=flat-square&logo=netlify" alt="Live Demo" /></a>
</p>

---

## About

BJJ Journey is a full-stack web app for tracking your Brazilian Jiu Jitsu training. Log daily sessions, document techniques with video references, monitor attendance patterns, track belt progression, and celebrate achievements on your path to black belt.

## Screenshots

<details open>
<summary><strong>Training Dashboard</strong></summary>
<br />
<img src="public/screenshots/image.png" alt="Training Dashboard" width="100%" />
<p><em>Real-time stats including total sessions, monthly progress, current streak, training volume chart, and recent activity feed.</em></p>
</details>

<details>
<summary><strong>Training Calendar</strong></summary>
<br />
<img src="public/screenshots/image2.png" alt="Training Calendar" width="100%" />
<p><em>Interactive calendar view with session types, mat time tracking, streak counter, and quick session logging.</em></p>
</details>

<details>
<summary><strong>Journal</strong></summary>
<br />
<img src="public/screenshots/image3.png" alt="Journal" width="100%" />
<p><em>Filterable training log with session types, intensity levels, duration, technique tags, and full-text search.</em></p>
</details>

<details>
<summary><strong>Progress Tracking</strong></summary>
<br />
<img src="public/screenshots/image4.png" alt="Progress Tracking" width="100%" />
<p><em>Belt progression timeline, stripe progress, milestone checklist, and promotion history.</em></p>
</details>

<details>
<summary><strong>Authentication</strong></summary>
<br />
<img src="public/screenshots/image5.png" alt="Login" width="100%" />
<p><em>Secure login with belt progression visualization and responsive glassmorphism design.</em></p>
</details>

## Features

- **Training Dashboard** - At-a-glance stats: total sessions, monthly progress, current streak, and training volume chart
- **Interactive Calendar** - Visual calendar with session type indicators, mat time tracking, and quick-add
- **Journal Entries** - Log sessions with notes, intensity level, duration, and session type (Gi, No-Gi, Open Mat)
- **Technique Library** - Save techniques with YouTube links and personal notes
- **Progress Tracking** - Belt progression timeline, stripe milestones, and promotion history
- **Achievement System** - Record belt promotions and stripe achievements with dates
- **Goal Setting** - Monthly training frequency goals with progress bars
- **Dark Mode** - Full dark theme with glassmorphism UI and smooth transitions
- **Responsive** - Works seamlessly on desktop, tablet, and mobile

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, Radix UI, Framer Motion |
| **Backend** | Next.js API Routes (serverless) |
| **Database** | PostgreSQL (Neon) + Drizzle ORM |
| **Auth** | NextAuth.js 4 (JWT strategy) |
| **Data Fetching** | TanStack Query 5 |
| **Validation** | Zod + React Hook Form |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database ([Neon](https://neon.tech) recommended)

### Setup

```bash
# Clone the repository
git clone https://github.com/dennisrongo/bjj-journey.git
cd bjj-journey

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL, NEXTAUTH_URL, and NEXTAUTH_SECRET

# Push database schema
npm run db:push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to get started.

### Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_URL` | Base URL (`http://localhost:3000` for dev) |
| `NEXTAUTH_SECRET` | Secret key - generate with `openssl rand -base64 32` |

## Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
npm test             # Run tests
npm run db:push      # Push schema to database
npm run db:studio    # Open Drizzle Studio GUI
```

## Project Structure

```
app/
  api/               # REST API routes (auth, journal, techniques, achievements)
  auth/              # Login & signup pages
  dashboard/         # Main dashboard
  calendar/          # Training calendar
  journal/           # Journal entries
  techniques/        # Technique library
  achievements/      # Progress tracking
  settings/          # User settings
components/
  ui/                # Radix UI primitives
  navigation/        # Sidebar & mobile nav
  progress/          # Progress tracking components
lib/
  db/                # Drizzle schema & connection
  hooks/             # TanStack Query hooks
  validations/       # Zod schemas
  api/               # Fetch client
  auth.ts            # NextAuth config
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  <strong>Built for the BJJ community</strong>
</p>
