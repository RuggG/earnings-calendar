export interface Company {
  isin: string;
  name: string;
  ticker?: string;
  country?: string;
}

export interface EarningsEvent {
  id: number;
  isin: string;
  date: string;
  time?: string;
  company?: Company;
}

export interface Report {
  id: number;
  isin: string;
  report_type: string;
  storage_url: string;
  created_at: string;
  title?: string;
}

export interface EarningsCalendarDay {
  date: Date;
  dateString: string;
  events: EarningsEventWithDetails[];
}

export interface EarningsEventWithDetails extends EarningsEvent {
  company: Company;
  report?: Report;
}
