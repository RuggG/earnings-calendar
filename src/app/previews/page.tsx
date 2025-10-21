import { PreviewsView } from "@/components/PreviewsView";
import { getNextBusinessDays, toISODate } from "@/lib/businessDays";
import { fetchPreviewsForDates } from "@/lib/queries";

export const revalidate = 60;
export const dynamic = "force-dynamic";

export default async function PreviewsPage() {
  const businessDays = getNextBusinessDays(5);
  const isoDates = businessDays.map(toISODate);
  const events = await fetchPreviewsForDates({ isoDates });

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Earnings previews
        </p>
        <h1 className="text-3xl font-bold text-slate-900">
          Next five business days
        </h1>
        <p className="max-w-2xl text-base text-slate-600">
          Companies with earnings scheduled over the next five business days.
          When an earnings preview has already been published in Primer
          Reports, you can launch it directly from the table below.
        </p>
      </header>

      <PreviewsView dates={isoDates} events={events} />
    </div>
  );
}
