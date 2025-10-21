"use client";

import { useMemo, useState } from "react";
import { parseISO, format } from "date-fns";
import type { EarningsEvent } from "@/lib/types";

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
};

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

export function CalendarView({ events }: Props) {
  const [filters, setFilters] = useState<Filters>({
    search: "",
    sector: "",
    industry: "",
    country: "",
    minMarketCap: "",
    days: 30,
  });
  const [showFilters, setShowFilters] = useState(false);

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

  const grouped = useMemo(() => {
    return filteredEvents.reduce<GroupedEvents>((acc, event) => {
      const bucket = event.date;
      acc[bucket] = acc[bucket] ?? [];
      acc[bucket].push(event);
      return acc;
    }, {});
  }, [filteredEvents]);

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
    });
  };

  return (
    <div className="space-y-6">
      {/* Days Toggle */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-slate-700">Show:</span>
        {[7, 14, 30].map((days) => (
          <button
            key={days}
            onClick={() => setFilters({ ...filters, days })}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
              filters.days === days
                ? "bg-violet-600 text-white shadow-sm"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {days} days
          </button>
        ))}
      </div>

      {/* Search and Filter Controls */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-2xl">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="search"
              placeholder="Search by ticker, company name, or ISIN..."
              className="w-full rounded-lg border border-slate-200 bg-white pl-11 pr-4 py-3 text-slate-900 shadow-sm transition focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
            {activeFiltersCount > 0 && (
              <span className="inline-flex items-center justify-center h-5 min-w-5 rounded-full bg-violet-600 px-1.5 text-xs font-semibold text-white">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label htmlFor="sector" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Sector
                </label>
                <select
                  id="sector"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
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
                <label htmlFor="industry" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Industry
                </label>
                <select
                  id="industry"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
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
                <label htmlFor="country" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Country
                </label>
                <select
                  id="country"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
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
                <label htmlFor="marketCap" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Min Market Cap ($M)
                </label>
                <input
                  id="marketCap"
                  type="number"
                  placeholder="e.g. 1000"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
                  value={filters.minMarketCap}
                  onChange={(e) => setFilters({ ...filters, minMarketCap: e.target.value })}
                />
              </div>
            </div>

            {activeFiltersCount > 0 && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="text-sm font-medium text-violet-600 hover:text-violet-700 transition"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Showing <span className="font-semibold text-slate-900">{filteredEvents.length}</span> of{" "}
          <span className="font-semibold text-slate-900">{events.length}</span> earnings events
        </p>
      </div>

      {/* Calendar Events */}
      {sortedDates.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="mt-4 text-sm font-medium text-slate-600">No earnings events found</p>
          <p className="mt-1 text-sm text-slate-500">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedDates.map((isoDate) => {
            const list = grouped[isoDate];
            return (
              <section
                key={isoDate}
                className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
              >
                <header className="border-b border-slate-100 bg-slate-50 px-6 py-4">
                  <h2 className="text-lg font-semibold text-slate-900">
                    {formatDisplayDate(isoDate)}
                  </h2>
                  <p className="mt-0.5 text-sm text-slate-600">
                    {list.length} {list.length === 1 ? "company" : "companies"}
                  </p>
                </header>
                <ul className="divide-y divide-slate-100">
                  {list.map((event) => (
                    <li key={`${event.id}-${event.company.isin}`} className="transition hover:bg-slate-50">
                      <div className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {/* Ticker */}
                          {event.company.ticker && (
                            <span className="inline-flex items-center rounded-md bg-slate-900 px-2.5 py-1 text-xs font-mono font-semibold text-white shrink-0">
                              {event.company.ticker}
                            </span>
                          )}

                          {/* Company Name */}
                          <span className="text-sm font-semibold text-slate-900 truncate">
                            {event.company.friendlyName ?? event.company.name ?? "Company name unavailable"}
                          </span>

                          {/* Metadata Tags */}
                          <div className="flex flex-wrap items-center gap-2 ml-auto">
                            {event.company.gicsSector && (
                              <span className="inline-flex items-center rounded-md bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700 border border-violet-200 shrink-0">
                                {event.company.gicsSector}
                              </span>
                            )}
                            {event.company.country && (
                              <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 border border-blue-200 shrink-0">
                                {event.company.country}
                              </span>
                            )}
                            {event.company.marketCapMillion !== null && (
                              <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200 shrink-0">
                                {formatMarketCap(event.company.marketCapMillion)}
                              </span>
                            )}

                            {/* Action Button */}
                            {event.preview ? (
                              <a
                                href={event.preview.storageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-violet-700 shrink-0"
                              >
                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                </svg>
                                View
                              </a>
                            ) : (
                              <a
                                href={`mailto:hello@primerapp.com?subject=Request Earnings Preview for ${event.company.ticker ?? event.company.friendlyName ?? event.company.isin}&body=Hi, I would like to request an earnings preview for ${event.company.friendlyName ?? event.company.name} (${event.company.ticker ?? event.company.isin}) scheduled for ${formatDisplayDate(event.date)}.`}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-violet-200 bg-white px-3 py-1.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-50 hover:border-violet-300 shrink-0"
                              >
                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Request
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
