"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  addMonths,
  subMonths,
  isSameDay,
  isBefore,
  startOfDay,
  getDay,
} from "date-fns";
import { cn } from "@/lib/utils";

type BookedRange = {
  start: Date;
  end: Date;
};

function isDateBooked(date: Date, bookedRanges: BookedRange[]): boolean {
  return bookedRanges.some(
    (range) => date >= range.start && date < range.end
  );
}

type AvailabilityCalendarProps = {
  unitId: string;
  unitName: string;
};

export function AvailabilityCalendar({
  unitId,
  unitName,
}: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookedRanges, setBookedRanges] = useState<BookedRange[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAvailability() {
      try {
        const res = await fetch(`/api/availability?unit=${unitId}`);
        const data = await res.json();
        setBookedRanges(
          data.bookedRanges.map(
            (r: { start: string; end: string }) => ({
              start: new Date(r.start),
              end: new Date(r.end),
            })
          )
        );
      } catch {
        setBookedRanges([]);
      } finally {
        setLoading(false);
      }
    }
    fetchAvailability();
  }, [unitId]);

  const today = startOfDay(new Date());
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);

  const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div className="max-w-sm mx-auto">
      {/* Unit name label */}
      <h3 className="text-lg font-medium text-foreground mb-3 text-center">
        {unitName}
      </h3>

      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        {/* Month header with navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
            className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold text-foreground tracking-wide">
            {format(currentMonth, "MMMM yyyy")}
          </span>
          <button
            onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
            className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Day of week headers */}
        <div className="grid grid-cols-7 mb-1">
          {dayLabels.map((label, i) => (
            <div
              key={i}
              className="text-center text-xs font-medium text-muted-foreground py-1"
            >
              {label}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        {loading ? (
          <CalendarSkeleton startDayOfWeek={startDayOfWeek} dayCount={daysInMonth.length} />
        ) : (
          <div className="grid grid-cols-7">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: startDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {/* Day cells */}
            {daysInMonth.map((day) => {
              const isPast = isBefore(day, today);
              const isToday = isSameDay(day, today);
              const booked = isDateBooked(day, bookedRanges);

              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "aspect-square flex items-center justify-center text-sm rounded-md m-0.5 transition-colors",
                    isPast && !isToday && "text-muted-foreground/50",
                    isToday && "ring-2 ring-accent-warm ring-inset",
                    !isPast && !booked && "bg-info/10 text-info font-medium",
                    booked && !isPast && "bg-muted text-muted-foreground line-through",
                    booked && isPast && "text-muted-foreground/50 line-through"
                  )}
                >
                  {format(day, "d")}
                </div>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-border">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-info/10 border border-info/30" />
            <span className="text-xs text-muted-foreground">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-muted border border-border" />
            <span className="text-xs text-muted-foreground">Booked</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CalendarSkeleton({
  startDayOfWeek,
  dayCount,
}: {
  startDayOfWeek: number;
  dayCount: number;
}) {
  return (
    <div className="grid grid-cols-7">
      {Array.from({ length: startDayOfWeek }).map((_, i) => (
        <div key={`empty-${i}`} className="aspect-square" />
      ))}
      {Array.from({ length: dayCount }).map((_, i) => (
        <div
          key={`skel-${i}`}
          className="aspect-square flex items-center justify-center m-0.5"
        >
          <div className="w-6 h-6 rounded-md bg-muted animate-pulse" />
        </div>
      ))}
    </div>
  );
}
