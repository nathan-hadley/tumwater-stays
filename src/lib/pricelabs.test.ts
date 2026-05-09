import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchNightlyRates } from "./pricelabs";

describe("fetchNightlyRates", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.PRICELABS_API_KEY;
  });

  it("throws when the PriceLabs API key is missing", async () => {
    delete process.env.PRICELABS_API_KEY;

    await expect(
      fetchNightlyRates("listing-1", "hostaway", "2026-06-01", "2026-06-05")
    ).rejects.toThrow("PriceLabs API key not configured");
  });

  it("throws when the PriceLabs API key is a placeholder or build stub", async () => {
    process.env.PRICELABS_API_KEY = "placeholder";

    await expect(
      fetchNightlyRates("listing-1", "hostaway", "2026-06-01", "2026-06-05")
    ).rejects.toThrow("PriceLabs API key not configured");

    process.env.PRICELABS_API_KEY = "build_stub_pricelabs_api_key";

    await expect(
      fetchNightlyRates("listing-1", "hostaway", "2026-06-01", "2026-06-05")
    ).rejects.toThrow("PriceLabs API key not configured");
  });

  it("maps returned nightly rates and sends dateTo as the night before checkout", async () => {
    process.env.PRICELABS_API_KEY = "pl_test_key";

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue([
        {
          data: [
            { date: "2026-06-01", price: 125 },
            { date: "2026-06-02", price: 140 },
          ],
        },
      ]),
    } as unknown as Response);

    const rates = await fetchNightlyRates("listing-1", "hostaway", "2026-06-01", "2026-06-03");

    expect(rates).toEqual([
      { date: "2026-06-01", rate: 125 },
      { date: "2026-06-02", rate: 140 },
    ]);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, requestInit] = fetchSpy.mock.calls[0] ?? [];

    expect(url).toBe("https://api.pricelabs.co/v1/listing_prices");
    expect(requestInit).toMatchObject({
      method: "POST",
      headers: {
        "X-API-Key": "pl_test_key",
        "Content-Type": "application/json",
      },
      next: { revalidate: 43200 },
    });

    const payload = JSON.parse((requestInit as RequestInit).body as string);
    expect(payload).toEqual({
      listings: [
        {
          id: "listing-1",
          pms: "hostaway",
          dateFrom: "2026-06-01",
          dateTo: "2026-06-02",
        },
      ],
    });
  });

  it("throws when PriceLabs responds with a non-ok status", async () => {
    process.env.PRICELABS_API_KEY = "pl_test_key";

    vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: false } as Response);

    await expect(
      fetchNightlyRates("listing-1", "hostaway", "2026-06-01", "2026-06-05")
    ).rejects.toThrow("Failed to fetch pricing from PriceLabs");
  });

  it("throws when PriceLabs returns an unexpected payload shape", async () => {
    process.env.PRICELABS_API_KEY = "pl_test_key";

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ listing: [] }),
    } as unknown as Response);

    await expect(
      fetchNightlyRates("listing-1", "hostaway", "2026-06-01", "2026-06-05")
    ).rejects.toThrow("No pricing data returned");
  });
});
