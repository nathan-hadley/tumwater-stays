"use client";

import useSWR from "swr";

export type BookedRange = {
  start: Date;
  end: Date;
};

// Parse YYYY-MM-DD as a local-midnight Date. Using `new Date(yyyy-mm-dd)`
// would interpret the string as UTC and shift the day backwards in any
// timezone west of UTC, re-introducing the checkout-day bug this format
// was chosen to avoid.
function parseLocalDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number) as [number, number, number];
  return new Date(y, m - 1, d);
}

const fetcher = (url: string) =>
  fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch availability");
      return res.json();
    })
    .then((data): BookedRange[] =>
      data.bookedRanges.map((r: { start: string; end: string }) => ({
        start: parseLocalDate(r.start),
        end: parseLocalDate(r.end),
      }))
    );

export function useAvailability(unitId: string | null) {
  const key = unitId ? `/api/availability?unit=${unitId}` : null;
  const { data, isLoading, error } = useSWR(key, fetcher, {
    refreshInterval: 5 * 60 * 1000, // refresh every 5 minutes
  });

  return {
    bookedRanges: data ?? [],
    loading: isLoading,
    error: error ? "Unable to load availability" : null,
  };
}
