import { Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { reviews } from "@/data/reviews";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted"
          }`}
        />
      ))}
    </div>
  );
}

function formatDate(dateStr: string) {
  const [year, month] = dateStr.split("-");
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function Reviews() {
  return (
    <section id="reviews" className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-normal"
            style={{
              fontFamily: "var(--font-heading), ui-serif, Georgia, serif",
            }}
          >
            What Our Guests Say
          </h2>
        </div>

        {/* Reviews grid */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          {reviews.map((review) => (
            <Card key={`${review.guest}-${review.date}`} className="border shadow-sm">
              <CardContent className="flex flex-col gap-4">
                <StarRating rating={review.rating} />
                <p className="text-sm leading-relaxed italic text-foreground">
                  &ldquo;{review.text}&rdquo;
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <div>
                    <p className="text-sm font-semibold">{review.guest}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(review.date)}</p>
                  </div>
                  <Badge variant={review.source === "airbnb" ? "secondary" : "outline"}>
                    {review.source === "airbnb" ? "Airbnb" : "Direct Guest"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
