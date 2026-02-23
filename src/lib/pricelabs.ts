export type NightlyRate = {
  date: string;
  rate: number; // in cents
};

export async function fetchNightlyRates(
  unitId: string,
  checkIn: string,
  checkOut: string
): Promise<NightlyRate[]> {
  const apiKey = process.env.PRICELABS_API_KEY;
  if (!apiKey || apiKey === "placeholder") {
    throw new Error("PriceLabs API key not configured");
  }

  // PriceLabs Customer API — exact endpoint TBD once API access is activated
  // This wraps the call so only this file needs updating
  const response = await fetch(
    `https://api.pricelabs.co/v1/pricing?listing_id=${unitId}&check_in=${checkIn}&check_out=${checkOut}`,
    {
      headers: { Authorization: `Bearer ${apiKey}` },
      next: { revalidate: 43200 },
    }
  );

  if (!response.ok) throw new Error("Failed to fetch pricing from PriceLabs");

  const data = await response.json();
  return data.rates;
}
