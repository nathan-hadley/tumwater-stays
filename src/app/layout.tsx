import type { Metadata } from "next";
import { headingFont, bodyFont } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tumwater Stays | Direct Booking in Leavenworth, WA",
  description:
    "Book direct and save at Tumwater Stays — two cozy vacation rentals in Leavenworth, Washington. Studio and one-bedroom units with mountain town charm.",
  keywords: [
    "Leavenworth",
    "vacation rental",
    "Washington",
    "direct booking",
    "Tumwater Stays",
    "mountain getaway",
  ],
  openGraph: {
    title: "Tumwater Stays | Direct Booking in Leavenworth, WA",
    description:
      "Two cozy mountain retreats in Leavenworth, WA. Book direct and save.",
    type: "website",
    locale: "en_US",
    siteName: "Tumwater Stays",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tumwater Stays | Direct Booking in Leavenworth, WA",
    description:
      "Two cozy mountain retreats in Leavenworth, WA. Book direct and save.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${headingFont.variable} ${bodyFont.variable} bg-background text-foreground antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
