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
    text: "This apartment was beyond wonderful — spotless, beautifully maintained, and filled with the most gorgeous natural light. Waking up to the sunrise right from bed was magical. Everything was so clean and thoughtfully arranged, from the sparkling kitchenette to the fresh linens. We couldn't have asked for a better home base for our Leavenworth getaway.",
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
    guest: "Sharie Lee",
    date: "2026-02",
    rating: 5,
    source: "airbnb",
    text: "We have visited Leavenworth perhaps 10 times already and this rental was a favorite. The unit was homey and had some nice high end touches, the turkish waffle towels dry you off quickly, the snacks were yummy, and the TV was super cool. The view from the house is really incredible. We would love to come back.",
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
    guest: "Myleene",
    date: "2025-07",
    rating: 5,
    source: "airbnb",
    text: "Liz's suite was the perfect home base after a long day hiking through the Enchantments. Spacious, cozy, and impeccably clean, it offered everything we needed to rest and recharge. We really appreciated the thoughtful touches — snacks, fresh coffee, and filtered water.",
    unit: "onebr",
  },
  {
    guest: "Katherine",
    date: "2026-01",
    rating: 5,
    source: "airbnb",
    text: "We loved staying at Liz's for the weekend. The view of the mountains is incredible and the place itself was thoughtfully decorated and clean. It was a perfect retreat after a day of exploring Leavenworth!",
    unit: "studio",
  },
  {
    guest: "Caroline",
    date: "2025-07",
    rating: 5,
    source: "airbnb",
    text: "Everything about the space is thoughtfully designed. The bed was very comfy. The space was squeaky clean. We loved the Nespresso coffee in the mornings! I have stayed in a hotel in Leavenworth before, but I would choose Liz's place over a hotel because of how private, clean, and beautiful the views are. 10/10 would stay again!",
    unit: "onebr",
  },
  {
    guest: "Matt",
    date: "2026-03",
    rating: 5,
    source: "airbnb",
    text: "A great little studio for two. Clean, well-equipped, and easy to access. Only a quick drive to downtown, too. The mountain views from the porch are great!",
    unit: "studio",
  },
  {
    guest: "Clayton",
    date: "2026-03",
    rating: 5,
    source: "airbnb",
    text: "Fantastic place and location! From the moment I arrived to the time I left I felt very much at home. The home was surprisingly quiet — I hardly heard a peep from the owners upstairs. Super comfortable bed, I slept better there than I have in any other Airbnb.",
    unit: "onebr",
  },
  {
    guest: "Paula",
    date: "2025-12",
    rating: 5,
    source: "airbnb",
    text: "Liz was an outstanding host! As an Airbnb owner myself, I have high expectations and Liz and her home met all of them. The room was spacious enough for two, beautifully decorated, and the views from the deck were breathtaking.",
    unit: "studio",
  },
];
