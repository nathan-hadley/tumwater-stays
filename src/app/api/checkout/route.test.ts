import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { fetchNightlyRates } from "@/lib/pricelabs";

const { createCheckoutSessionMock } = vi.hoisted(() => ({
  createCheckoutSessionMock: vi.fn(),
}));

vi.mock("@/lib/pricelabs", () => ({
  fetchNightlyRates: vi.fn(),
}));

vi.mock("@/lib/stripe", () => ({
  stripe: {
    checkout: {
      sessions: {
        create: createCheckoutSessionMock,
      },
    },
  },
}));

import { POST } from "./route";

describe("POST /api/checkout", () => {
  const fetchNightlyRatesMock = vi.mocked(fetchNightlyRates);

  const makeRequest = (body: unknown) =>
    new NextRequest("http://localhost/api/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });

  const validBody = {
    unit: "studio",
    checkIn: "2026-06-01",
    checkOut: "2026-06-03",
    guests: { adults: 2, children: 0, infants: 0 },
    guestName: "Alex Guest",
    guestEmail: "alex@example.com",
  };

  beforeEach(() => {
    fetchNightlyRatesMock.mockReset();
    createCheckoutSessionMock.mockReset();
  });

  it("returns 502 when server-side pricing verification fails", async () => {
    fetchNightlyRatesMock.mockRejectedValue(new Error("pricing unavailable"));

    const response = await POST(makeRequest(validBody));
    const data = await response.json();

    expect(response.status).toBe(502);
    expect(data).toEqual({ error: "Unable to verify pricing. Please try again." });
    expect(createCheckoutSessionMock).not.toHaveBeenCalled();
  });

  it("returns 400 when required fields are missing", async () => {
    fetchNightlyRatesMock.mockResolvedValue([{ date: "2026-06-01", rate: 200 }]);

    const response = await POST(
      makeRequest({
        ...validBody,
        guestEmail: "",
      })
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "Missing required fields" });
    expect(createCheckoutSessionMock).not.toHaveBeenCalled();
  });

  it("creates a Stripe checkout session and returns the hosted URL", async () => {
    fetchNightlyRatesMock.mockResolvedValue([
      { date: "2026-06-01", rate: 125 },
      { date: "2026-06-02", rate: 150 },
    ]);
    createCheckoutSessionMock.mockResolvedValue({
      url: "https://checkout.stripe.com/test-session",
    });

    const response = await POST(makeRequest(validBody));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ url: "https://checkout.stripe.com/test-session" });
    expect(createCheckoutSessionMock).toHaveBeenCalledTimes(1);
    expect(createCheckoutSessionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        customer_email: "alex@example.com",
        mode: "payment",
        success_url: "http://localhost/booking/success?session_id={CHECKOUT_SESSION_ID}",
        cancel_url: "http://localhost/#booking",
        metadata: expect.objectContaining({
          unitName: "The Studio",
          checkIn: "2026-06-01",
          checkOut: "2026-06-03",
          guestName: "Alex Guest",
          guestEmail: "alex@example.com",
          guests: JSON.stringify({ adults: 2, children: 0, infants: 0 }),
        }),
      })
    );
    expect(createCheckoutSessionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        line_items: [
          expect.objectContaining({
            price_data: expect.objectContaining({
              unit_amount: 27500,
            }),
          }),
        ],
      })
    );
  });
});
