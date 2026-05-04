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
    return {
      start: vevent.startDate.toJSDate(),
      end: vevent.endDate.toJSDate(),
    };
  });
}

export function isDateBooked(date: Date, bookedRanges: BookedRange[]): boolean {
  return bookedRanges.some((range) => date >= range.start && date < range.end);
}
