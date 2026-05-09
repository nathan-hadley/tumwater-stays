import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

import { fetchNightlyRates } from "@/lib/pricelabs";

import { GET } from "./route";

vi.mock("@/lib/pricelabs", () => ({
  fetchNightlyRates: vi.fn(),
}));

describe("GET /api/pricing", () => {
  const fetchNightlyRatesMock = vi.mocked(fetchNightlyRates);
  const makeRequest = (url: string) => new NextRequest(url);

  it("returns 400 when required query parameters are missing", async () => {
    const response = await GET(makeRequest("http://localhost/api/pricing?unit=studio"));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "Missing parameters" });
  });

  it("returns 400 for an unknown unit", async () => {
    const response = await GET(
      makeRequest(
        "http://localhost/api/pricing?unit=unknown&checkIn=2026-06-01&checkOut=2026-06-03"
      )
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "Unknown unit" });
  });

  it("returns nightly rates and total on success", async () => {
    fetchNightlyRatesMock.mockResolvedValue([
      { date: "2026-06-01", rate: 125 },
      { date: "2026-06-02", rate: 150 },
    ]);

    const response = await GET(
      makeRequest("http://localhost/api/pricing?unit=studio&checkIn=2026-06-01&checkOut=2026-06-03")
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      rates: [
        { date: "2026-06-01", rate: 125 },
        { date: "2026-06-02", rate: 150 },
      ],
      total: 275,
    });
    expect(fetchNightlyRatesMock).toHaveBeenCalledWith(
      "1342896722129623173",
      "airbnb",
      "2026-06-01",
      "2026-06-03"
    );
  });

  it("returns 502 when pricing upstream call fails", async () => {
    fetchNightlyRatesMock.mockRejectedValue(new Error("boom"));

    const response = await GET(
      makeRequest("http://localhost/api/pricing?unit=studio&checkIn=2026-06-01&checkOut=2026-06-03")
    );
    const data = await response.json();

    expect(response.status).toBe(502);
    expect(data).toEqual({
      error: "Unable to fetch pricing. Please contact us directly.",
    });
  });
});
