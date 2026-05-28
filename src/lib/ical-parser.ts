import ICAL from "ical.js";

export type BookedRange = {
  start: Date;
  end: Date;
};

// iCal feeds represent bookings as either VALUE=DATE (calendar-date floating)
// or timed UTC datetimes (e.g. checkout at 10:00Z). We want hotel-style
// "this calendar date is booked" semantics in both cases — the time-of-day
// on a checkout boundary must not bleed past local midnight in another
// timezone, or the checkout day will display as booked. Build a Date at
// local midnight from the iCal time's own year/month/day so downstream
// comparisons against calendar dates (also at local midnight) are stable.
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
