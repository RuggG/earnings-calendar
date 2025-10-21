import { addDays, isWeekend, startOfDay } from 'date-fns';

/**
 * Get the next N business days (excluding weekends)
 */
export function getNextBusinessDays(count: number): Date[] {
  const businessDays: Date[] = [];
  let currentDate = startOfDay(new Date());

  while (businessDays.length < count) {
    currentDate = addDays(currentDate, 1);
    if (!isWeekend(currentDate)) {
      businessDays.push(new Date(currentDate));
    }
  }

  return businessDays;
}

/**
 * Format date to YYYY-MM-DD for database queries
 */
export function formatDateForDB(date: Date): string {
  return date.toISOString().split('T')[0];
}
