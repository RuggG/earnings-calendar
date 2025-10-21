"use client";

import { useMemo, useState } from "react";
import { parseISO, format } from "date-fns";
import type { EarningsEvent } from "@/lib/types";

type Props = {
  events: EarningsEvent[];
};

type GroupedEvents = Record<string, EarningsEvent[]>;

const formatDisplayDate = (isoDate: string) => {
  const parsed = parseISO(isoDate);
  return format(parsed, "EEEE, MMMM d, yyyy");
};

const normalize = (value: string | null | undefined) =>
  (value ?? "").toLowerCase();

export function CalendarView({ events }: Props) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEvents = useMemo(() => {
    if (!searchTerm.trim()) {
      return events;
    }

    const term = searchTerm.toLowerCase();

    return events.filter(({ company }) => {
      return [
        company.ticker,
        company.friendlyName,
        company.name,
        company.isin,
      ]
        .map(normalize)
        .some((value) => value.includes(term));
    });
  }, [events, searchTerm]);

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

  return (
    <div className="space-y-8">
      <div className="relative max-w-2xl">
        <label htmlFor="search" className="block text-sm font-semibold text-slate-700">
          Search companies
        </label>
        <div className="relative mt-2">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            id="search"
            type="search"
            placeholder="Search by ticker, company name, or ISIN..."
            className="w-full rounded-xl border border-blue-100 bg-white/80 pl-11 pr-4 py-3 text-slate-900 shadow-sm backdrop-blur-sm transition focus:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-100"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
      </div>

      {sortedDates.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/30 p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="mt-4 text-sm font-medium text-slate-600">No earnings events found</p>
          <p className="mt-1 text-sm text-slate-500">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((isoDate) => {
            const list = grouped[isoDate];
            return (
              <section
                key={isoDate}
                className="overflow-hidden rounded-2xl border border-blue-100/50 bg-white/80 shadow-lg shadow-blue-100/20 backdrop-blur-sm"
              >
                <header className="border-b border-blue-100/50 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 px-8 py-5">
                  <h2 className="text-xl font-bold text-slate-900">
                    {formatDisplayDate(isoDate)}
                  </h2>
                  <p className="mt-1 text-sm font-medium text-slate-600">
                    {list.length} {list.length === 1 ? "company" : "companies"}
                  </p>
                </header>
                <ul className="divide-y divide-blue-50">
                  {list.map((event) => (
                    <li key={`${event.id}-${event.company.isin}`} className="transition hover:bg-blue-50/30">
                      <div className="flex flex-col gap-3 px-8 py-5 md:flex-row md:items-center md:justify-between">
                        <div className="flex-1">
                          <p className="text-lg font-semibold text-slate-900">
                            {event.company.friendlyName ??
                              event.company.name ??
                              "Company name unavailable"}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {event.company.ticker && (
                              <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-mono font-semibold text-blue-700">
                                {event.company.ticker}
                              </span>
                            )}
                            {event.company.country && (
                              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                                {event.company.country}
                              </span>
                            )}
                            <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-xs font-mono text-slate-500">
                              {event.company.isin}
                            </span>
                            {event.source && (
                              <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                                {event.source}
                              </span>
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
