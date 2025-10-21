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
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-1.5 text-sm font-semibold text-blue-700">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
          Earnings Previews
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 sm:text-5xl">
          Next 5 Business Days
        </h1>
        <p className="max-w-3xl text-lg text-slate-600 leading-relaxed">
          View earnings previews for companies reporting in the next five business days.
          Click &quot;View Preview&quot; to access published earnings reports from Primer Reports.
        </p>
      </header>

      <PreviewsView dates={isoDates} events={events} />
    </div>
  );
}
