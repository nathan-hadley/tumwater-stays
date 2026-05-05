import { NextRequest, NextResponse } from "next/server";

import { fetchNightlyRates } from "@/lib/pricelabs";

const LISTING_ENV_KEYS: Record<string, string> = {
  studio: "STUDIO_PRICELABS_LISTING_ID",
  onebr: "ONEBR_PRICELABS_LISTING_ID",
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const unit = searchParams.get("unit");
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");

  if (!unit || !checkIn || !checkOut) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const listingIdEnvKey = LISTING_ENV_KEYS[unit];
  const listingId = listingIdEnvKey ? process.env[listingIdEnvKey] : undefined;
  const pms = process.env.PRICELABS_PMS;

  if (!listingId || !pms) {
    return NextResponse.json(
      { error: "Unable to fetch pricing. Please contact us directly." },
      { status: 502 }
    );
  }

  try {
    const rates = await fetchNightlyRates(listingId, pms, checkIn, checkOut);
    const total = rates.reduce((sum, r) => sum + r.rate, 0);
    return NextResponse.json({ rates, total });
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch pricing. Please contact us directly." },
      { status: 502 }
    );
  }
}
