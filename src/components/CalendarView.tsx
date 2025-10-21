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
      <div className="max-w-xl">
        <label htmlFor="search" className="block text-sm font-medium">
          Filter by ticker, name, or ISIN
        </label>
        <input
          id="search"
          type="search"
          placeholder="e.g. AAPL, Apple, US0378331005"
          className="mt-2 w-full rounded-md border border-slate-300 bg-white px-4 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </div>

      {sortedDates.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
          No earnings events found for this range.
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((isoDate) => {
            const list = grouped[isoDate];
            return (
              <section
                key={isoDate}
                className="rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                <header className="border-b border-slate-200 bg-slate-50 px-6 py-4">
                  <h2 className="text-lg font-semibold text-slate-900">
                    {formatDisplayDate(isoDate)}
                  </h2>
                </header>
                <ul className="divide-y divide-slate-200">
                  {list.map((event) => (
                    <li key={`${event.id}-${event.company.isin}`}>
                      <div className="flex flex-col gap-2 px-6 py-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-base font-medium text-slate-900">
                            {event.company.friendlyName ??
                              event.company.name ??
                              "Company name unavailable"}
                          </p>
                          <p className="text-sm text-slate-500">
                            {[
                              event.company.ticker,
                              event.company.isin,
                              event.company.country,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        </div>
                        <div className="text-sm text-slate-500">
                          Source: {event.source ?? "unknown"}
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
