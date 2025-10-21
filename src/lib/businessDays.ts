import { addDays, format, startOfDay } from "date-fns";

export const ISO_DATE_FORMAT = "yyyy-MM-dd";

export function isBusinessDay(date: Date): boolean {
  const day = date.getDay();
  return day !== 0 && day !== 6;
}

export function getNextBusinessDays(
  count: number,
  fromDate: Date = new Date()
): Date[] {
  const result: Date[] = [];
  let cursor = startOfDay(fromDate);

  while (result.length < count) {
    if (result.length === 0 && isBusinessDay(cursor)) {
      result.push(cursor);
      continue;
    }

    cursor = addDays(cursor, 1);
    if (isBusinessDay(cursor)) {
      result.push(cursor);
    }
  }

  return result;
}

export function toISODate(date: Date): string {
  return format(startOfDay(date), ISO_DATE_FORMAT);
}
