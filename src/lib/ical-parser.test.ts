import { describe, expect, it } from "vitest";

import { isDateBooked, parseIcal } from "./ical-parser";

const SAMPLE_ICAL = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//EN
BEGIN:VEVENT
UID:booking-1@test
DTSTART;VALUE=DATE:20260601
DTEND;VALUE=DATE:20260605
SUMMARY:Booked
END:VEVENT
BEGIN:VEVENT
UID:booking-2@test
DTSTART;VALUE=DATE:20260710
DTEND;VALUE=DATE:20260712
SUMMARY:Booked
END:VEVENT
END:VCALENDAR`;

// A timed UTC booking — the format Airbnb uses for real reservations.
const TIMED_UTC_ICAL = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//EN
BEGIN:VEVENT
UID:booking-timed@test
DTSTART:20260619T160000Z
DTEND:20260620T100000Z
SUMMARY:Reserved
END:VEVENT
END:VCALENDAR`;

describe("parseIcal", () => {
  it("returns one BookedRange per VEVENT", () => {
    const ranges = parseIcal(SAMPLE_ICAL);
    expect(ranges).toHaveLength(2);
  });

  it("parses VALUE=DATE events at local midnight of the iCal date", () => {
    const [first] = parseIcal(SAMPLE_ICAL);
    expect(first?.start.getFullYear()).toBe(2026);
    expect(first?.start.getMonth()).toBe(5); // June (0-indexed)
    expect(first?.start.getDate()).toBe(1);
    expect(first?.start.getHours()).toBe(0);
    expect(first?.end.getDate()).toBe(5);
    expect(first?.end.getHours()).toBe(0);
  });

  it("collapses timed UTC entries to the iCal calendar date", () => {
    const [range] = parseIcal(TIMED_UTC_ICAL);
    expect(range?.start.getFullYear()).toBe(2026);
    expect(range?.start.getMonth()).toBe(5);
    expect(range?.start.getDate()).toBe(19);
    expect(range?.start.getHours()).toBe(0);
    expect(range?.end.getDate()).toBe(20);
    expect(range?.end.getHours()).toBe(0);
  });
});

describe("isDateBooked", () => {
  const ranges = parseIcal(SAMPLE_ICAL);

  it("returns true for a date inside a booked range", () => {
    expect(isDateBooked(new Date(2026, 5, 2), ranges)).toBe(true);
  });

  it("returns false for the checkout day (DTEND is exclusive)", () => {
    expect(isDateBooked(new Date(2026, 5, 5), ranges)).toBe(false);
  });

  it("returns false for a date outside all ranges", () => {
    expect(isDateBooked(new Date(2026, 5, 20), ranges)).toBe(false);
  });

  it("blocks the check-in day of a timed Airbnb booking, not the day after", () => {
    const timedRanges = parseIcal(TIMED_UTC_ICAL);
    expect(isDateBooked(new Date(2026, 5, 19), timedRanges)).toBe(true);
    expect(isDateBooked(new Date(2026, 5, 20), timedRanges)).toBe(false);
  });
});
