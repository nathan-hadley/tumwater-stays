export type RuleSection = {
  title: string;
  content: string;
};

export const houseRules: RuleSection[] = [
  {
    title: "Check-in & Check-out",
    content: "Check-in is at 4:00 PM. Check-out is at 11:00 AM. Early check-in or late check-out may be available upon request.",
  },
  {
    title: "Cancellation Policy",
    content: "Full refund if cancelled 7+ days before check-in. 50% refund if cancelled 3-7 days before. No refund within 3 days of check-in.",
  },
  {
    title: "Pets",
    content: "Sorry, no pets allowed in either unit.",
  },
  {
    title: "Smoking",
    content: "No smoking inside the units. Designated outdoor smoking area available.",
  },
  {
    title: "Parking",
    content: "Free parking available on-site. One vehicle per unit.",
  },
  {
    title: "Quiet Hours",
    content: "Please respect quiet hours from 10:00 PM to 8:00 AM.",
  },
];
