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
    description: "Relax and unwind in this serene mountain-view B&B suite, nestled into a forested hillside with stunning views of Tumwater Mountain, Icicle Ridge, and Wedge Mountain. This cozy space features a kitchenette with basics to cook simple meals, and a private deck to take in the scenery. Simple in-suite breakfast is provided. Just a 20-minute walk to downtown Leavenworth.",
    amenities: [
      "Queen Bed",
      "Private Bathroom with Bathtub",
      "Kitchenette",
      "Private Deck with Mountain Views",
      "Wi-Fi",
      "Air Conditioning",
      "Breakfast Provided",
      "Nespresso Coffee",
      "Free Parking",
      "EV Charger",
      "Hair Dryer",
      "Refrigerator",
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
    name: "The One Bedroom",
    tagline: "Spacious suite with room for the whole family",
    description: "A thoughtfully designed B&B suite featuring a spacious living area with large windows, a cozy bedroom with work station, and full bathroom. A comfy air mattress and pack-n-play are available for extra guests. Simple in-suite breakfast foods are provided, along with a Nespresso coffee station, fridge, toaster, and microwave. Samsung Frame smart TV with streaming apps. Private entrance and deck with views over orchards down the Wenatchee valley.",
    amenities: [
      "Queen Bed",
      "Air Mattress Available",
      "Pack-n-Play Available",
      "Full Bathroom",
      "Samsung Frame Smart TV",
      "Nespresso Coffee Station",
      "Microwave, Toaster & Fridge",
      "Dedicated Workspace",
      "Wi-Fi",
      "Air Conditioning",
      "Breakfast Provided",
      "Free Parking",
      "EV Charger",
      "Private Entrance & Deck",
      "Mountain Views",
    ],
    maxGuests: {
      adults: { min: 1, max: 4 },
      children: { min: 0, max: 3 },
      infants: { min: 0, max: 1 },
    },
    icalEnvKey: "ONEBR_ICAL_URL",
  },
];
