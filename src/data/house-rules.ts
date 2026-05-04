export type RuleSection = {
  title: string;
  content: string;
};

export const houseRules: RuleSection[] = [
  {
    title: "Check-in & Check-out",
    content:
      "Check-in is at 3:00 PM. Check-out is at 11:00 AM. Early check-in or late check-out may be available upon request.",
  },
  {
    title: "Quiet Hours",
    content:
      "Please respect quiet hours from 7:00 PM to 7:00 AM. Our family lives upstairs, and we ask that guests be mindful of noise levels. Please do not play loud music at any time.",
  },
  {
    title: "Parking",
    content:
      "Free parking is available on-site. EV charger (Level 2) available for electric vehicles.",
  },
  {
    title: "Smoking",
    content: "No smoking inside the units. Please smoke outdoors only.",
  },
  {
    title: "Pets",
    content: "Sorry, no pets allowed in either unit.",
  },
  {
    title: "Cancellation Policy",
    content:
      "Full refund if cancelled 7+ days before check-in. 50% refund if cancelled 3–7 days before. No refund within 3 days of check-in.",
  },
  {
    title: "Safety",
    content: "Carbon monoxide alarm and smoke alarm installed in both units.",
  },
];
