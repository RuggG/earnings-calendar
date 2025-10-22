"use client";

import { useMemo, useState } from "react";
import { parseISO, format } from "date-fns";
import type { EarningsEvent } from "@/lib/types";

type RequestModalState = {
  isOpen: boolean;
  event: EarningsEvent | null;
};

type Props = {
  events: EarningsEvent[];
};

type GroupedEvents = Record<string, EarningsEvent[]>;

type Filters = {
  search: string;
  sector: string;
  industry: string;
  country: string;
  minMarketCap: string;
  days: number;
  minOverallScore: string;
  minNewsScore: string;
  minReadxScore: string;
};

type CollapsedDays = Record<string, boolean>;

const formatDisplayDate = (isoDate: string) => {
  const parsed = parseISO(isoDate);
  return format(parsed, "EEEE, MMMM d, yyyy");
};

const normalize = (value: string | null | undefined) =>
  (value ?? "").toLowerCase();

const formatMarketCap = (marketCapM: number | null) => {
  if (marketCapM === null) return null;
  if (marketCapM >= 1000) {
    return `$${(marketCapM / 1000).toFixed(1)}B`;
  }
  return `$${marketCapM.toFixed(0)}M`;
};

// Color code scores from -5 to +5
const getScoreColor = (score: number | null) => {
  if (score === null) return { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-border' };

  if (score >= 3) return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' };
  if (score >= 1) return { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' };
  if (score > -1) return { bg: 'bg-muted/50', text: 'text-muted-foreground', border: 'border-border' };
  if (score > -3) return { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' };
  return { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' };
};

const formatScore = (score: number | null) => {
  if (score === null) return 'N/A';
  return score > 0 ? `+${score.toFixed(1)}` : score.toFixed(1);
};

export function CalendarView({ events }: Props) {
  const [filters, setFilters] = useState<Filters>({
    search: "",
    sector: "",
    industry: "",
    country: "",
    minMarketCap: "",
    days: 30,
    minOverallScore: "",
    minNewsScore: "",
    minReadxScore: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [collapsedDays, setCollapsedDays] = useState<CollapsedDays>({});
  const [requestModal, setRequestModal] = useState<RequestModalState>({
    isOpen: false,
    event: null,
  });
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extract unique values for dropdowns
  const filterOptions = useMemo(() => {
    const sectors = new Set<string>();
    const industries = new Set<string>();
    const countries = new Set<string>();

    events.forEach(({ company }) => {
      if (company.gicsSector) sectors.add(company.gicsSector);
      if (company.gicsIndustry) industries.add(company.gicsIndustry);
      if (company.country) countries.add(company.country);
    });

    return {
      sectors: Array.from(sectors).sort(),
      industries: Array.from(industries).sort(),
      countries: Array.from(countries).sort(),
    };
  }, [events]);

  const filteredEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + filters.days);

    return events.filter(({ company, date }) => {
      // Days filter
      const eventDate = parseISO(date);
      if (eventDate > maxDate) {
        return false;
      }

      // Search filter
      if (filters.search.trim()) {
        const term = filters.search.toLowerCase();
        const matches = [
          company.ticker,
          company.friendlyName,
          company.name,
          company.isin,
        ]
          .map(normalize)
          .some((value) => value.includes(term));
        if (!matches) return false;
      }

      // Sector filter
      if (filters.sector && company.gicsSector !== filters.sector) {
        return false;
      }

      // Industry filter
      if (filters.industry && company.gicsIndustry !== filters.industry) {
        return false;
      }

      // Country filter
      if (filters.country && company.country !== filters.country) {
        return false;
      }

      // Market cap filter
      if (filters.minMarketCap) {
        const minCap = parseFloat(filters.minMarketCap);
        if (company.marketCapMillion === null || company.marketCapMillion < minCap) {
          return false;
        }
      }

      return true;
    });
  }, [events, filters]);

  const filteredByScores = useMemo(() => {
    return filteredEvents.filter((event) => {
      // Score filters only apply to events with previews and scores
      if (!event.preview?.scores) {
        // If no scores, include the event (don't filter out)
        return true;
      }

      // Overall score filter
      if (filters.minOverallScore) {
        const minScore = parseFloat(filters.minOverallScore);
        if (event.preview.scores.overall === null || event.preview.scores.overall < minScore) {
          return false;
        }
      }

      // News score filter
      if (filters.minNewsScore) {
        const minScore = parseFloat(filters.minNewsScore);
        if (event.preview.scores.news === null || event.preview.scores.news < minScore) {
          return false;
        }
      }

      // ReadX score filter
      if (filters.minReadxScore) {
        const minScore = parseFloat(filters.minReadxScore);
        if (event.preview.scores.readx === null || event.preview.scores.readx < minScore) {
          return false;
        }
      }

      return true;
    });
  }, [filteredEvents, filters]);

  const grouped = useMemo(() => {
    return filteredByScores.reduce<GroupedEvents>((acc, event) => {
      const bucket = event.date;
      acc[bucket] = acc[bucket] ?? [];
      acc[bucket].push(event);
      return acc;
    }, {});
  }, [filteredByScores]);

  const sortedDates = useMemo(() => {
    return Object.keys(grouped).sort(
      (a, b) => parseISO(a).getTime() - parseISO(b).getTime()
    );
  }, [grouped]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.sector) count++;
    if (filters.industry) count++;
    if (filters.country) count++;
    if (filters.minMarketCap) count++;
    if (filters.minOverallScore) count++;
    if (filters.minNewsScore) count++;
    if (filters.minReadxScore) count++;
    return count;
  }, [filters]);

  const clearFilters = () => {
    setFilters({
      search: "",
      sector: "",
      industry: "",
      country: "",
      minMarketCap: "",
      days: 30,
      minOverallScore: "",
      minNewsScore: "",
      minReadxScore: "",
    });
  };

  const toggleDay = (date: string) => {
    setCollapsedDays(prev => ({
      ...prev,
      [date]: !prev[date]
    }));
  };

  const openRequestModal = (event: EarningsEvent) => {
    setRequestModal({ isOpen: true, event });
    setEmail("");
  };

  const closeRequestModal = () => {
    setRequestModal({ isOpen: false, event: null });
    setEmail("");
    setIsSubmitting(false);
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestModal.event || !email) return;

    setIsSubmitting(true);

    const event = requestModal.event;

    try {
      const response = await fetch('/api/request-preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          company: event.company.friendlyName ?? event.company.name,
          ticker: event.company.ticker,
          date: formatDisplayDate(event.date),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit request');
      }

      // Success - close modal
      closeRequestModal();
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('Failed to submit request. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-2xl">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="search"
              placeholder="Search by ticker, company name, or ISIN..."
              className="w-full rounded-lg border border-border bg-card pl-11 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground shadow-sm transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Days Toggle - Inline */}
            <div className="flex items-center gap-1.5 border-r border-border pr-2">
              {[7, 14, 30].map((days) => (
                <button
                  key={days}
                  onClick={() => setFilters({ ...filters, days })}
                  className={`px-3 py-2 text-xs font-semibold rounded transition-all ${
                    filters.days === days
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-muted-foreground hover:text-foreground hover:bg-card/80"
                  }`}
                >
                  {days}d
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground shadow-sm transition-all hover:bg-card/80 hover:border-primary/50"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {activeFiltersCount > 0 && (
                <span className="inline-flex items-center justify-center h-4 min-w-4 rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="rounded-lg border border-border bg-card/50 backdrop-blur-sm p-4 shadow-lg space-y-4">
            <div>
              <h3 className="text-xs font-bold text-foreground mb-2 uppercase tracking-wider">Company Filters</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label htmlFor="sector" className="block text-xs font-semibold text-foreground mb-1.5">
                  Sector
                </label>
                <select
                  id="sector"
                  className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground shadow-sm transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={filters.sector}
                  onChange={(e) => setFilters({ ...filters, sector: e.target.value })}
                >
                  <option value="">All sectors</option>
                  {filterOptions.sectors.map((sector) => (
                    <option key={sector} value={sector}>
                      {sector}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="industry" className="block text-xs font-semibold text-foreground mb-1.5">
                  Industry
                </label>
                <select
                  id="industry"
                  className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground shadow-sm transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={filters.industry}
                  onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
                >
                  <option value="">All industries</option>
                  {filterOptions.industries.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="country" className="block text-xs font-semibold text-foreground mb-1.5">
                  Country
                </label>
                <select
                  id="country"
                  className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground shadow-sm transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={filters.country}
                  onChange={(e) => setFilters({ ...filters, country: e.target.value })}
                >
                  <option value="">All countries</option>
                  {filterOptions.countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="marketCap" className="block text-xs font-semibold text-foreground mb-1.5">
                  Min Market Cap ($M)
                </label>
                <input
                  id="marketCap"
                  type="number"
                  placeholder="e.g. 1000"
                  className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground shadow-sm transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={filters.minMarketCap}
                  onChange={(e) => setFilters({ ...filters, minMarketCap: e.target.value })}
                />
              </div>
            </div>
            </div>

            {/* Score Filters */}
            <div>
              <h3 className="text-xs font-bold text-foreground mb-2 uppercase tracking-wider">AI-Forecast Filters</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label htmlFor="minOverall" className="block text-xs font-semibold text-foreground mb-1.5">
                    Min Overall
                  </label>
                  <input
                    id="minOverall"
                    type="number"
                    placeholder="-5 to +5"
                    step="0.5"
                    min="-5"
                    max="5"
                    className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground shadow-sm transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={filters.minOverallScore}
                    onChange={(e) => setFilters({ ...filters, minOverallScore: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="minNews" className="block text-xs font-semibold text-foreground mb-1.5">
                    Min News
                  </label>
                  <input
                    id="minNews"
                    type="number"
                    placeholder="-5 to +5"
                    step="0.5"
                    min="-5"
                    max="5"
                    className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground shadow-sm transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={filters.minNewsScore}
                    onChange={(e) => setFilters({ ...filters, minNewsScore: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="minReadx" className="block text-xs font-semibold text-foreground mb-1.5">
                    Min ReadX
                  </label>
                  <input
                    id="minReadx"
                    type="number"
                    placeholder="-5 to +5"
                    step="0.5"
                    min="-5"
                    max="5"
                    className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground shadow-sm transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={filters.minReadxScore}
                    onChange={(e) => setFilters({ ...filters, minReadxScore: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {activeFiltersCount > 0 && (
              <div className="mt-3 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          <span className="font-bold text-primary">{filteredByScores.length}</span> of{" "}
          <span className="font-semibold text-foreground">{events.length}</span> events
        </p>
      </div>

      {/* Calendar Events */}
      {sortedDates.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-border bg-card/30 p-8 text-center">
          <svg className="mx-auto h-10 w-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="mt-3 text-sm font-semibold text-foreground">No earnings events found</p>
          <p className="mt-1 text-xs text-muted-foreground">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedDates.map((isoDate) => {
            const list = grouped[isoDate];
            const isCollapsed = collapsedDays[isoDate] || false;
            return (
              <section
                key={isoDate}
                className="overflow-hidden rounded-lg border border-border bg-card shadow-lg shadow-black/5"
              >
                <header
                  className="border-b border-border bg-card/80 backdrop-blur-sm px-4 py-2.5 cursor-pointer hover:bg-card transition-colors select-none"
                  onClick={() => toggleDay(isoDate)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-semibold text-foreground tracking-tight">
                        {formatDisplayDate(isoDate)}
                      </h2>
                      <p className="mt-0.5 text-xs text-muted-foreground font-medium">
                        {list.length} {list.length === 1 ? "company" : "companies"}
                      </p>
                    </div>
                    <svg
                      className={`h-5 w-5 text-muted-foreground transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </header>
                {!isCollapsed && (
                  <ul className="divide-y divide-border/50">
                  {list.map((event) => (
                    <li key={`${event.id}-${event.company.isin}`} className="transition-all hover:bg-card/50">
                      <div className="px-4 py-2.5">
                        <div className="flex items-center gap-3">
                          {/* Ticker - now with violet color */}
                          {event.company.ticker && (
                            <span className="inline-flex items-center rounded-md bg-violet/15 px-2.5 py-1 text-xs font-mono font-bold text-violet-400 border border-violet-500/30 shrink-0">
                              {event.company.ticker}
                            </span>
                          )}

                          {/* Company Name */}
                          <span className="text-sm font-semibold text-foreground truncate max-w-[200px]" title={event.company.friendlyName ?? event.company.name ?? "Company name unavailable"}>
                            {event.company.friendlyName ?? event.company.name ?? "Company name unavailable"}
                          </span>

                          {/* Sector */}
                          {event.company.gicsSector && (
                            <span className="text-xs font-medium text-muted-foreground/60 shrink-0 truncate max-w-[140px]" title={event.company.gicsSector}>
                              · {event.company.gicsSector}
                            </span>
                          )}

                          {/* Country */}
                          {event.company.country && (
                            <span className="text-xs font-medium text-muted-foreground/60 shrink-0 truncate max-w-[100px]" title={event.company.country}>
                              · {event.company.country}
                            </span>
                          )}

                          {/* Market Cap - subtle text style */}
                          {event.company.marketCapMillion !== null && (
                            <span className="text-xs font-medium text-muted-foreground/60 shrink-0">
                              · {formatMarketCap(event.company.marketCapMillion)}
                            </span>
                          )}

                          {/* AI-Forecast - right-aligned before action button */}
                          <div className="flex items-center gap-3 ml-auto">
                            {event.preview?.scores && (
                              <div className="flex items-center gap-3 text-xs">
                                <span className="text-muted-foreground font-semibold uppercase tracking-wider shrink-0">AI-Forecast:</span>
                                <div className="flex items-center gap-3">
                                  {event.preview.scores.overall !== null && (
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-muted-foreground/80">Overall</span>
                                      <span className={`font-bold ${getScoreColor(event.preview.scores.overall).text}`}>
                                        {formatScore(event.preview.scores.overall)}
                                      </span>
                                    </div>
                                  )}
                                  {event.preview.scores.news !== null && (
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-muted-foreground/80">News</span>
                                      <span className={`font-bold ${getScoreColor(event.preview.scores.news).text}`}>
                                        {formatScore(event.preview.scores.news)}
                                      </span>
                                    </div>
                                  )}
                                  {event.preview.scores.readx !== null && (
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-muted-foreground/80">ReadX</span>
                                      <span className={`font-bold ${getScoreColor(event.preview.scores.readx).text}`}>
                                        {formatScore(event.preview.scores.readx)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Action Button */}
                            {event.preview ? (
                              <a
                                href={event.preview.storageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 shrink-0"
                              >
                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                View AI Preview
                              </a>
                            ) : (
                              <button
                                onClick={() => openRequestModal(event)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-all hover:bg-background hover:border-primary/50 hover:text-foreground shrink-0 cursor-pointer"
                              >
                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Request Preview
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}

      {/* Request Preview Modal */}
      {requestModal.isOpen && requestModal.event && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={closeRequestModal}>
          <div className="bg-card border border-border rounded-lg shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Request AI Preview</h3>
                <p className="text-sm text-muted-foreground mt-1">We&apos;ll email you the earnings preview</p>
              </div>
              <button
                onClick={closeRequestModal}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="bg-background rounded-lg border border-border p-4 mb-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {requestModal.event.company.ticker && (
                    <span className="inline-flex items-center rounded-md bg-violet/15 px-2 py-0.5 text-xs font-mono font-bold text-violet-400 border border-violet-500/30">
                      {requestModal.event.company.ticker}
                    </span>
                  )}
                  <span className="text-sm font-semibold text-foreground">
                    {requestModal.event.company.friendlyName ?? requestModal.event.company.name}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Earnings Date: {formatDisplayDate(requestModal.event.date)}
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2">
                  Your Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground shadow-sm transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeRequestModal}
                  className="flex-1 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-all hover:bg-background"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  disabled={isSubmitting || !email}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
