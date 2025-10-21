import { supabase } from './supabase';
import { Company, Report, EarningsEventWithDetails, EarningsCalendarDay } from './types';
import { getNextBusinessDays, formatDateForDB } from './businessDays';

/**
 * Fetch earnings events for the next N business days
 */
export async function getEarningsCalendar(days: number = 5): Promise<EarningsCalendarDay[]> {
  const businessDays = getNextBusinessDays(days);
  const startDate = formatDateForDB(businessDays[0]);
  const endDate = formatDateForDB(businessDays[businessDays.length - 1]);

  // Fetch earnings events
  const { data: events, error: eventsError } = await supabase
    .schema('librarian')
    .from('earnings_calendar')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  if (eventsError) {
    console.error('Error fetching earnings events:', eventsError);
    throw eventsError;
  }

  if (!events || events.length === 0) {
    return businessDays.map(date => ({
      date,
      dateString: formatDateForDB(date),
      events: []
    }));
  }

  // Get unique ISINs
  const isins = [...new Set(events.map((e) => (e as { isin: string }).isin).filter(Boolean))];

  // Fetch company details
  const { data: companies, error: companiesError } = await supabase
    .from('company')
    .select('*')
    .in('isin', isins);

  if (companiesError) {
    console.error('Error fetching companies:', companiesError);
  }

  // Fetch earnings preview reports
  const { data: reports, error: reportsError } = await supabase
    .from('reports')
    .select('*')
    .in('isin', isins);

  if (reportsError) {
    console.error('Error fetching reports:', reportsError);
  }

  // Create lookup maps
  const companyMap = new Map<string, Company>();
  companies?.forEach((company) => {
    companyMap.set((company as Company).isin, company as Company);
  });

  const reportMap = new Map<string, Report>();
  reports?.forEach((report) => {
    const typedReport = report as Report;
    // Store the most recent report for each ISIN
    if (!reportMap.has(typedReport.isin) ||
        new Date(typedReport.created_at) > new Date(reportMap.get(typedReport.isin)!.created_at)) {
      reportMap.set(typedReport.isin, typedReport);
    }
  });

  // Combine events with company and report data
  const eventsWithDetails: EarningsEventWithDetails[] = events.map((event) => {
    const typedEvent = event as { id: number; isin: string; date: string; time?: string };
    return {
      ...typedEvent,
      company: companyMap.get(typedEvent.isin) || { isin: typedEvent.isin, name: 'Unknown Company' },
      report: reportMap.get(typedEvent.isin)
    };
  });

  // Group events by date
  const calendar: EarningsCalendarDay[] = businessDays.map(date => {
    const dateString = formatDateForDB(date);
    const dayEvents = eventsWithDetails.filter(e => e.date === dateString);

    return {
      date,
      dateString,
      events: dayEvents
    };
  });

  return calendar;
}
