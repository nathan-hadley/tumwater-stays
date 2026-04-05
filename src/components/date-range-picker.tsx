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
  isAfter,
  startOfDay,
  getDay,
} from "date-fns";
import { cn } from "@/lib/utils";

type BookedRange = {
  start: Date;
  end: Date;
};

type Props = {
  unitId: "studio" | "onebr";
  checkIn: Date | null;
  checkOut: Date | null;
  onCheckInChange: (date: Date | null) => void;
  onCheckOutChange: (date: Date | null) => void;
};

function isDateBooked(date: Date, bookedRanges: BookedRange[]): boolean {
  return bookedRanges.some(
    (range) => date >= range.start && date < range.end
  );
}

function hasBookedDateInRange(
  start: Date,
  end: Date,
  bookedRanges: BookedRange[]
): boolean {
  const days = eachDayOfInterval({ start, end });
  // Check all days except the checkout day itself (checkout day can be a booked start)
  return days.slice(0, -1).some((day) => isDateBooked(day, bookedRanges));
}

const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function DateRangePicker({
  unitId,
  checkIn,
  checkOut,
  onCheckInChange,
  onCheckOutChange,
}: Props) {
  const [baseMonth, setBaseMonth] = useState(() => startOfMonth(new Date()));
  const [bookedRanges, setBookedRanges] = useState<BookedRange[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectingCheckOut, setSelectingCheckOut] = useState(false);

  useEffect(() => {
    async function fetchAvailability() {
      setLoading(true);
      try {
        const res = await fetch(`/api/availability?unit=${unitId}`);
        const data = await res.json();
        setBookedRanges(
          data.bookedRanges.map((r: { start: string; end: string }) => ({
            start: new Date(r.start),
            end: new Date(r.end),
          }))
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

  const handleDayClick = (day: Date) => {
    if (!selectingCheckOut || !checkIn) {
      onCheckInChange(day);
      onCheckOutChange(null);
      setSelectingCheckOut(true);
    } else {
      if (isBefore(day, checkIn) || isSameDay(day, checkIn)) {
        onCheckInChange(day);
        onCheckOutChange(null);
        setSelectingCheckOut(true);
      } else if (hasBookedDateInRange(checkIn, day, bookedRanges)) {
        onCheckInChange(day);
        onCheckOutChange(null);
        setSelectingCheckOut(true);
      } else {
        onCheckOutChange(day);
        setSelectingCheckOut(false);
      }
    }
  };

  const prevMonth = () => setBaseMonth((m) => subMonths(m, 1));
  const nextMonth = () => setBaseMonth((m) => addMonths(m, 1));


  return (
    <div>
      {/* Selection state label */}
      <div className="mb-3 flex items-center justify-between gap-4">
        <div
          className={cn(
            "flex-1 rounded-lg border px-3 py-2 text-center text-sm transition-colors",
            (!checkIn || (!selectingCheckOut && !checkOut))
              ? "border-accent-warm bg-accent-warm/5 font-medium text-foreground"
              : "border-border text-muted-foreground"
          )}
        >
          <div className="text-xs text-muted-foreground mb-0.5">Check-in</div>
          <div>{checkIn ? format(checkIn, "MMM d, yyyy") : "\u2014"}</div>
        </div>
        <div
          className={cn(
            "flex-1 rounded-lg border px-3 py-2 text-center text-sm transition-colors",
            selectingCheckOut && checkIn
              ? "border-accent-warm bg-accent-warm/5 font-medium text-foreground"
              : "border-border text-muted-foreground"
          )}
        >
          <div className="text-xs text-muted-foreground mb-0.5">Check-out</div>
          <div>{checkOut ? format(checkOut, "MMM d, yyyy") : "\u2014"}</div>
        </div>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={prevMonth}
          className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Desktop: show two month names, Mobile: show one */}
        <div className="text-sm font-semibold text-foreground tracking-wide">
          <span className="md:hidden">{format(baseMonth, "MMMM yyyy")}</span>
          <span className="hidden md:inline">
            {format(baseMonth, "MMMM yyyy")} &mdash;{" "}
            {format(addMonths(baseMonth, 1), "MMMM yyyy")}
          </span>
        </div>

        <button
          type="button"
          onClick={nextMonth}
          className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Calendar grids */}
      <div className="flex gap-4">
        {/* Month 1 (always visible) */}
        <div className="flex-1">
          <MonthGrid
            month={baseMonth}
            today={today}
            checkIn={checkIn}
            checkOut={checkOut}
            bookedRanges={bookedRanges}
            loading={loading}
            onDayClick={handleDayClick}
          />
        </div>

        {/* Month 2 (desktop only) */}
        <div className="hidden md:block flex-1">
          <MonthGrid
            month={addMonths(baseMonth, 1)}
            today={today}
            checkIn={checkIn}
            checkOut={checkOut}
            bookedRanges={bookedRanges}
            loading={loading}
            onDayClick={handleDayClick}
          />
        </div>
      </div>
    </div>
  );
}

/* ---------- Month Grid Sub-component ---------- */

type MonthGridProps = {
  month: Date;
  today: Date;
  checkIn: Date | null;
  checkOut: Date | null;
  bookedRanges: BookedRange[];
  loading: boolean;
  onDayClick: (day: Date) => void;
};

function MonthGrid({
  month,
  today,
  checkIn,
  checkOut,
  bookedRanges,
  loading,
  onDayClick,
}: MonthGridProps) {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);

  return (
    <div>
      {/* Mobile month label (shown when only one month grid is visible) */}
      <div className="text-center text-xs font-medium text-muted-foreground mb-2 md:block hidden">
        {format(month, "MMMM yyyy")}
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map((label, i) => (
          <div
            key={i}
            className="text-center text-xs font-medium text-muted-foreground py-1"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Day cells */}
      {loading ? (
        <div className="grid grid-cols-7">
          {Array.from({ length: startDayOfWeek }).map((_, i) => (
            <div key={`e-${i}`} className="aspect-square" />
          ))}
          {Array.from({ length: daysInMonth.length }).map((_, i) => (
            <div
              key={`s-${i}`}
              className="aspect-square flex items-center justify-center m-0.5"
            >
              <div className="w-6 h-6 rounded-md bg-muted animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7">
          {Array.from({ length: startDayOfWeek }).map((_, i) => (
            <div key={`e-${i}`} className="aspect-square" />
          ))}

          {daysInMonth.map((day) => {
            const isPast = isBefore(day, today);
            const booked = isDateBooked(day, bookedRanges);
            const disabled = isPast || booked;

            const isCheckIn = checkIn && isSameDay(day, checkIn);
            const isCheckOut = checkOut && isSameDay(day, checkOut);
            const isInRange =
              checkIn &&
              checkOut &&
              isAfter(day, checkIn) &&
              isBefore(day, checkOut);

            return (
              <button
                key={day.toISOString()}
                type="button"
                disabled={disabled}
                onClick={() => !disabled && onDayClick(day)}
                className={cn(
                  "aspect-square flex items-center justify-center text-sm transition-colors relative",
                  // Default available state
                  !disabled &&
                    !isCheckIn &&
                    !isCheckOut &&
                    !isInRange &&
                    "hover:bg-accent-warm/10 text-foreground",
                  // Past dates
                  isPast && "text-muted-foreground/40 cursor-not-allowed",
                  // Booked dates
                  booked &&
                    !isPast &&
                    "bg-muted text-muted-foreground cursor-not-allowed line-through",
                  // Check-in date
                  isCheckIn &&
                    "bg-accent-warm text-white font-semibold rounded-l-full",
                  // Check-out date
                  isCheckOut &&
                    "bg-accent-warm text-white font-semibold rounded-r-full",
                  // Dates in range
                  isInRange && "bg-accent-warm/20"
                )}
              >
                {format(day, "d")}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
