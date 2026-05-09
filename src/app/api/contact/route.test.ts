import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { resendSendMock } = vi.hoisted(() => ({
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

import { POST } from "./route";

describe("POST /api/contact", () => {
  const makeRequest = (body: unknown) =>
    new NextRequest("http://localhost/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });

  beforeEach(() => {
    resendSendMock.mockReset();
  });

  afterEach(() => {
    delete process.env.HOST_EMAIL;
  });

  it("returns 400 when required fields are missing", async () => {
    const response = await POST(
      makeRequest({
        name: "Alex",
        email: "alex@example.com",
        message: "",
      })
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "Missing required fields" });
    expect(resendSendMock).not.toHaveBeenCalled();
  });

  it("sends inquiry email and returns success", async () => {
    process.env.HOST_EMAIL = "host@example.com";
    resendSendMock.mockResolvedValue({ id: "email-123" });

    const response = await POST(
      makeRequest({
        name: "Alex",
        email: "alex@example.com",
        message: "Interested in booking.",
        dates: "June 1 to June 3",
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true });
    expect(resendSendMock).toHaveBeenCalledTimes(1);
    expect(resendSendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "host@example.com",
        replyTo: "alex@example.com",
        subject: "New inquiry from Alex",
      })
    );
  });

  it("returns 500 when email send fails", async () => {
    resendSendMock.mockRejectedValue(new Error("resend down"));

    const response = await POST(
      makeRequest({
        name: "Alex",
        email: "alex@example.com",
        message: "Interested in booking.",
      })
    );
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: "Failed to send message" });
  });
});
