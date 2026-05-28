import ICAL from "ical.js";

export type BookedRange = {
  start: Date;
  end: Date;
};

// Use the iCal date components as a calendar date, ignoring any
// time-of-day, so bookings don't shift across viewer timezones.
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
