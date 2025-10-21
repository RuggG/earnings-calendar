# Primer Reports Earnings Calendar

Public Next.js site that surfaces upcoming earnings events from the Primer Reports warehouse and links directly to preview reports when they exist. The application displays a 30-day calendar with comprehensive filtering and preview access.

## Features
- 30-day calendar view with earnings events grouped by date
- Advanced filtering by sector, industry, country, and market cap
- Direct links to earnings preview reports (generated within last 2 weeks)
- "Ask for Preview" email integration for companies without previews
- Rich company metadata display including market cap, sector, industry, year-end
- Server-rendered data fetched directly from Supabase Postgres via `pg`
- Modern, professional UI with Tailwind CSS, revalidated every 60 seconds

## Prerequisites
- Node.js 20+
- Access to the PrimerReports Supabase project (credentials are pulled from the shared keychain loader)

## Local Development
1. `cd ~/repos/earnings-calendar`
2. Install dependencies: `npm install`
3. Load credentials: `source ~/Documents/dev/credentials-keychain.sh`
4. Create `.env.local` and set the Postgres connection string. Either copy `.env.example` or run the helper script:
   ```bash
   ./scripts/print-database-url.sh > .env.local
   ```
   The script prints the Supabase Postgres URL using `SUPABASE_PROJECT_ID` and `SUPABASE_DB_PASSWORD` from the keychain. If you prefer to edit manually, ensure `DATABASE_URL` includes `sslmode=require`.
5. Start the app: `npm run dev`
6. Visit http://localhost:3000 for the earnings calendar.

## Testing & Linting
- `npm run lint` – Next.js/ESLint checks
- `npm run test` – Vitest unit tests (currently covers business-day calculations)

## Data Access
Queries live in `src/lib/queries.ts` and are executed server-side only. They join:
- `librarian.earnings_calendar` for schedule metadata
- `public.company` for comprehensive company data (ticker, friendly name, sector, industry, country, market cap, year-end)
- `public.reports` filtered to `report_type_id = 6` and `generated_at >= NOW() - INTERVAL '14 days'` for recent earnings previews

The Next.js pages run with `revalidate = 60`, so fresh data is pulled roughly once a minute in production. No secrets are ever sent to the client – only pre-rendered JSON.

## Environment Variables
- `DATABASE_URL` – Supabase Postgres connection string with `sslmode=require`

See `.env.example` for the required key. Render deployment will also need the same variable configured. The helper script never persists secrets; it only echoes the computed URL so you can pipe it into `.env.local` or your deployment workflow.

## Project Layout
```
src/
  app/
    page.tsx              # Main earnings calendar page
    layout.tsx            # Shared layout with header and footer
    api/health/route.ts   # Health check endpoint
  components/
    CalendarView.tsx      # Calendar with filtering and preview links
  lib/
    businessDays.ts       # Business day calculations
    db.ts                 # Postgres connection pool
    queries.ts            # Database queries
    types.ts              # TypeScript types
scripts/
  print-database-url.sh   # Helper to echo DATABASE_URL from keychain secrets
```

## Deployment
Use the shared deployment workflow in `~/repos/deployment-tools/` when you're ready to push to Render. Pull the latest tooling (`git -C ~/repos/deployment-tools pull`) and follow the repo's README to prepare a Render service with `DATABASE_URL` set. A deploy-ready configuration file is added in the next step of this task list.
