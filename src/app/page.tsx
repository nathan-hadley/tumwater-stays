import { Nav } from "@/components/nav";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <section id="hero" className="min-h-screen">
          {/* Hero */}
        </section>
        <section id="units" className="py-20 px-4">
          {/* Units */}
        </section>
        <section id="availability" className="py-20 px-4 bg-surface-dark">
          {/* Availability */}
        </section>
        <section id="booking" className="py-20 px-4">
          {/* Booking */}
        </section>
        <section id="area-guide" className="py-20 px-4 bg-surface-dark">
          {/* Area Guide */}
        </section>
        <section id="reviews" className="py-20 px-4">
          {/* Reviews */}
        </section>
        <section id="rules" className="py-20 px-4 bg-surface-dark">
          {/* House Rules */}
        </section>
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
