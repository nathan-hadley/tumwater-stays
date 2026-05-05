import { NextRequest, NextResponse } from "next/server";

import { units } from "@/data/units";
import { fetchNightlyRates } from "@/lib/pricelabs";
import { stripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { unit, checkIn, checkOut, guests, guestName, guestEmail } = body;

  // Resolve unit name from unit ID
  const unitData = units.find((u) => u.id === unit);
  const unitName = unitData?.name ?? unit;

  // Calculate total from rates (server-side to prevent client tampering)
  const LISTING_ENV_KEYS: Record<string, string> = {
    studio: "STUDIO_PRICELABS_LISTING_ID",
    onebr: "ONEBR_PRICELABS_LISTING_ID",
  };
  const listingId = process.env[LISTING_ENV_KEYS[unit] ?? ""];
  const pms = process.env.PRICELABS_PMS;

  let totalCents: number;
  try {
    if (!listingId || !pms) throw new Error("Pricing not configured");
    const rates = await fetchNightlyRates(listingId, pms, checkIn, checkOut);
    totalCents = Math.round(rates.reduce((sum, r) => sum + r.rate, 0) * 100);
  } catch {
    return NextResponse.json(
      { error: "Unable to verify pricing. Please try again." },
      { status: 502 }
    );
  }

  if (!unitName || !checkIn || !checkOut || !totalCents || !guestName || !guestEmail) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: guestEmail,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${unitName} — ${checkIn} to ${checkOut}`,
              description: `Tumwater Stays, Leavenworth WA. Guest: ${guestName}. Guests: ${JSON.stringify(guests)}`,
            },
            unit_amount: totalCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${request.nextUrl.origin}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/#booking`,
      metadata: {
        unitName,
        checkIn,
        checkOut,
        guests: JSON.stringify(guests),
        guestName,
        guestEmail,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
