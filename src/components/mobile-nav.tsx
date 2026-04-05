"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { navItems } from "@/data/navigation";

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);

  const bookNowItem = navItems.find((item) => item.isButton);
  const regularItems = navItems.filter((item) => !item.isButton);

  return (
    <div className="md:hidden flex items-center gap-3">
      {/* Book Now button — always visible, outside the hamburger */}
      {bookNowItem && (
        <a
          href={bookNowItem.href}
          className="rounded-md bg-accent-warm px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-warm-dark"
        >
          {bookNowItem.label}
        </a>
      )}

      {/* Hamburger toggle */}
      <button
        onClick={toggleMenu}
        className="relative z-50 p-2 text-white focus:outline-none"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Full-screen overlay */}
      <div
        className={`fixed inset-0 z-40 flex flex-col items-center justify-center bg-primary transition-all duration-300 ease-in-out ${
          isOpen
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none"
        }`}
      >
        <nav className="flex flex-col items-center gap-8">
          {regularItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={closeMenu}
              className="text-2xl font-medium text-white transition-colors hover:text-accent-warm-light"
            >
              {item.label}
            </a>
          ))}

          {/* Book Now in overlay too for completeness */}
          {bookNowItem && (
            <a
              href={bookNowItem.href}
              onClick={closeMenu}
              className="mt-4 rounded-md bg-accent-warm px-8 py-3 text-xl font-semibold text-white transition-colors hover:bg-accent-warm-dark"
            >
              {bookNowItem.label}
            </a>
          )}
        </nav>
      </div>
    </div>
  );
}
