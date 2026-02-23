"use client";

import { useEffect, useState } from "react";
import { navItems } from "@/data/navigation";
import { MobileNav } from "@/components/mobile-nav";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    // Check initial scroll position
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const regularItems = navItems.filter((item) => !item.isButton);
  const bookNowItem = navItems.find((item) => item.isButton);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "bg-primary shadow-lg"
          : "bg-primary/80 backdrop-blur-md"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <a
          href="#"
          className="text-xl font-bold tracking-tight text-white"
          style={{ fontFamily: "var(--font-heading), ui-serif, Georgia, serif" }}
        >
          Tumwater Stays
        </a>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-6 md:flex">
          {regularItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-white/90 transition-colors hover:text-white"
            >
              {item.label}
            </a>
          ))}

          {/* Book Now as a styled button */}
          {bookNowItem && (
            <a
              href={bookNowItem.href}
              className="rounded-md bg-accent-warm px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-warm-dark"
            >
              {bookNowItem.label}
            </a>
          )}
        </div>

        {/* Mobile nav */}
        <MobileNav />
      </nav>
    </header>
  );
}
