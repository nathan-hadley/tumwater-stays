import { NextRequest, NextResponse } from "next/server";

import { fetchNightlyRates } from "@/lib/pricelabs";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const unit = searchParams.get("unit");
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");

  if (!unit || !checkIn || !checkOut) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  try {
    const rates = await fetchNightlyRates(unit, checkIn, checkOut);
    const total = rates.reduce((sum, r) => sum + r.rate, 0);
    return NextResponse.json({ rates, total });
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch pricing. Please contact us directly." },
      { status: 502 }
    );
  }
}
