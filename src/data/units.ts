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
    tagline: "A cozy retreat for two",
    description: "A charming attached studio with everything you need for a mountain getaway. Perfect for couples or solo travelers.",
    amenities: ["Queen Bed", "Full Bathroom", "Kitchenette", "Wi-Fi", "Heating", "Mountain Views"],
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
    tagline: "Room for the whole family",
    description: "A spacious one-bedroom downstairs unit with a full kitchenette. Great for families or small groups exploring Leavenworth.",
    amenities: ["Queen Bed", "Sleeper Sofa", "Full Bathroom", "Kitchenette", "Wi-Fi", "Heating", "Mountain Views"],
    maxGuests: {
      adults: { min: 1, max: 4 },
      children: { min: 0, max: 3 },
      infants: { min: 0, max: 1 },
    },
    icalEnvKey: "ONEBR_ICAL_URL",
  },
];
