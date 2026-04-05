"use client";

import { useState } from "react";
import {
  Utensils,
  Trees,
  Heart,
  ShoppingBag,
  Mountain,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { areaGuide, type GuideCategory } from "@/data/area-guide";

const iconMap: Record<string, LucideIcon> = {
  utensils: Utensils,
  trees: Trees,
  heart: Heart,
  mountain: Mountain,
  "shopping-bag": ShoppingBag,
};

const categories: { label: string; value: GuideCategory | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Dining", value: "dining" },
  { label: "Outdoors", value: "outdoors" },
  { label: "Activities", value: "activities" },
  { label: "Shopping", value: "shopping" },
];

export function AreaGuide() {
  const [activeCategory, setActiveCategory] = useState<
    GuideCategory | "all"
  >("all");

  const filtered =
    activeCategory === "all"
      ? areaGuide
      : areaGuide.filter((item) => item.category === activeCategory);

  return (
    <section id="area-guide" className="py-20 px-4 bg-surface-dark">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-normal"
            style={{
              fontFamily: "var(--font-heading), ui-serif, Georgia, serif",
            }}
          >
            Explore Leavenworth
          </h2>
          <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
            Discover the best restaurants, trails, activities, and shops — all
            within minutes of your stay.
          </p>
        </div>

        {/* Category filter pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeCategory === cat.value
                  ? "bg-accent-warm text-white"
                  : "bg-surface-dark text-muted-foreground hover:bg-surface-dark/80 border border-border"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Card grid */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {filtered.map((item) => {
            const Icon = iconMap[item.icon];
            return (
              <Card key={item.name} className="border-0 shadow-none bg-surface">
                <CardContent className="flex flex-col gap-3">
                  {Icon && (
                    <Icon className="h-6 w-6 text-accent-warm" />
                  )}
                  <h3 className="font-bold">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
