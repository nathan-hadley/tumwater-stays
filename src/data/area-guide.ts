export type GuideCategory = "dining" | "outdoors" | "activities" | "shopping";

export type GuideItem = {
  name: string;
  category: GuideCategory;
  description: string;
  icon: string;
};

export const areaGuide: GuideItem[] = [
  {
    name: "Blewett Brewing Company",
    category: "dining",
    description: "Amazing wood-fired pizzas and a lovely service team!",
    icon: "utensils",
  },
  {
    name: "Yodelin Broth Company and Beer Garden",
    category: "dining",
    description: "Their sweet potato bahn-mi is delish! Opt to sit outside and enjoy the view of the river and beautiful cottonwood trees.",
    icon: "utensils",
  },
  {
    name: "Larch Handcrafted Pasta & Cocktails",
    category: "dining",
    description: "A wonderful place for a fancier meal and drink — if you're celebrating something, do it at Larch! And get the tiramisu.",
    icon: "utensils",
  },
  {
    name: "München Haus",
    category: "dining",
    description: "A fun biergarten with more mustard options than you knew you wanted. Plus bottomless sauerkraut — who doesn't love that?",
    icon: "utensils",
  },
  {
    name: "Argonaut Coffee and Biscuits",
    category: "dining",
    description: "Some of the tastiest breakfast sandwiches out there! Amazing coffee too. Prepare for long waits on weekends — but it's worth it.",
    icon: "utensils",
  },
  {
    name: "Whistlepunk Ice Cream Co.",
    category: "dining",
    description: "Best ice cream around! Get the waffle cone and thank us later.",
    icon: "utensils",
  },
  {
    name: "Bavarian Bagel Co.",
    category: "dining",
    description: "Fresh bagels and coffee — a great grab-and-go breakfast spot.",
    icon: "utensils",
  },
  {
    name: "Lupine Market & Café",
    category: "dining",
    description: "Café and market on Icicle Road from the Argonaut folks. Great coffee and baked goods. Open Tues–Sat, 8am–4pm.",
    icon: "utensils",
  },
  {
    name: "Icicle Gorge Trail",
    category: "outdoors",
    description: "Easy loop trail along Icicle Creek. Beautiful in every season.",
    icon: "trees",
  },
  {
    name: "Colchuck Lake / The Enchantments",
    category: "outdoors",
    description: "World-class alpine hiking with pristine glacial lakes. Permits required in peak season.",
    icon: "mountain",
  },
  {
    name: "Tumwater Canyon",
    category: "outdoors",
    description: "Scenic drive and riverside trails just minutes from the property. Great for fall foliage.",
    icon: "trees",
  },
  {
    name: "Icicle Creek Bouldering",
    category: "outdoors",
    description: "World-class bouldering and sport climbing just outside town. Ask us for beta!",
    icon: "mountain",
  },
  {
    name: "Leavenworth Reindeer Farm",
    category: "activities",
    description: "Meet and feed reindeer — a hit with kids and adults alike.",
    icon: "heart",
  },
  {
    name: "Leavenworth Summer Theater",
    category: "activities",
    description: "Outdoor performances at the Ski Hill amphitheater with mountain backdrop.",
    icon: "heart",
  },
  {
    name: "Front Street Village",
    category: "shopping",
    description: "Stroll the charming Bavarian village with shops, galleries, and seasonal festivals. A 20-minute walk from our place.",
    icon: "shopping-bag",
  },
  {
    name: "The Cheesemonger's Shop",
    category: "shopping",
    description: "Artisan cheeses, charcuterie, and local wines in the village.",
    icon: "shopping-bag",
  },
  {
    name: "Kris Kringl",
    category: "shopping",
    description: "Year-round Christmas shop with ornaments, nutcrackers, and Bavarian gifts.",
    icon: "shopping-bag",
  },
];
