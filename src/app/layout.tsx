import type { Metadata } from "next";
import { headingFont, bodyFont } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tumwater Stays | Direct Booking in Leavenworth, WA",
  description:
    "Book direct and save at Tumwater Stays — two cozy vacation rentals in Leavenworth, Washington. Studio and one-bedroom units with mountain town charm.",
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
