import { Separator } from "@/components/ui/separator";

const quickLinks = [
  { label: "Book Now", href: "#booking" },
  { label: "Our Units", href: "#units" },
  { label: "Area Guide", href: "#area-guide" },
];

export function Footer() {
  return (
    <footer className="bg-primary text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Three-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Column 1 — Brand */}
          <div>
            <h3
              className="text-xl font-bold tracking-tight"
              style={{
                fontFamily: "var(--font-heading), ui-serif, Georgia, serif",
              }}
            >
              Tumwater Stays
            </h3>
            <p className="mt-2 text-sm text-white/70 leading-relaxed">
              Your peaceful retreat in Washington&apos;s Bavarian village.
              Comfortable, well-appointed vacation rentals steps from downtown
              Leavenworth.
            </p>
            <p className="mt-3 text-sm text-white/60">Leavenworth, Washington</p>
          </div>

          {/* Column 2 — Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/80 mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Also find us on */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/80 mb-4">
              Also Find Us On
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-sm text-white/70 hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Airbnb
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Separator */}
        <Separator className="my-8 bg-white/20" />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-white/60">
          <p>&copy; 2026 Tumwater Stays. All rights reserved.</p>
          <p>Book direct and save</p>
        </div>
      </div>
    </footer>
  );
}
