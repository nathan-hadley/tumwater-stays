"use client";

import { format } from "date-fns";
import useSWR from "swr";

import type { NightlyRate } from "@/components/pricing-breakdown";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch pricing");
    return res.json();
  });

export function usePricing(unitId: string, checkIn: Date | null, checkOut: Date | null) {
  const key =
    checkIn && checkOut
      ? `/api/pricing?${new URLSearchParams({
          unit: unitId,
          checkIn: format(checkIn, "yyyy-MM-dd"),
          checkOut: format(checkOut, "yyyy-MM-dd"),
        })}`
      : null;

  const { data, isLoading, error } = useSWR<{ rates: NightlyRate[]; total: number }>(key, fetcher);

  return {
    rates: data?.rates ?? null,
    total: data?.total ?? null,
    isLoading,
    error: error ? "Unable to load pricing" : null,
  };
}
