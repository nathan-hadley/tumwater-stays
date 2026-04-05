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
    guest: "Kristin",
    date: "2025-10",
    rating: 5,
    source: "airbnb",
    text: "This apartment was beyond wonderful — spotless, beautifully maintained, and filled with the most gorgeous natural light. Waking up to the sunrise right from bed was magical. We couldn't have asked for a better home base for our Leavenworth getaway.",
    unit: "onebr",
  },
  {
    guest: "Gabriel",
    date: "2025-10",
    rating: 5,
    source: "airbnb",
    text: "10/10 experience, with an extremely intentional and thoughtful space, felt extremely cozy. Liz was extremely kind and even left my pregnant wife a present. Highly recommend!",
    unit: "studio",
  },
  {
    guest: "Caroline",
    date: "2025-07",
    rating: 5,
    source: "airbnb",
    text: "Everything about the space is thoughtfully designed. The bed was very comfy, the space was squeaky clean, and we loved the Nespresso coffee in the mornings! I would choose Liz's place over a hotel — so private, clean, and beautiful views. 10/10!",
    unit: "onebr",
  },
  {
    guest: "Ashley",
    date: "2025-11",
    rating: 5,
    source: "airbnb",
    text: "Beautiful location, minimalist hygge kinda vibe, with many details we really appreciated — dimming lights on all switches, natural bed linens, very comfortable mattress. The deck has an incredible view of the mountains.",
    unit: "studio",
  },
  {
    guest: "Sharie Lee",
    date: "2026-02",
    rating: 5,
    source: "airbnb",
    text: "We have visited Leavenworth perhaps 10 times already and this rental was a favorite. The unit was homey with nice high-end touches, the snacks were yummy, and the TV was super cool. The view from the house is really incredible. We would love to come back.",
    unit: "onebr",
  },
  {
    guest: "Paula",
    date: "2025-12",
    rating: 5,
    source: "airbnb",
    text: "As an Airbnb owner myself, I have high expectations and Liz and her home met all of them. Beautifully decorated, and the views from the deck were breathtaking.",
    unit: "studio",
  },
];
