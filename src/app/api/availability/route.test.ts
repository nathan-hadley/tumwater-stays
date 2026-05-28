import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { parseIcal } from "@/lib/ical-parser";

import { GET } from "./route";

vi.mock("@/lib/ical-parser", () => ({
  parseIcal: vi.fn(),
}));

describe("GET /api/availability", () => {
  const parseIcalMock = vi.mocked(parseIcal);
  const makeRequest = (url: string) => new NextRequest(url);

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.STUDIO_ICAL_URL;
    delete process.env.ONEBR_ICAL_URL;
  });

  it("returns empty availability when calendar URL is not configured", async () => {
    process.env.STUDIO_ICAL_URL = "placeholder";
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(makeRequest("http://localhost/api/availability?unit=studio"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ bookedRanges: [] });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("uses onebr calendar for unknown units", async () => {
    process.env.ONEBR_ICAL_URL = "https://example.com/onebr.ics";
    const fetchMock = vi.fn().mockResolvedValue(new Response("BEGIN:VCALENDAR"));
    vi.stubGlobal("fetch", fetchMock);
    parseIcalMock.mockReturnValue([]);

    const response = await GET(makeRequest("http://localhost/api/availability?unit=unknown"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ bookedRanges: [] });
    expect(fetchMock).toHaveBeenCalledWith("https://example.com/onebr.ics", {
      next: { revalidate: 3600 },
    });
  });

  it("returns parsed booked ranges as YYYY-MM-DD date-only strings", async () => {
    process.env.STUDIO_ICAL_URL = "https://example.com/studio.ics";
    const fetchMock = vi.fn().mockResolvedValue(new Response("BEGIN:VCALENDAR"));
    vi.stubGlobal("fetch", fetchMock);
    parseIcalMock.mockReturnValue([
      {
        start: new Date(2026, 5, 1),
        end: new Date(2026, 5, 3),
      },
    ]);

    const response = await GET(makeRequest("http://localhost/api/availability?unit=studio"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      bookedRanges: [{ start: "2026-06-01", end: "2026-06-03" }],
    });
    expect(parseIcalMock).toHaveBeenCalledWith("BEGIN:VCALENDAR");
  });

  it("never serializes a time-of-day component (calendar-date semantics)", async () => {
    process.env.STUDIO_ICAL_URL = "https://example.com/studio.ics";
    const fetchMock = vi.fn().mockResolvedValue(new Response("BEGIN:VCALENDAR"));
    vi.stubGlobal("fetch", fetchMock);
    // Simulate a parser result where the underlying Date happens to carry
    // a non-zero time (e.g. due to an upstream change) — the wire format
    // must still be a pure YYYY-MM-DD string so checkout-day comparisons
    // stay timezone-stable on the client.
    parseIcalMock.mockReturnValue([
      {
        start: new Date(2026, 5, 1, 16, 0, 0),
        end: new Date(2026, 5, 5, 10, 0, 0),
      },
    ]);

    const response = await GET(makeRequest("http://localhost/api/availability?unit=studio"));
    const data = (await response.json()) as { bookedRanges: { start: string; end: string }[] };

    expect(data.bookedRanges).toEqual([{ start: "2026-06-01", end: "2026-06-05" }]);
    for (const r of data.bookedRanges) {
      expect(r.start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(r.end).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("falls back to empty availability when upstream fetch fails", async () => {
    process.env.STUDIO_ICAL_URL = "https://example.com/studio.ics";
    const fetchMock = vi.fn().mockRejectedValue(new Error("boom"));
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(makeRequest("http://localhost/api/availability?unit=studio"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ bookedRanges: [] });
  });
});
