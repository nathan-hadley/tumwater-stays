import { renderHook, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import { afterEach, describe, expect, it, vi } from "vitest";

import { usePricing } from "./use-pricing";

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

describe("usePricing", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("uses a null key and does not fetch when date inputs are incomplete", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const { result } = renderHook(() => usePricing("studio", new Date("2026-06-01"), null), {
      wrapper: createWrapper(),
    });

    expect(result.current.rates).toBeNull();
    expect(result.current.total).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns loading state before pricing fetch resolves", async () => {
    let resolveFetch: ((value: Response) => void) | undefined;
    const pendingFetch = new Promise<Response>((resolve) => {
      resolveFetch = resolve;
    });

    vi.spyOn(globalThis, "fetch").mockReturnValue(pendingFetch);

    const { result } = renderHook(
      () => usePricing("studio", new Date("2026-06-01"), new Date("2026-06-03")),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(true);

    resolveFetch?.({
      ok: true,
      json: vi.fn().mockResolvedValue({ rates: [], total: 0 }),
    } as unknown as Response);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("maps successful pricing response data", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        rates: [
          { date: "2026-06-01", rate: 180 },
          { date: "2026-06-02", rate: 220 },
        ],
        total: 400,
      }),
    } as unknown as Response);

    const { result } = renderHook(
      () => usePricing("studio", new Date("2026-06-01"), new Date("2026-06-03")),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.rates).toEqual([
      { date: "2026-06-01", rate: 180 },
      { date: "2026-06-02", rate: 220 },
    ]);
    expect(result.current.total).toBe(400);
  });

  it("maps fetch errors to a user-facing hook error state", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("pricing unavailable"));

    const { result } = renderHook(
      () => usePricing("studio", new Date("2026-06-01"), new Date("2026-06-03")),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe("Unable to load pricing");
    });

    expect(result.current.rates).toBeNull();
    expect(result.current.total).toBeNull();
  });
});
