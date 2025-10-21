import { addDays } from "date-fns";
import { CalendarView } from "@/components/CalendarView";
import { fetchEarningsCalendar } from "@/lib/queries";
import { toISODate } from "@/lib/businessDays";

export const revalidate = 60;
export const dynamic = "force-dynamic";

export default async function Home() {
  const today = new Date();
  const rangeEnd = addDays(today, 30);

  const events = await fetchEarningsCalendar({
    startDate: toISODate(today),
    endDate: toISODate(rangeEnd),
  });

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Upcoming earnings
        </p>
        <h1 className="text-3xl font-bold text-slate-900">
          Earnings calendar
        </h1>
        <p className="max-w-2xl text-base text-slate-600">
          Calendar of upcoming earnings events pulled from the Primer Reports
          data warehouse. Use the search box to find companies by ticker, name,
          or ISIN. The list spans the next 30 days by default.
        </p>
      </header>

      <CalendarView events={events} />
    </div>
  );
}
