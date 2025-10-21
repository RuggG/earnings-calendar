# Earnings Calendar - Project Handover Document

## Project Overview

A Next.js web application that displays earnings calendar events from the Primer Reports Supabase database. The application shows upcoming earnings for the next 30 days and provides direct links to earnings preview reports for the next 5 business days.

**Live URL**: https://earnings-calendar-djoz.onrender.com
**GitHub**: https://github.com/RuggG/earnings-calendar
**Render Service ID**: `srv-d3rr7t0gjchc73d52rdg`

---

## What Was Built

### Core Features

1. **30-Day Calendar View** (`/`)
   - Lists all earnings events for the next 30 days
   - Search functionality by ticker, company name, or ISIN
   - Grouped by date with company details
   - Shows source metadata

2. **5-Day Previews View** (`/previews`)
   - Focuses on next 5 business days only
   - Displays earnings preview report links when available
   - Filters reports by `report_type_id = 6` (earnings previews)
   - Shows "Preview Pending" badge when no report exists

3. **Health Check API** (`/api/health`)
   - Simple endpoint returning `{ ok: true }`
   - Used by Render for health monitoring

### Technical Stack

- **Framework**: Next.js 15.5.6 (App Router)
- **Database**: Direct Postgres connection via `pg` library
- **Styling**: Tailwind CSS v4 with modern gradient design
- **Language**: TypeScript
- **Deployment**: Render (Starter plan)
- **Revalidation**: 60 seconds (ISR)

---

## Architecture

### Database Integration

**Connection Method**: Direct Postgres connection (not Supabase JS client)

**Database**: Supabase PrimerReports
**Connection String**: `DATABASE_URL` environment variable (URL-encoded password)

**Tables Used**:
1. `librarian.earnings_calendar` - earnings event schedule
2. `public.company` - company metadata (joined via ISIN)
3. `public.reports` - earnings preview reports (filtered by `report_type_id = 6`)

**Query Strategy**:
- SQL joins for optimal performance
- `DISTINCT ON` for latest preview per company
- Server-side only (no client-side database access)

### File Structure

```
earnings-calendar/
├── src/
│   ├── app/
│   │   ├── page.tsx              # 30-day calendar page
│   │   ├── previews/page.tsx     # 5-day previews page
│   │   ├── api/health/route.ts   # Health check endpoint
│   │   ├── layout.tsx            # Root layout with header
│   │   └── globals.css           # Global styles
│   ├── components/
│   │   ├── CalendarView.tsx      # Calendar component with search
│   │   └── PreviewsView.tsx      # Previews component with report links
│   └── lib/
│       ├── db.ts                 # Postgres connection pool
│       ├── queries.ts            # Database query functions
│       ├── businessDays.ts       # Business day calculations
│       └── types.ts              # TypeScript type definitions
├── scripts/
│   └── print-database-url.sh     # Helper to generate DATABASE_URL
├── package.json                  # Dependencies and scripts
├── render.yaml                   # Render deployment config
└── .env.local                    # Local environment variables
```

---

## Deployment Configuration

### Render Setup

**Service Details**:
- Name: `earnings-calendar`
- Plan: Starter
- Region: Oregon
- Runtime: Node.js
- Auto-deploy: Disabled (manual deployments)

**Build Configuration**:
```yaml
buildCommand: npm install && npm run build
startCommand: npm start -H 0.0.0.0 -p ${PORT:-3000}
healthCheckPath: /api/health
```

**Environment Variables** (set on Render):
```
DATABASE_URL=postgresql://postgres:<URL_ENCODED_PASSWORD>@db.rgibsterkohbrorzzflu.supabase.co:5432/postgres?sslmode=require
```

**Important**: The password contains special characters and MUST be URL-encoded (`?` becomes `%3F`).

### Deployment Workflow

**Using the API**:
```bash
source ~/Documents/dev/credentials-keychain.sh
python3 trigger-deploy.py
```

**Using deployment tools**:
```bash
cd ~/repos/deployment-tools/render-tools
./with-keychain-env.sh python3 render_api.py deploy
```

**Monitoring**:
- Dashboard: https://dashboard.render.com/web/srv-d3rr7t0gjchc73d52rdg
- Logs available in Render dashboard (API logs endpoint is broken)

---

## Design System

### Color Scheme

**Primary**: Blue/Indigo gradient (`from-blue-600 to-indigo-600`)
**Background**: Subtle gradient (`from-slate-50 to-blue-50/30`)
**Accents**:
- Blue badges for tickers
- Green badges for source
- Amber badges for "Preview Pending"

### Key Design Elements

1. **Glass-morphism**: Cards use `bg-white/80 backdrop-blur-sm`
2. **Gradients**: Headers, buttons, and nav use blue→indigo gradients
3. **Shadows**: Subtle colored shadows (`shadow-blue-100/20`)
4. **Rounded corners**: `rounded-2xl` for cards, `rounded-xl` for inputs
5. **Hover effects**: Smooth transitions on interactive elements

### Component Patterns

**Badge/Tag Component**:
```tsx
<span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-mono font-semibold text-blue-700">
  AAPL
</span>
```

**Primary Button**:
```tsx
<a className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/30 transition hover:from-blue-500 hover:to-indigo-500 hover:shadow-lg hover:shadow-blue-500/40">
  View Preview
</a>
```

---

## Key Implementation Details

### Business Day Logic

Located in `src/lib/businessDays.ts`:
- Calculates next N business days (excludes weekends)
- Uses `date-fns` for date manipulation
- Has test coverage in `businessDays.test.ts`

### Database Queries

**Two main queries** in `src/lib/queries.ts`:

