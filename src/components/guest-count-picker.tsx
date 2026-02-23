"use client";

import { Minus, Plus } from "lucide-react";
import { units } from "@/data/units";
import { cn } from "@/lib/utils";

export type GuestCounts = {
  adults: number;
  children: number;
  infants: number;
};

type Props = {
  unitId: "studio" | "onebr";
  value: GuestCounts;
  onChange: (counts: GuestCounts) => void;
};

type RowConfig = {
  key: keyof GuestCounts;
  label: string;
  description: string;
  min: number;
  max: number;
  hidden?: boolean;
  disabledNote?: string;
};

export function GuestCountPicker({ unitId, value, onChange }: Props) {
  const unit = units.find((u) => u.id === unitId)!;
  const { adults: adultsLimit, children: childrenLimit, infants: infantsLimit } = unit.maxGuests;

  // For 1BR, adults + children <= 4
  const maxChildrenForUnit =
    unitId === "onebr"
      ? Math.min(childrenLimit.max, 4 - value.adults)
      : childrenLimit.max;

  const rows: RowConfig[] = [
    {
      key: "adults",
      label: "Adults",
      description: "Ages 13+",
      min: adultsLimit.min,
      max: adultsLimit.max,
    },
    {
      key: "children",
      label: "Children",
      description: "Ages 2\u201312",
      min: childrenLimit.min,
      max: maxChildrenForUnit,
      hidden: unitId === "studio",
      disabledNote:
        unitId === "studio" ? "Not available for this unit" : undefined,
    },
    {
      key: "infants",
      label: "Infants",
      description: "Under 2",
      min: infantsLimit.min,
      max: infantsLimit.max,
    },
  ];

  function handleChange(key: keyof GuestCounts, delta: number) {
    const next = { ...value, [key]: value[key] + delta };

    // If adults changed in 1BR, clamp children
    if (key === "adults" && unitId === "onebr") {
      const maxChildren = Math.min(childrenLimit.max, 4 - next.adults);
      if (next.children > maxChildren) {
        next.children = maxChildren;
      }
    }

    onChange(next);
  }

  return (
    <div className="space-y-3">
      {rows
        .filter((row) => !row.hidden)
        .map((row) => {
          const current = value[row.key];
          const atMin = current <= row.min;
          const atMax = current >= row.max;

          return (
            <div
              key={row.key}
              className="flex items-center justify-between py-2"
            >
              <div>
                <div className="text-sm font-medium text-foreground">
                  {row.label}
                </div>
                <div className="text-xs text-muted-foreground">
                  {row.description}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleChange(row.key, -1)}
                  disabled={atMin}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border border-border transition-colors",
                    atMin
                      ? "cursor-not-allowed opacity-30"
                      : "hover:border-foreground hover:text-foreground text-muted-foreground"
                  )}
                  aria-label={`Decrease ${row.label}`}
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>

                <span className="w-6 text-center text-sm font-medium tabular-nums">
                  {current}
                </span>

                <button
                  type="button"
                  onClick={() => handleChange(row.key, 1)}
                  disabled={atMax}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border border-border transition-colors",
                    atMax
                      ? "cursor-not-allowed opacity-30"
                      : "hover:border-foreground hover:text-foreground text-muted-foreground"
                  )}
                  aria-label={`Increase ${row.label}`}
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
    </div>
  );
}
