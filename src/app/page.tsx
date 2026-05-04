import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { ScrollToTop } from "@/components/scroll-to-top";
import { AreaGuide } from "@/components/sections/area-guide";
import { Booking } from "@/components/sections/booking";
import { Contact } from "@/components/sections/contact";
import { Hero } from "@/components/sections/hero";
import { HouseRules } from "@/components/sections/house-rules";
import { Reviews } from "@/components/sections/reviews";
import { Units } from "@/components/sections/units";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Units />
        <Booking />
        <AreaGuide />
        <Reviews />
        <HouseRules />
        <Contact />
      </main>
      <Footer />
      <ScrollToTop />
    </>
  );
}
