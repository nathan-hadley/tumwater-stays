"use client";

import useSWR from "swr";

export type BookedRange = {
  start: Date;
  end: Date;
};

const fetcher = (url: string) =>
  fetch(url)
    .then((res) => res.json())
    .then((data): BookedRange[] =>
      data.bookedRanges.map((r: { start: string; end: string }) => ({
        start: new Date(r.start),
        end: new Date(r.end),
      }))
    );

export function useAvailability(unitId: string) {
  const { data, isLoading } = useSWR(
    `/api/availability?unit=${unitId}`,
    fetcher,
    { refreshInterval: 5 * 60 * 1000 } // refresh every 5 minutes
  );

  return { bookedRanges: data ?? [], loading: isLoading };
}
