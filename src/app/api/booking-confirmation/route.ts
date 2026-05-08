import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  const { unitName, checkIn, checkOut, guestName, guestEmail, totalPaid, guests } =
    await request.json();

  try {
    // Email to guest
    await resend.emails.send({
      from: "Tumwater Stays <hello@tumwaterstays.com>",
      to: guestEmail,
      subject: "Your Booking is Confirmed — Tumwater Stays",
      html: `
        <h1>Booking Confirmed!</h1>
        <p>Hi ${guestName},</p>
        <p>Your stay at <strong>${unitName}</strong> is confirmed.</p>
        <ul>
          <li><strong>Check-in:</strong> ${checkIn}</li>
          <li><strong>Check-out:</strong> ${checkOut}</li>
          <li><strong>Total Paid:</strong> $${(totalPaid / 100).toFixed(2)}</li>
        </ul>
        <p>We'll send you check-in details closer to your arrival date.</p>
        <p>Thank you for booking direct!</p>
        <p>— Tumwater Stays, Leavenworth WA</p>
      `,
    });

    // Email to host
    await resend.emails.send({
      from: "Tumwater Stays <hello@tumwaterstays.com>",
      to: process.env.HOST_EMAIL || "placeholder@example.com",
      subject: `New Direct Booking: ${unitName} — ${checkIn} to ${checkOut}`,
      html: `
        <h1>New Direct Booking!</h1>
        <ul>
          <li><strong>Unit:</strong> ${unitName}</li>
          <li><strong>Check-in:</strong> ${checkIn}</li>
          <li><strong>Check-out:</strong> ${checkOut}</li>
          <li><strong>Guest:</strong> ${guestName} (${guestEmail})</li>
          <li><strong>Guests:</strong> ${guests}</li>
          <li><strong>Total Paid:</strong> $${(totalPaid / 100).toFixed(2)}</li>
        </ul>
        <p><strong>ACTION REQUIRED:</strong> Block these dates on Airbnb.</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("booking-confirmation error:", err);
    return NextResponse.json(
      { error: "Failed to send confirmation", detail: String(err) },
      { status: 500 }
    );
  }
}
