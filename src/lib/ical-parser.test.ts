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

describe("parseIcal", () => {
  it("returns one BookedRange per VEVENT", () => {
    const ranges = parseIcal(SAMPLE_ICAL);
    expect(ranges).toHaveLength(2);
  });

  it("parses event start dates and shifts end back by one day", () => {
    // The shift keeps the last day of each booked range selectable so a
    // new guest can check in on the same day the previous one checks out.
    const [first] = parseIcal(SAMPLE_ICAL);
    expect(first?.start.getFullYear()).toBe(2026);
    expect(first?.start.getMonth()).toBe(5); // June (0-indexed)
    expect(first?.start.getDate()).toBe(1);
    expect(first?.end.getDate()).toBe(4);
  });
});

describe("isDateBooked", () => {
  const ranges = parseIcal(SAMPLE_ICAL);

  it("returns true for a date inside a booked range", () => {
    expect(isDateBooked(new Date(2026, 5, 2), ranges)).toBe(true);
  });

  it("leaves the last day of each range selectable for same-day turnover", () => {
    // DTEND=20260605 -> day Jun 4 stays available so a new guest can check
    // in on the same day the previous one checks out.
    expect(isDateBooked(new Date(2026, 5, 4), ranges)).toBe(false);
  });

  it("returns false for a date outside all ranges", () => {
    expect(isDateBooked(new Date(2026, 5, 20), ranges)).toBe(false);
  });
});
