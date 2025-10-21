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
    <div className="space-y-8">
      <header className="space-y-4">
        <h1 className="text-5xl font-bold text-slate-900 tracking-tight">
          Earnings Calendar
        </h1>
        <p className="max-w-3xl text-lg text-slate-600 leading-relaxed">
          Track upcoming earnings events from Primer Reports. Filter by sector, industry, country, or market cap.
          View available earnings previews or request new ones.
        </p>
      </header>

      <CalendarView events={events} />
    </div>
  );
}
