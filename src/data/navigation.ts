export type NavItem = {
  label: string;
  href: string;
  isButton?: boolean;
};

export const navItems: NavItem[] = [
  { label: "Units", href: "#units" },
  { label: "Availability", href: "#availability" },
  { label: "Book Now", href: "#booking", isButton: true },
  { label: "Area Guide", href: "#area-guide" },
  { label: "Contact", href: "#contact" },
];
