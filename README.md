# Earnings Calendar

A Next.js web application that displays earnings reports for the next 5 business days with links to earnings preview reports.

## Features

- Displays earnings calendar for the next 5 business days (excluding weekends)
- Shows company information including name, ticker, country, and ISIN
- Direct links to earnings preview reports (when available)
- Responsive design with dark mode support
- Server-side rendering for fast performance

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: Supabase (PrimerReports DB)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Date Utilities**: date-fns

## Database Schema

The application uses three main tables:

1. `librarian.earnings_calendar` - earnings event data
2. `public.company` - company details (linked via ISIN)
3. `public.reports` - earnings preview reports with storage URLs

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Access to Supabase PrimerReports database

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://rgibsterkohbrorzzflu.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) to view the application

## Deployment on Render

This application is configured for deployment on Render using the included `render.yaml` file.

### Deploy Steps:

1. Push code to a Git repository (GitHub, GitLab, etc.)
2. Create a new Web Service on Render
3. Connect your repository
4. Render will automatically detect the `render.yaml` configuration
5. Add the `SUPABASE_SERVICE_ROLE_KEY` environment variable in Render dashboard
6. Deploy!

Alternatively, use the deployment tools in `~/repos/deployment-tools/` for automated deployment.

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key for server-side queries

## License

MIT
