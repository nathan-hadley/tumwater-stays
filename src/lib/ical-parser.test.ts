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

// Airbnb's per-reservation iCal entries use timed UTC datetimes —
// e.g. DTSTART:20260619T160000Z / DTEND:20260620T100000Z for a 1-night
// stay checking in Jun 19 and out Jun 20. ical.js's toJSDate() carries
// that UTC instant through unchanged; on a Pacific viewer this lands
// the booking on Jun 20 instead of Jun 19. The parser must collapse
// timed entries to their calendar date so the day blocked matches what
// the host sees in Airbnb.
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

  it("collapses Airbnb's timed UTC entries to the iCal calendar date", () => {
    // Regression: previously these landed a day later on Pacific viewers
    // because the UTC instant survived the round trip.
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

  it("returns false for the checkout day so same-day turnover is allowed", () => {
    // DTEND is exclusive: the checkout day stays selectable as a new check-in.
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
