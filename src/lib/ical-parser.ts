import ICAL from "ical.js";

export type BookedRange = {
  start: Date;
  end: Date;
};

export function parseIcal(icalString: string): BookedRange[] {
  const jcal = ICAL.parse(icalString);
  const comp = new ICAL.Component(jcal);
  const events = comp.getAllSubcomponents("vevent");

  return events.map((event) => {
    const vevent = new ICAL.Event(event);
    const end = vevent.endDate.toJSDate();
    // Allow same-day turnover: the previous guest can check out and a new
    // guest can check in on the same calendar day. Shift end back by one
    // so the last day of each booked range stays selectable as a new
    // check-in, regardless of how the upstream feed encodes that day.
    end.setDate(end.getDate() - 1);
    return {
      start: vevent.startDate.toJSDate(),
      end,
    };
  });
}

export function isDateBooked(date: Date, bookedRanges: BookedRange[]): boolean {
  return bookedRanges.some((range) => date >= range.start && date < range.end);
}
