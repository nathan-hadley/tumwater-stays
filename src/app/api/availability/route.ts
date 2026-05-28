import { NextRequest, NextResponse } from "next/server";

import { parseIcal } from "@/lib/ical-parser";

export async function GET(request: NextRequest) {
  const unit = request.nextUrl.searchParams.get("unit");

  const icalUrl = unit === "studio" ? process.env.STUDIO_ICAL_URL : process.env.ONEBR_ICAL_URL;

  if (!icalUrl || icalUrl === "placeholder") {
    // Return empty availability when not configured
    return NextResponse.json({ bookedRanges: [] });
  }

  try {
    const response = await fetch(icalUrl, { next: { revalidate: 3600 } });
    const icalText = await response.text();
    const bookedRanges = parseIcal(icalText);
    return NextResponse.json({
      bookedRanges: bookedRanges.map((r) => ({
        start: r.start.toISOString(),
        end: r.end.toISOString(),
      })),
    });
  } catch {
    return NextResponse.json({ bookedRanges: [] });
  }
}