1. `fetchEarningsCalendar()` - Simple calendar events
2. `fetchPreviewsForDates()` - Events with preview report links

**Preview Query Strategy**:
- Uses CTE (Common Table Expression) for clarity
- `DISTINCT ON (r.isin)` to get latest preview per company
- Filters by `report_type_id = 6`
- Orders by `generated_at DESC` to get most recent

### Server Configuration

**Critical Fix**: Next.js must bind to `0.0.0.0` for Render health checks to work.

In `package.json`:
```json
"start": "next start -H 0.0.0.0 -p ${PORT:-3000}"
```

Without this, health checks timeout and deployment fails.

---

## Current Status

### Latest Deployment

**Deploy ID**: `dep-d3rrntpr0fns73dtvim0`
**Status**: Building/Deploying
**Commit**: `1ced595` - "Redesign UI with modern, slick styling"

**Recent Changes**:
1. Complete UI redesign with modern gradient theme
2. Enhanced component styling
3. Improved search and navigation UX
4. Better responsive design

### Known Working State

✅ Database queries functioning correctly
✅ Preview reports filtering by `report_type_id = 6`
✅ Health checks passing
✅ Build successful locally
✅ Environment variables configured
✅ Server binding to `0.0.0.0:PORT`

---

## Credentials & Access

### Keychain Setup

All credentials stored in macOS Keychain and loaded via:
```bash
source ~/Documents/dev/credentials-keychain.sh
```

**Required Credentials**:
- `SUPABASE_PROJECT_ID` - `rgibsterkohbrorzzflu`
- `SUPABASE_DB_PASSWORD` - Password for Postgres connection
- `RENDER_API_KEY` - For programmatic deployments
- `DATABASE_URL` - Full Postgres connection string

**Credential Loader Location**: `~/Documents/dev/credentials-keychain.sh`

### Helper Scripts

1. **Generate DATABASE_URL**:
   ```bash
   ./scripts/print-database-url.sh
   ```
   Outputs URL-encoded connection string

2. **Trigger Deployment**:
   ```bash
   python3 trigger-deploy.py
   ```
   Creates new deployment via Render API

3. **Create Service** (already done):
   ```bash
   python3 create-render-service.py
   ```

---

## How to Make Changes

### Local Development

1. **Start dev server**:
   ```bash
   source ~/Documents/dev/credentials-keychain.sh
   npm run dev
   ```
   Access at http://localhost:3000

2. **Run tests**:
   ```bash
   npm test
   ```

3. **Build locally**:
   ```bash
   npm run build
   ```

### Deployment Process

1. **Make changes** to components/pages
2. **Test locally** with `npm run dev`
3. **Build and verify**: `npm run build`
4. **Commit changes**:
   ```bash
   git add -A
   git commit -m "Your message"
   git push
   ```
5. **Deploy to Render**:
   ```bash
   source ~/Documents/dev/credentials-keychain.sh
   python3 trigger-deploy.py
   ```
6. **Monitor deployment** in Render dashboard

---

## Troubleshooting

### Common Issues

**Issue**: Health check timeout
**Solution**: Ensure start command includes `-H 0.0.0.0 -p ${PORT:-3000}`

**Issue**: Database connection errors
**Solution**: Verify `DATABASE_URL` has URL-encoded password (`%3F` not `?`)

**Issue**: Build fails on Render
**Solution**: Check build logs in dashboard, ensure dependencies are in `package.json`

**Issue**: Stale data shown
**Solution**: Revalidation is 60s - wait or set `revalidate = 0` for testing

### Useful Commands

```bash
# Check Render service status
cd ~/repos/deployment-tools/render-tools
./with-keychain-env.sh python3 render_status.py

# View recent deployments
./with-keychain-env.sh python3 get_build_logs.py

# Update environment variable
./with-keychain-env.sh python3 render_api.py set DATABASE_URL "value"
```

---

## Next Steps / Potential Improvements

### Suggested Enhancements

1. **Filtering Options**:
   - Filter by country
   - Filter by sector/industry (GICS data available)
   - Date range picker

2. **Preview Report Enhancements**:
   - Preview thumbnail/first page
   - Download option
   - Report metadata display

3. **Performance**:
   - Add Redis caching layer
   - Implement pagination for large date ranges
   - Consider static generation for some pages

4. **Features**:
   - Email alerts for specific tickers
   - Export to calendar (iCal)
   - Historical earnings data view

5. **Analytics**:
   - Track which previews are most viewed
   - User engagement metrics

### Technical Debt

- Consider migrating to connection pooler (PgBouncer) for better scaling
- Add E2E tests with Playwright
- Implement error boundaries for better UX
- Add loading skeletons for better perceived performance

---

## Support & Documentation

### Key Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Render Docs**: https://render.com/docs
- **Supabase Docs**: https://supabase.com/docs

### Project Documentation

- This handover document: `/HANDOVER.md`
- README: `/README.md`
- Deployment guide: `~/repos/deployment-tools/render-tools/README.md`
- Credentials workflow: `~/repos/KEYCHAIN_CREDENTIALS.md`

---

## Contact Points

**Repository**: https://github.com/RuggG/earnings-calendar
**Live Site**: https://earnings-calendar-djoz.onrender.com
**Render Dashboard**: https://dashboard.render.com/web/srv-d3rr7t0gjchc73d52rdg

**Database**: Supabase PrimerReports
**Service**: Render (Starter plan, Oregon region)

---

*Document created: 2025-10-21*
*Last deployment: `1ced595` - Modern UI redesign*
*Status: ✅ Fully functional, deployed, and documented*
