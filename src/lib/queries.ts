import { dbQuery } from "./db";
import type { EarningsEvent } from "./types";

type EarningsRow = {
  id: number;
  date: string;
  source: string | null;
  isin: string;
  company_name: string | null;
  company_friendly_name: string | null;
  company_ticker: string | null;
  company_gics_sector: string | null;
  company_gics_industry: string | null;
  company_country: string | null;
  company_year_end: string | null;
  company_market_cap_million: number | null;
  preview_id: string | null;
  preview_name: string | null;
  preview_storage_url: string | null;
  preview_generated_at: string | null;
};

function mapRow(row: EarningsRow): EarningsEvent {
  const event: EarningsEvent = {
    id: row.id,
    date: row.date,
    source: row.source,
    company: {
      isin: row.isin,
      name: row.company_name,
      friendlyName: row.company_friendly_name,
      ticker: row.company_ticker,
      gicsSector: row.company_gics_sector,
      gicsIndustry: row.company_gics_industry,
      country: row.company_country,
      yearEnd: row.company_year_end,
      marketCapMillion: row.company_market_cap_million,
    },
  };

  // Add preview if available
  if (row.preview_id && row.preview_storage_url) {
    event.preview = {
      reportId: row.preview_id,
      name: row.preview_name ?? "Earnings Preview",
      storageUrl: row.preview_storage_url,
      generatedAt: row.preview_generated_at ?? "",
    };
  }

  return event;
}

export async function fetchEarningsCalendar(params: {
  startDate: string;
  endDate: string;
}): Promise<EarningsEvent[]> {
  const { startDate, endDate } = params;

  const { rows } = await dbQuery<EarningsRow>(
    `
      WITH latest_previews AS (
        SELECT DISTINCT ON (r.isin)
          r.isin,
          r.id,
          r.name,
          r.storage_url,
          r.generated_at
        FROM public.reports r
        WHERE r.report_type_id = 6
          AND r.isin IS NOT NULL
          AND r.storage_url IS NOT NULL
          AND r.generated_at >= NOW() - INTERVAL '14 days'
        ORDER BY r.isin, r.generated_at DESC
      )
      SELECT
        ec.id,
        ec.date::text AS date,
        ec.source,
        ec.isin,
        c.name AS company_name,
        c.friendly_name AS company_friendly_name,
        c.ticker AS company_ticker,
        c.gics_sector AS company_gics_sector,
        c.gics_industry AS company_gics_industry,
        c.country AS company_country,
        NULL::text AS company_year_end,
        NULL::numeric AS company_market_cap_million,
        lp.id AS preview_id,
        lp.name AS preview_name,
        lp.storage_url AS preview_storage_url,
        lp.generated_at::text AS preview_generated_at
      FROM librarian.earnings_calendar ec
      LEFT JOIN public.company c ON c.isin = ec.isin
      LEFT JOIN latest_previews lp ON lp.isin = ec.isin
      WHERE ec.date BETWEEN $1::date AND $2::date
      ORDER BY ec.date ASC, c.ticker NULLS LAST, c.friendly_name NULLS LAST;
    `,
    [startDate, endDate]
  );

  return rows.map(mapRow);
}

