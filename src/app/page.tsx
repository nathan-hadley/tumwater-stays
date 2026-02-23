import { Nav } from "@/components/nav";
import { Hero } from "@/components/sections/hero";
import { Units } from "@/components/sections/units";
import { Availability } from "@/components/sections/availability";
import { Booking } from "@/components/sections/booking";
import { AreaGuide } from "@/components/sections/area-guide";
import { Reviews } from "@/components/sections/reviews";
import { HouseRules } from "@/components/sections/house-rules";
import { Contact } from "@/components/sections/contact";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Units />
        <Availability />
        <Booking />
        <AreaGuide />
        <Reviews />
        <HouseRules />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
