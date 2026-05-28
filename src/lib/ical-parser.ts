import ICAL from "ical.js";

export type BookedRange = {
  start: Date;
  end: Date;
};

// Airbnb's per-reservation iCal entries use timed UTC datetimes
// (e.g. DTSTART:20260619T160000Z). ical.js's toJSDate() carries that
// instant through unchanged, so on a non-UTC viewer the booking lands
// one calendar day off when compared at local midnight. Read the iCal
// time's own year/month/day and build a Date at local midnight — the
// booking is treated as a calendar-date range, and downstream
// comparisons against local-midnight calendar days are stable.
function toLocalMidnight(time: ICAL.Time): Date {
  return new Date(time.year, time.month - 1, time.day);
}

export function parseIcal(icalString: string): BookedRange[] {
  const jcal = ICAL.parse(icalString);
  const comp = new ICAL.Component(jcal);
  const events = comp.getAllSubcomponents("vevent");

  return events.map((event) => {
    const vevent = new ICAL.Event(event);
    return {
      start: toLocalMidnight(vevent.startDate),
      end: toLocalMidnight(vevent.endDate),
    };
  });
}

export function isDateBooked(date: Date, bookedRanges: BookedRange[]): boolean {
  return bookedRanges.some((range) => date >= range.start && date < range.end);
}
