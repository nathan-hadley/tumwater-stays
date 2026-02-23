"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhotoCarouselProps {
  photos: string[];
  alt: string;
}

export function PhotoCarousel({ photos, alt }: PhotoCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index);
    },
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Extract filename from path for placeholder text
  const getFilename = (path: string) => {
    return path.split("/").pop() || path;
  };

  return (
    <div className="relative rounded-lg overflow-hidden">
      {/* Embla viewport */}
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {photos.map((photo, index) => (
            <div key={photo} className="flex-[0_0_100%] min-w-0">
              <div className="aspect-[4/3] relative bg-gradient-to-br from-primary/20 via-primary/10 to-accent-warm/20 flex items-center justify-center">
                <div className="text-center px-4">
                  <div className="text-sm text-muted-foreground font-medium">
                    {alt}
                  </div>
                  <div className="text-xs text-muted-foreground/70 mt-1">
                    {getFilename(photo)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Previous button */}
      <button
        onClick={scrollPrev}
        disabled={!canScrollPrev}
        aria-label="Previous photo"
        className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60 disabled:opacity-30"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* Next button */}
      <button
        onClick={scrollNext}
        disabled={!canScrollNext}
        aria-label="Next photo"
        className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60 disabled:opacity-30"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {photos.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            aria-label={`Go to photo ${index + 1}`}
            className={cn(
              "h-2 w-2 rounded-full transition-all",
              index === selectedIndex
                ? "bg-white w-4"
                : "bg-white/50 hover:bg-white/75"
            )}
          />
        ))}
      </div>
    </div>
  );
}
