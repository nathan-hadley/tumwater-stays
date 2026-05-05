export type NightlyRate = {
  date: string;
  rate: number; // in dollars
};

function lastNight(checkOut: string): string {
  const d = new Date(checkOut);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export async function fetchNightlyRates(
  listingId: string,
  pms: string,
  checkIn: string,
  checkOut: string
): Promise<NightlyRate[]> {
  const apiKey = process.env.PRICELABS_API_KEY;
  if (!apiKey || apiKey === "placeholder" || apiKey.startsWith("build_stub")) {
    throw new Error("PriceLabs API key not configured");
  }

  const response = await fetch("https://api.pricelabs.co/v1/listing_prices", {
    method: "POST",
    headers: {
      "X-API-Key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      // dateTo is inclusive in PriceLabs, so pass the last night (day before checkout)
      listings: [{ id: listingId, pms, dateFrom: checkIn, dateTo: lastNight(checkOut) }],
    }),
    next: { revalidate: 43200 },
  });

  if (!response.ok) throw new Error("Failed to fetch pricing from PriceLabs");

  const data = await response.json();
  const listing = Array.isArray(data) ? data[0] : null;
  if (!listing?.data) throw new Error("No pricing data returned");

  return (listing.data as { date: string; price: number }[]).map((d) => ({
    date: d.date,
    rate: d.price,
  }));
}
