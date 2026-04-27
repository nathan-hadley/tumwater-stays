export type NavItem = {
  label: string;
  href: string;
  isButton?: boolean;
};

export const navItems: NavItem[] = [
  { label: "Units", href: "#units" },
  { label: "Book Now", href: "#booking", isButton: true },
  { label: "Area Guide", href: "#area-guide" },
  { label: "Contact", href: "#contact" },
];
