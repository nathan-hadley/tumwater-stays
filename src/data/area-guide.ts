export type GuideCategory = "dining" | "outdoors" | "activities" | "shopping";

export type GuideItem = {
  name: string;
  category: GuideCategory;
  description: string;
  icon: string;
};

export const areaGuide: GuideItem[] = [
  {
    name: "Munchen Haus",
    category: "dining",
    description: "Outdoor beer garden with gourmet sausages. A Leavenworth staple.",
    icon: "utensils",
  },
  {
    name: "Icicle Gorge Trail",
    category: "outdoors",
    description: "Easy loop trail along Icicle Creek. Beautiful in every season.",
    icon: "trees",
  },
  {
    name: "Leavenworth Reindeer Farm",
    category: "activities",
    description: "Meet and feed reindeer — a hit with kids and adults alike.",
    icon: "heart",
  },
  {
    name: "The Cheesemonger's Shop",
    category: "shopping",
    description: "Artisan cheeses, charcuterie, and local wines in the village.",
    icon: "shopping-bag",
  },
];
