import Image from "next/image";
import { ChevronDown } from "lucide-react";

export function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#1E3329] via-[#2D4A3E] to-[#1a2f26]"
    >
      {/* Background image */}
      <Image
        src="/photos/hero/hero.jpeg"
        alt="Mountain landscape near Leavenworth, Washington"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />

      {/* Dark overlay for text contrast */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Atmospheric texture overlay — subtle radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(61,99,84,0.4)_0%,transparent_60%)]" />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 pt-16 text-center">
        <div className="flex max-w-2xl flex-col items-center gap-6">
          {/* Subtitle — location */}
          <p className="text-sm tracking-[0.25em] uppercase text-white/90 md:text-base lg:text-lg">
            Leavenworth, Washington
          </p>

          {/* Main heading */}
          <h1
            className="text-5xl font-normal text-white md:text-6xl lg:text-7xl"
            style={{
              fontFamily: "var(--font-heading), ui-serif, Georgia, serif",
            }}
          >
            Tumwater Stays
          </h1>

          {/* Tagline */}
          <p className="max-w-lg text-base leading-relaxed text-white/80 md:text-lg">
            Two cozy mountain retreats. Book direct and save.
          </p>

          {/* CTA Button */}
          <a
            href="#booking"
            className="mt-2 inline-block w-full rounded-lg bg-accent-warm px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-accent-warm-dark sm:w-auto md:text-lg"
          >
            Book Direct &amp; Save
          </a>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <a
            href="#units"
            aria-label="Scroll to content"
            className="flex flex-col items-center gap-1 text-white/60 transition-colors hover:text-white/90"
          >
            <span className="text-xs tracking-widest uppercase">Explore</span>
            <ChevronDown className="h-5 w-5 animate-bounce" />
          </a>
        </div>
      </div>
    </section>
  );
}
