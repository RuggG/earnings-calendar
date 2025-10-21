"use client";

import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import type { EarningsPreview } from "@/lib/types";

type Props = {
  dates: string[];
  events: EarningsPreview[];
};

type GroupedEvents = Record<string, EarningsPreview[]>;

const formatDate = (isoDate: string) =>
  format(parseISO(isoDate), "EEEE, MMMM d, yyyy");

const formatTimestamp = (isoDateTime: string | undefined) => {
  if (!isoDateTime) return null;
  try {
    return format(parseISO(isoDateTime), "MMM d, yyyy · HH:mm 'UTC'");
  } catch {
    return null;
  }
};

export function PreviewsView({ dates, events }: Props) {
  const grouped = useMemo(() => {
    return events.reduce<GroupedEvents>((acc, event) => {
      const key = event.date;
      acc[key] = acc[key] ?? [];
      acc[key].push(event);
      return acc;
    }, {});
  }, [events]);

  return (
    <div className="space-y-8">
      {dates.map((isoDate) => {
        const dayEvents = grouped[isoDate] ?? [];

        return (
          <section
            key={isoDate}
            className="overflow-hidden rounded-2xl border border-blue-100/50 bg-white/80 shadow-lg shadow-blue-100/20 backdrop-blur-sm"
          >
            <header className="border-b border-blue-100/50 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 px-8 py-5">
              <h2 className="text-xl font-bold text-slate-900">
                {formatDate(isoDate)}
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-600">
                {dayEvents.length}{" "}
                {dayEvents.length === 1
                  ? "company scheduled"
                  : "companies scheduled"}
              </p>
            </header>

            {dayEvents.length === 0 ? (
              <div className="px-8 py-12 text-center text-sm text-slate-500">
                No earnings on the calendar for this date.
              </div>
            ) : (
              <ul className="divide-y divide-blue-50">
                {dayEvents.map((event) => (
                  <li key={`${event.id}-${event.company.isin}`} className="transition hover:bg-blue-50/30">
                    <div className="flex flex-col gap-4 px-8 py-5 md:flex-row md:items-center md:justify-between">
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
                        </div>
                      </div>
                      <div className="flex flex-col items-start gap-2 md:items-end md:ml-4">
                        {event.preview ? (
                          <>
                            <a
                              href={event.preview.storageUrl}
                              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/30 transition hover:from-blue-500 hover:to-indigo-500 hover:shadow-lg hover:shadow-blue-500/40"
                              target="_blank"
                              rel="noreferrer noopener"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              View Preview
                            </a>
                            {formatTimestamp(event.preview.generatedAt) ? (
                              <p className="text-xs text-slate-500">
                                Updated {formatTimestamp(event.preview.generatedAt)}
                              </p>
                            ) : null}
                          </>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20">
                            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            Preview Pending
                          </span>
                        )}
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
  );
}
