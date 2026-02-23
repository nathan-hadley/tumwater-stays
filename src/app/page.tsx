import { Nav } from "@/components/nav";
import { Hero } from "@/components/sections/hero";
import { Units } from "@/components/sections/units";
import { Availability } from "@/components/sections/availability";
import { AreaGuide } from "@/components/sections/area-guide";
import { Reviews } from "@/components/sections/reviews";
import { HouseRules } from "@/components/sections/house-rules";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Units />
        <Availability />
        <section id="booking" className="py-20 px-4">
          {/* Booking */}
        </section>
        <AreaGuide />
        <Reviews />
        <HouseRules />
        <section id="contact" className="py-20 px-4">
          {/* Contact */}
        </section>
      </main>
      <footer className="py-12 px-4 bg-primary text-white">
        {/* Footer */}
      </footer>
    </>
  );
}
