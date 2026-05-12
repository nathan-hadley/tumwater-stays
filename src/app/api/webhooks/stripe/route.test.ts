import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { constructEventMock, resendSendMock } = vi.hoisted(() => ({
  constructEventMock: vi.fn(),
  resendSendMock: vi.fn(),
}));

vi.mock("resend", () => ({
  Resend: function MockResend() {
    return {
      emails: {
        send: resendSendMock,
      },
    };
  },
}));

vi.mock("@/lib/stripe", () => ({
  stripe: {
    webhooks: {
      constructEvent: constructEventMock,
    },
  },
}));

import { POST } from "./route";

describe("POST /api/webhooks/stripe", () => {
  const makeRequest = (body: string, signature?: string) =>
    new NextRequest("http://localhost/api/webhooks/stripe", {
      method: "POST",
      headers: signature ? { "stripe-signature": signature } : undefined,
      body,
    });

  const paidSessionEvent = {
    type: "checkout.session.completed",
    data: {
      object: {
        payment_status: "paid",
        amount_total: 34500,
        metadata: {
          unitName: "The Studio",
          checkIn: "2026-06-01",
          checkOut: "2026-06-03",
          guestName: "Alex Guest",
          guestEmail: "alex@example.com",
          guests: JSON.stringify({ adults: 2, children: 0, infants: 0 }),
        },
      },
    },
  };

  beforeEach(() => {
    constructEventMock.mockReset();
    resendSendMock.mockReset();
  });

  afterEach(() => {
    delete process.env.HOST_EMAIL;
  });

  it("returns 400 when stripe-signature header is missing", async () => {
    const response = await POST(makeRequest("{}"));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "Missing stripe-signature header" });
    expect(constructEventMock).not.toHaveBeenCalled();
  });

  it("returns 400 when signature verification fails", async () => {
    constructEventMock.mockImplementation(() => {
      throw new Error("invalid signature");
    });

    const response = await POST(makeRequest("{}", "sig_test"));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "Invalid signature" });
  });

  it("handles paid checkout completion and sends confirmation emails", async () => {
    process.env.HOST_EMAIL = "host@example.com";
    constructEventMock.mockReturnValue(paidSessionEvent);
    resendSendMock.mockResolvedValue({ id: "email-123" });

    const response = await POST(makeRequest('{"id":"evt_1"}', "sig_test"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ received: true });
    expect(constructEventMock).toHaveBeenCalledWith(
      '{"id":"evt_1"}',
      "sig_test",
      process.env.STRIPE_WEBHOOK_SECRET
    );
    expect(resendSendMock).toHaveBeenCalledTimes(2);
    expect(resendSendMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        to: "alex@example.com",
        subject: "Your Booking is Confirmed — Tumwater Stays",
      })
    );
    expect(resendSendMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        to: "host@example.com",
        subject: "New Direct Booking: The Studio — 2026-06-01 to 2026-06-03",
      })
    );
  });

  it("returns 500 when confirmation email send fails", async () => {
    constructEventMock.mockReturnValue(paidSessionEvent);
    resendSendMock.mockRejectedValue(new Error("resend down"));

    const response = await POST(makeRequest('{"id":"evt_1"}', "sig_test"));
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      error: "Confirmation email failed",
      detail: "Error: resend down",
    });
    expect(resendSendMock).toHaveBeenCalledTimes(1);
  });
});
