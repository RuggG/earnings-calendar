export interface CompanyInfo {
  isin: string;
  name: string | null;
  ticker: string | null;
  friendlyName: string | null;
  gicsSector: string | null;
  gicsIndustry: string | null;
  country: string | null;
  yearEnd: string | null;
  marketCapMillion: number | null;
}

export interface EarningsEvent {
  id: number;
  date: string;
  source: string | null;
  company: CompanyInfo;
  preview?: {
    reportId: string;
    name: string;
    storageUrl: string;
    generatedAt: string;
  };
}
