export type Unit = {
  id: "studio" | "onebr";
  name: string;
  tagline: string;
  description: string;
  amenities: string[];
  maxGuests: {
    adults: { min: number; max: number };
    children: { min: number; max: number };
    infants: { min: number; max: number };
  };
  icalEnvKey: string;
};

export const units: Unit[] = [
  {
    id: "studio",
    name: "The Studio",
    tagline: "A cozy mountain-view retreat for two",
    description:
      "Relax and unwind in this serene mountain-view B&B suite, nestled into a forested hillside with stunning views of Tumwater Mountain, Icicle Ridge, and Wedge Mountain. This cozy space features a kitchenette with basics to cook simple meals, and a private deck to take in the scenery. Simple in-suite breakfast is provided. Just a 20-minute walk to downtown Leavenworth.",
    amenities: [
      "Queen Bed",
      "Kitchenette",
      "Private Deck",
      "Mountain Views",
      "Breakfast Provided",
      "Wi-Fi",
      "Free Parking",
      "EV Charger",
    ],
    maxGuests: {
      adults: { min: 1, max: 2 },
      children: { min: 0, max: 0 },
      infants: { min: 0, max: 1 },
    },
    icalEnvKey: "STUDIO_ICAL_URL",
  },
  {
    id: "onebr",
    name: "The Suite",
    tagline: "Spacious suite with room for the whole family",
    description:
      "A thoughtfully designed B&B suite featuring a spacious living area with large windows, a cozy bedroom with work station, and full bathroom. A comfy air mattress and pack-n-play are available for extra guests. Simple in-suite breakfast foods are provided, along with a Nespresso coffee station, fridge, toaster, and microwave. Samsung Frame smart TV with streaming apps. Private entrance and deck with views over orchards down the Wenatchee valley.",
    amenities: [
      "Queen Bed",
      "Air Mattress Available",
      "Smart TV",
      "Full Kitchenette",
      "Mountain Views",
      "Breakfast Provided",
      "Wi-Fi",
      "Free Parking",
      "EV Charger",
    ],
    maxGuests: {
      adults: { min: 1, max: 4 },
      children: { min: 0, max: 3 },
      infants: { min: 0, max: 1 },
    },
    icalEnvKey: "ONEBR_ICAL_URL",
  },
];
