"use client";

import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

export type NightlyRate = {
  date: string;
  rate: number;
};

type Props = {
  rates: NightlyRate[] | null;
  isLoading: boolean;
  error: string | null;
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function PricingBreakdown({ rates, isLoading, error }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-4 w-24 rounded bg-muted animate-pulse" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex justify-between">
            <div className="h-4 w-20 rounded bg-muted animate-pulse" />
            <div className="h-4 w-14 rounded bg-muted animate-pulse" />
          </div>
        ))}
        <div className="border-t border-border pt-3 mt-3">
          <div className="flex justify-between">
            <div className="h-5 w-16 rounded bg-muted animate-pulse" />
            <div className="h-5 w-20 rounded bg-muted animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-border bg-surface p-4 text-center">
        <p className="text-sm text-muted-foreground">
          Contact us for pricing
        </p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          We&apos;ll get back to you with an accurate quote.
        </p>
      </div>
    );
  }

  if (!rates || rates.length === 0) {
    return null;
  }

  const total = rates.reduce((sum, r) => sum + r.rate, 0);

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-foreground">
        {rates.length} {rates.length === 1 ? "night" : "nights"}
      </h4>

      <div className="space-y-1.5">
        {rates.map((r) => (
          <div
            key={r.date}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-muted-foreground">
              {format(parseISO(r.date), "EEE, MMM d")}
            </span>
            <span className="tabular-nums text-foreground">
              {formatCurrency(r.rate)}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-border pt-3 mt-3">
        <div className="flex items-center justify-between">
          <span className="text-base font-bold text-foreground">Total</span>
          <span className="text-lg font-bold tabular-nums text-foreground">
            {formatCurrency(total)}
          </span>
        </div>
      </div>
    </div>
  );
}
