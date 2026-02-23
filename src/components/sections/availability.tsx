import { units } from "@/data/units";
import { AvailabilityCalendar } from "@/components/availability-calendar";

export function Availability() {
  return (
    <section id="availability" className="py-20 px-4 bg-surface-dark">
      <div className="max-w-4xl mx-auto">
        {/* Section heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-normal text-foreground">
            Availability
          </h2>
          <div className="mt-3 mx-auto h-1 w-16 rounded-full bg-accent-warm" />
          <p className="mt-4 text-muted-foreground text-lg">
            Check available dates for each unit
          </p>
        </div>

        {/* Calendars grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {units.map((unit) => (
            <AvailabilityCalendar
              key={unit.id}
              unitId={unit.id}
              unitName={unit.name}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
