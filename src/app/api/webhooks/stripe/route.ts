import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

import { stripe } from "@/lib/stripe";

import type Stripe from "stripe";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.payment_status === "paid") {
      const { unitName, checkIn, checkOut, guestName, guestEmail, guests } = session.metadata ?? {};
      const totalPaid = session.amount_total;

      try {
        await resend.emails.send({
          from: "Tumwater Stays <hello@tumwaterstays.com>",
          to: guestEmail!,
          subject: "Your Booking is Confirmed — Tumwater Stays",
          html: `
            <h1>Booking Confirmed!</h1>
            <p>Hi ${guestName},</p>
            <p>Your stay at <strong>${unitName}</strong> is confirmed.</p>
            <ul>
              <li><strong>Check-in:</strong> ${checkIn}</li>
              <li><strong>Check-out:</strong> ${checkOut}</li>
              <li><strong>Total Paid:</strong> $${((totalPaid ?? 0) / 100).toFixed(2)}</li>
            </ul>
            <p>We'll send you check-in details closer to your arrival date.</p>
            <p>Thank you for booking direct!</p>
            <p>— Tumwater Stays, Leavenworth WA</p>
          `,
        });

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
              <li><strong>Total Paid:</strong> $${((totalPaid ?? 0) / 100).toFixed(2)}</li>
            </ul>
            <p><strong>ACTION REQUIRED:</strong> Block these dates on Airbnb.</p>
          `,
        });
      } catch (err) {
        console.error("Resend error:", err);
        return NextResponse.json(
          { error: "Confirmation email failed", detail: String(err) },
          { status: 500 }
        );
      }
    }
  }

  return NextResponse.json({ received: true });
}
