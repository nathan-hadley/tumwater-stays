import { NextRequest, NextResponse } from "next/server";

import { stripe } from "@/lib/stripe";

import type Stripe from "stripe";

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

      const origin =
        process.env.NEXT_PUBLIC_SITE_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

      try {
        const res = await fetch(`${origin}/api/booking-confirmation`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            unitName,
            checkIn,
            checkOut,
            guestName,
            guestEmail,
            totalPaid: session.amount_total,
            guests,
          }),
        });

        if (!res.ok) {
          console.error("booking-confirmation failed:", await res.text());
          return NextResponse.json({ error: "Confirmation email failed" }, { status: 500 });
        }
      } catch (err) {
        console.error("booking-confirmation fetch error:", err);
        return NextResponse.json({ error: "Confirmation email failed" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
