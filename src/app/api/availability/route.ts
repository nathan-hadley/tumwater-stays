import { NextRequest, NextResponse } from "next/server";

import { parseIcal } from "@/lib/ical-parser";

// Date-only wire format — anything with a time component would be
// reinterpreted in the client's timezone.
function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

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
        start: toIsoDate(r.start),
        end: toIsoDate(r.end),
      })),
    });
  } catch {
    return NextResponse.json({ bookedRanges: [] });
  }
}
