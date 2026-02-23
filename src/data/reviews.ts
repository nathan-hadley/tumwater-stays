export type Review = {
  guest: string;
  date: string;
  rating: number;
  source: "airbnb" | "direct";
  text: string;
  unit: "studio" | "onebr";
};

export const reviews: Review[] = [
  {
    guest: "Sarah M.",
    date: "2025-12",
    rating: 5,
    source: "airbnb",
    text: "Absolutely loved our stay! The studio was cozy and perfectly located for exploring Leavenworth.",
    unit: "studio",
  },
  {
    guest: "Jake R.",
    date: "2026-01",
    rating: 5,
    source: "airbnb",
    text: "Great spot for a family weekend. The one bedroom had everything we needed and the hosts were super responsive.",
    unit: "onebr",
  },
];
