import { describe, expect, it } from "vitest";
import { getNextBusinessDays, isBusinessDay, toISODate } from "./businessDays";

describe("business day utilities", () => {
  it("includes the starting day when it is a business day", () => {
    const start = new Date("2025-10-20T12:00:00Z"); // Monday
    const days = getNextBusinessDays(3, start);

    expect(days).toHaveLength(3);
    expect(toISODate(days[0])).toBe("2025-10-20");
    expect(isBusinessDay(days[0])).toBe(true);
  });

  it("skips weekends when building the list", () => {
    const start = new Date("2025-10-18T12:00:00Z"); // Saturday
    const days = getNextBusinessDays(3, start);

    expect(toISODate(days[0])).toBe("2025-10-20");
    expect(toISODate(days[1])).toBe("2025-10-21");
    expect(toISODate(days[2])).toBe("2025-10-22");
  });
});
