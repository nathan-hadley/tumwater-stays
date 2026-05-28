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
    // Airbnb's iCal includes the checkout day inside DTEND, so a booking
    // checking out on Jun 5 exports as DTEND=20260606. Shift end back by
    // one so the checkout day stays available for same-day turnover.
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
