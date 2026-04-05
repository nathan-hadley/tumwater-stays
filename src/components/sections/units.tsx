import { units } from "@/data/units";
import { getUnitPhotos } from "@/data/photos";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PhotoCarousel } from "@/components/photo-carousel";

export function Units() {
  return (
    <section id="units" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section heading */}
        <div className="text-center mb-12">
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-normal text-foreground"
            style={{
              fontFamily: "var(--font-heading), ui-serif, Georgia, serif",
            }}
          >
            Our Units
          </h2>
          <div className="mt-3 mx-auto h-1 w-16 rounded-full bg-accent-warm" />
          <p className="mt-4 text-muted-foreground text-lg">
            Choose the perfect space for your Leavenworth getaway
          </p>
        </div>

        {/* Unit cards grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {units.map((unit) => (
            <Card key={unit.id} className="overflow-hidden py-0">
              {/* Photo carousel — no horizontal padding */}
              <div className="px-0">
                <PhotoCarousel photos={getUnitPhotos(unit.id)} alt={unit.name} />
              </div>

              <CardHeader className="pb-0">
                <h3
                  className="text-2xl font-normal text-foreground"
                  style={{
                    fontFamily:
                      "var(--font-heading), ui-serif, Georgia, serif",
                  }}
                >
                  {unit.name}
                </h3>
                <p className="text-muted-foreground italic">{unit.tagline}</p>
              </CardHeader>

              <CardContent className="flex flex-col gap-4">
                <p className="text-foreground leading-relaxed">
                  {unit.description}
                </p>

                {/* Amenities */}
                <div className="flex flex-wrap gap-2">
                  {unit.amenities.map((amenity) => (
                    <Badge key={amenity} variant="secondary">
                      {amenity}
                    </Badge>
                  ))}
                </div>

                {/* Book CTA */}
                <Button
                  asChild
                  className="mt-2 bg-accent-warm text-white hover:bg-accent-warm-dark w-full sm:w-auto"
                  size="lg"
                >
                  <a href="#booking">Book This Unit</a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
