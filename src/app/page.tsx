import { getEarningsCalendar } from '@/lib/queries';
import { format } from 'date-fns';
import { EarningsCalendarDay } from '@/lib/types';

async function EarningsCalendar() {
  const calendar = await getEarningsCalendar(5);

  return (
    <div className="space-y-6">
      {calendar.map((day: EarningsCalendarDay) => (
        <div key={day.dateString} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            {format(day.date, 'EEEE, MMMM d, yyyy')}
          </h2>

          {day.events.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 italic">No earnings reports scheduled</p>
          ) : (
            <div className="space-y-3">
              {day.events.map((event) => (
                <div
                  key={event.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-md p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                        {event.company?.name || 'Unknown Company'}
                      </h3>
                      <div className="flex gap-3 text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {event.company?.ticker && (
                          <span className="font-mono font-medium">{event.company.ticker}</span>
                        )}
                        {event.time && (
                          <span>{event.time}</span>
                        )}
                        {event.company?.country && (
                          <span>{event.company.country}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        ISIN: {event.isin}
                      </p>
                    </div>

                    {event.report && (
                      <a
                        href={event.report.storage_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors text-sm whitespace-nowrap"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        View Earnings Preview
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default async function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Earnings Calendar
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Next 5 business days of earnings reports and previews
          </p>
        </header>

        <EarningsCalendar />
      </div>
    </div>
  );
}
