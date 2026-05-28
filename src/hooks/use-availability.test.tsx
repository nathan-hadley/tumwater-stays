import { renderHook, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useAvailability } from "./use-availability";

import type { ReactNode } from "react";

function createWrapper() {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <SWRConfig
        value={{
          provider: () => new Map(),
          dedupingInterval: 0,
          errorRetryCount: 0,
          shouldRetryOnError: false,
          revalidateOnFocus: false,
          revalidateOnReconnect: false,
        }}
      >
        {children}
      </SWRConfig>
    );
  };
}

describe("useAvailability", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does not fetch when unit id is missing (null SWR key)", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const { result } = renderHook(() => useAvailability(""), { wrapper: createWrapper() });

    expect(result.current.bookedRanges).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns loading state before fetch resolves", async () => {
    let resolveFetch: ((value: Response) => void) | undefined;
    const pendingFetch = new Promise<Response>((resolve) => {
      resolveFetch = resolve;
    });

    vi.spyOn(globalThis, "fetch").mockReturnValue(pendingFetch);

    const { result } = renderHook(() => useAvailability("studio"), { wrapper: createWrapper() });

    expect(result.current.loading).toBe(true);

    resolveFetch?.({
      ok: true,
      json: vi.fn().mockResolvedValue({ bookedRanges: [] }),
    } as unknown as Response);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it("maps YYYY-MM-DD booked ranges into local-midnight Date objects", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        bookedRanges: [
          { start: "2026-06-10", end: "2026-06-12" },
          { start: "2026-07-01", end: "2026-07-03" },
        ],
      }),
    } as unknown as Response);

    const { result } = renderHook(() => useAvailability("studio"), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeNull();
    // Local-midnight construction is required: `new Date("2026-06-10")`
    // would interpret the string as UTC, shifting the day backwards in
    // timezones west of UTC and re-introducing the checkout-day bug.
    expect(result.current.bookedRanges).toEqual([
      { start: new Date(2026, 5, 10), end: new Date(2026, 5, 12) },
      { start: new Date(2026, 6, 1), end: new Date(2026, 6, 3) },
    ]);
    expect(result.current.bookedRanges[0]?.start.getHours()).toBe(0);
    expect(result.current.bookedRanges[0]?.end.getHours()).toBe(0);
  });

  it("maps fetch failures to a stable hook error state", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network down"));

    const { result } = renderHook(() => useAvailability("studio"), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe("Unable to load availability");
    });

    expect(result.current.bookedRanges).toEqual([]);
  });
});
