# Jiu Jitsu Journal

A comprehensive journal application for tracking Jiu Jitsu training sessions, techniques learned, achievements, and progress over time.

![Jiu Jitsu Journal](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwind-css)

## Overview

Jiu Jitsu Journal helps you track your BJJ training journey with a beautiful, intuitive interface. Log your daily sessions, document techniques with video references, monitor your attendance patterns, and celebrate your achievements on the path to black belt.

### Key Features

- **User Authentication** - Secure signup and login with email/password
- **Training Dashboard** - Real-time statistics including total sessions, monthly progress, and current streak
- **Interactive Calendar** - Visual calendar view to track training history and quickly add entries
- **Journal Entries** - Log daily training sessions with detailed notes
- **Technique Documentation** - Save moves with YouTube links and personal notes for future reference
- **Achievement Tracking** - Record belt promotions and stripe achievements with dates
- **Goal Setting** - Set and monitor monthly training frequency goals
- **Data Visualization** - Charts showing monthly training patterns over time
- **Dark Theme** - Full dark mode support with smooth animations
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices

### Screenshots

![Dashboard](https://placehold.co/1200x800/1e293b/64748b?text=Dashboard+View)
![Calendar](https://placehold.co/1200x800/1e293b/64748b?text=Calendar+View)
![Settings](https://placehold.co/1200x800/1e293b/64748b?text=Settings+Page)

## Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript 5** - Type-safe development
- **Tailwind CSS 4** - Utility-first CSS framework
- **Radix UI** - Unstyled, accessible component primitives
- **Framer Motion** - Smooth animations
- **Recharts** - Data visualization
- **react-day-picker** - Calendar component

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Drizzle ORM** - Type-safe SQL queries
- **PostgreSQL (Neon)** - Serverless PostgreSQL database

### Authentication & Data
- **NextAuth.js 4** - Authentication solution
- **TanStack Query 5** - Data fetching and caching
- **Zod** - Schema validation
- **React Hook Form** - Form management
- **bcrypt** - Password hashing

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher
- **npm**, **pnpm**, or **yarn** package manager
- **PostgreSQL** database (Neon account recommended)
- **Git** for version control

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/jiu-jitsu-journal.git
cd jiu-jitsu-journal
```

### 2. Install Dependencies

```bash
npm install
# or
pnpm install
# or
yarn install
```

### 3. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Update `.env` with your values:

```env
# Neon Database Connection
DATABASE_URL=postgresql://username:password@host/database

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
```

**Generate NextAuth Secret:**

```bash
openssl rand -base64 32
```

### 4. Set Up Database

Run database migrations to create all required tables:

```bash
npm run db:push
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Create an Account

1. Click "Get Started" on the home page
2. Sign up with your email and password
3. Start tracking your Jiu Jitsu journey!

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@ep-cool-region.aws.neon.tech/dbname` |
| `NEXTAUTH_URL` | Base URL for NextAuth | `http://localhost:3000` (dev), `https://yourapp.com` (prod) |
| `NEXTAUTH_SECRET` | Secret key for encryption | Generate with `openssl rand -base64 32` |

## Database Schema

### Users
- Stores user credentials and profile information
- Fields: id, email, password, name, emailVerified, image

### Profiles
- Extends user with Jiu Jitsu-specific settings
- Fields: belt (white, blue, purple, brown, black), monthlyGoal

### Journal Entries
- Training session records
- Fields: entryDate, notes, createdAt, updatedAt

### Techniques
- Linked to journal entries
- Fields: name, youtubeUrl, notes

### Achievements
- Belt promotions and stripe achievements
- Fields: type (belt/stripe), title, description, achievedDate

## Project Structure

```
jiu-jitsu-journal/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── auth/                 # NextAuth endpoints
│   │   ├── achievements/         # Achievement CRUD
│   │   ├── journal-entries/      # Entry CRUD
│   │   ├── profiles/             # Profile settings
│   │   ├── techniques/           # Technique CRUD
│   │   └── register/             # User registration
│   ├── auth/                     # Auth pages
│   │   ├── error/
│   │   ├── login/
│   │   ├── sign-in-success/
│   │   └── sign-up/
│   ├── calendar/                 # Calendar page
│   ├── dashboard/                # Main dashboard
│   ├── settings/                 # Settings page
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
├── components/
│   ├── ui/                       # Radix UI components
│   ├── app-nav.tsx               # Navigation bar
│   ├── achievements-list.tsx     # Achievements display
│   ├── belt-settings.tsx         # Belt configuration
│   ├── calendar-view.tsx          # Calendar component
│   ├── dashboard-stats.tsx        # Statistics cards
│   ├── monthly-chart.tsx          # Training chart
│   ├── providers.tsx              # App providers
│   ├── quick-entry-button.tsx     # Quick add entry
│   ├── quick-entry-dialog.tsx     # Entry dialog
│   ├── recent-entries.tsx         # Recent entries list
│   ├── theme-provider.tsx         # Theme context
│   └── various dialogs & forms
├── lib/
│   ├── api/                      # API clients
│   ├── db/                       # Database setup & schema
│   ├── hooks/                    # React Query hooks
│   ├── auth.ts                   # NextAuth config
│   ├── utils.ts                  # Utility functions
│   └── validations/              # Zod schemas
├── drizzle/                      # Database migrations
├── public/                       # Static assets
├── .env.example                  # Environment template
├── drizzle.config.ts             # Drizzle config
├── next.config.mjs               # Next.js config
├── package.json                  # Dependencies & scripts
└── tsconfig.json                 # TypeScript config
```

## Available Scripts

```bash
# Development
npm run dev              # Start development server

# Build
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint

# Database
npm run db:generate      # Generate migration files
npm run db:push          # Push schema changes to database
npm run db:studio        # Open Drizzle Studio (database GUI)
```

## Development Workflow

### Adding New Features

1. Create API routes in `app/api/`
2. Add React components in `components/`
3. Create pages in `app/`
4. Define database schema changes in `lib/db/schema.ts`
5. Run migrations with `npm run db:push`

### Database Management

**View Database in Browser:**

```bash
npm run db:studio
```

Opens Drizzle Studio at `http://localhost:4983`

**Run Migrations:**

```bash
npm run db:push
```

Pushes schema changes directly to the database.

**Generate Migration Files:**

```bash
npm run db:generate
```

Creates SQL migration files for version control.

### Linting & Type Checking

```bash
npm run lint
```

Fix linting errors and TypeScript warnings before committing.

## Deployment

### General Considerations

1. **Set Production Environment Variables**
   - Update `NEXTAUTH_URL` to your production domain
   - Use a secure `NEXTAUTH_SECRET`
   - Ensure `DATABASE_URL` points to your production database

2. **Database Setup**
   - Use a production-ready PostgreSQL database (Neon, AWS RDS, etc.)
   - Run migrations: `npm run db:push`

3. **Build & Deploy**
   ```bash
   npm run build
   ```

4. **Platform-Specific Notes**
   - Most platforms require environment variables to be set in their dashboard
   - Ensure your database allows connections from your deployment platform

## Features in Detail

### Dashboard

The dashboard provides an at-a-glance view of your training:

- **Total Sessions**: Lifetime count of training days
- **This Month**: Sessions in the current month with progress toward goal
- **Current Streak**: Consecutive days of training
- **Belt Rank**: Current belt level
- **Achievements**: Total number of achievements unlocked

### Calendar

Interactive calendar view showing all training sessions:

- Visual indicators for training days
- Click to view entry details
- Quick-add entries with one click
- Navigate between months

### Journal Entries

Each entry can include:

- Training date
- Personal notes and observations
- Techniques learned during the session
- YouTube links for reference

### Techniques

Document individual techniques:

- Technique name
- YouTube tutorial link
- Personal notes and key points
- Automatically linked to training session

### Achievements

Track your progress:

- Belt promotions (white → black)
- Stripe achievements
- Date achieved
- Custom descriptions

### Settings

Configure your profile:

- Set current belt level
- Set monthly training goal (sessions per month)
- View and manage achievements

## Contributing

Contributions are welcome! Here's how to contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use TypeScript for type safety
- Follow existing code structure and naming conventions
- Write clear, descriptive component and function names
- Add comments for complex logic

### Testing

Ensure all features work before submitting:
- Test on desktop and mobile viewports
- Verify database operations
- Check authentication flows

## Support

For questions, issues, or suggestions:

- **Issues**: [GitHub Issues](https://github.com/your-username/jiu-jitsu-journal/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/jiu-jitsu-journal/discussions)

## Acknowledgments

Built with modern web technologies and designed for the Jiu Jitsu community.

- [Next.js](https://nextjs.org/)
- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [TanStack Query](https://tanstack.com/query)

---

**Built with ❤️ for the BJJ community**
