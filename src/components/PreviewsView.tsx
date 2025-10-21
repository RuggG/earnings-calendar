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
    <div className="space-y-6">
      {dates.map((isoDate) => {
        const dayEvents = grouped[isoDate] ?? [];

        return (
          <section
            key={isoDate}
            className="rounded-xl border border-slate-200 bg-white shadow-sm"
          >
            <header className="border-b border-slate-200 bg-slate-50 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">
                {formatDate(isoDate)}
              </h2>
              <p className="text-sm text-slate-500">
                {dayEvents.length}{" "}
                {dayEvents.length === 1
                  ? "company scheduled"
                  : "companies scheduled"}
              </p>
            </header>

            {dayEvents.length === 0 ? (
              <div className="px-6 py-10 text-sm text-slate-500">
                No earnings on the calendar for this date.
              </div>
            ) : (
              <ul className="divide-y divide-slate-200">
                {dayEvents.map((event) => (
                  <li key={`${event.id}-${event.company.isin}`}>
                    <div className="flex flex-col gap-3 px-6 py-4 md:flex-row md:items-center md:justify-between">
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
                      <div className="flex flex-col items-start gap-2 md:items-end">
                        {event.preview ? (
                          <>
                            <a
                              href={event.preview.storageUrl}
                              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                              target="_blank"
                              rel="noreferrer noopener"
                            >
                              View earnings preview
                            </a>
                            {formatTimestamp(event.preview.generatedAt) ? (
                              <p className="text-xs text-slate-500">
                                Updated{" "}
                                {formatTimestamp(event.preview.generatedAt)}
                              </p>
                            ) : null}
                          </>
                        ) : (
                          <p className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                            Preview pending
                          </p>
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
