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
    <div className="space-y-6">
      <header className="pb-4 border-b border-border/50">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground tracking-tight">
              AI Earnings Calendar
            </h1>
            <p className="text-base text-primary font-semibold">
              World&apos;s first AI-powered earnings calendar
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="inline-flex items-center gap-1.5 text-foreground">
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <span className="font-medium">AI-estimated dates</span>
            </div>
            <div className="inline-flex items-center gap-1.5 text-foreground">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="font-medium">Real-time previews</span>
            </div>
          </div>
        </div>
      </header>

      <CalendarView events={events} />
    </div>
  );
}
