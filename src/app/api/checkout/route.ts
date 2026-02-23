import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { units } from "@/data/units";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { unit, checkIn, checkOut, guests, guestName, guestEmail } = body;

  // Resolve unit name from unit ID
  const unitData = units.find((u) => u.id === unit);
  const unitName = unitData?.name ?? unit;

  // Calculate total from rates (re-fetch server-side to prevent client tampering)
  let totalCents: number;
  try {
    const pricingUrl = new URL("/api/pricing", request.nextUrl.origin);
    pricingUrl.searchParams.set("unit", unit);
    pricingUrl.searchParams.set("checkIn", checkIn);
    pricingUrl.searchParams.set("checkOut", checkOut);

    const pricingRes = await fetch(pricingUrl.toString());
    if (!pricingRes.ok) throw new Error("Pricing unavailable");

    const pricingData = await pricingRes.json();
    totalCents = pricingData.total;
  } catch {
    // If pricing fetch fails, reject the checkout
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
