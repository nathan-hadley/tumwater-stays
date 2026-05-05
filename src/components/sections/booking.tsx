"use client";

import { format } from "date-fns";
import { Info } from "lucide-react";
import { useState } from "react";

import { DateRangePicker } from "@/components/date-range-picker";
import { GuestCountPicker, type GuestCounts } from "@/components/guest-count-picker";
import { PricingBreakdown } from "@/components/pricing-breakdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { units } from "@/data/units";
import { usePricing } from "@/hooks/use-pricing";
import { cn } from "@/lib/utils";

const BOOKING_ENABLED = false;

const DEFAULT_GUESTS: GuestCounts = { adults: 1, children: 0, infants: 0 };

export function Booking() {
  const [selectedUnit, setSelectedUnit] = useState<"studio" | "onebr">("studio");
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [guests, setGuests] = useState<GuestCounts>(DEFAULT_GUESTS);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");

  const {
    rates,
    isLoading: isLoadingRates,
    error: ratesError,
  } = usePricing(selectedUnit, checkIn, checkOut);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleUnitChange = (unitId: "studio" | "onebr") => {
    setSelectedUnit(unitId);
    setGuests(DEFAULT_GUESTS);
    setCheckIn(null);
    setCheckOut(null);
  };

  const handleCheckInChange = (date: Date | null) => {
    setCheckIn(date);
    setCheckOut(null);
  };

  const handleCheckOutChange = (date: Date | null) => {
    setCheckOut(date);
  };

  // Form validation
  const isFormValid =
    checkIn &&
    checkOut &&
    guestName.trim().length > 0 &&
    guestEmail.trim().length > 0 &&
    guestEmail.includes("@");

  // Submit handler
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unit: selectedUnit,
          checkIn: format(checkIn!, "yyyy-MM-dd"),
          checkOut: format(checkOut!, "yyyy-MM-dd"),
          guests,
          guestName: guestName.trim(),
          guestEmail: guestEmail.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error("Booking failed");
      }

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return; // Don't reset isSubmitting — we're navigating away
      }
    } catch {
      setSubmitError(
        "We couldn\u2019t process your booking right now. Please try again or contact us directly."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section id="booking" className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Heading */}
        <h2
          className="text-3xl md:text-4xl lg:text-5xl text-center mb-10 text-foreground"
          style={{
            fontFamily: "var(--font-heading), ui-serif, Georgia, serif",
          }}
        >
          Book Your Stay
        </h2>

        {/* Coming-soon notice */}
        {!BOOKING_ENABLED && (
          <div className="flex items-start gap-3 rounded-xl border border-accent-warm/40 bg-accent-warm/5 px-4 py-3 mb-8 max-w-lg mx-auto">
            <Info className="h-5 w-5 text-accent-warm shrink-0 mt-0.5" />
            <p className="text-sm text-foreground/80">
              Online booking is coming soon. In the meantime,{" "}
              <a
                href="#contact"
                className="font-medium text-accent-warm underline underline-offset-2 hover:text-accent-warm-dark"
              >
                contact us directly
              </a>{" "}
              to reserve your dates.
            </p>
          </div>
        )}

        {/* Unit Selector */}
        <div className="grid grid-cols-2 gap-3 mb-8 max-w-lg mx-auto">
          {units.map((unit) => (
            <button
              key={unit.id}
              type="button"
              onClick={() => handleUnitChange(unit.id as "studio" | "onebr")}
              className={cn(
                "rounded-xl border-2 p-4 text-left transition-all",
                selectedUnit === unit.id
                  ? "border-accent-warm ring-2 ring-accent-warm bg-accent-warm/5"
                  : "border-border hover:border-muted-foreground/30 bg-card"
              )}
            >
              <div className="text-sm font-semibold text-foreground">{unit.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{unit.tagline}</div>
            </button>
          ))}
        </div>

        {/* Two-column layout */}
        <form
          onSubmit={(e) => {
            void handleSubmit(e);
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left column: Date picker + Guest count */}
            <div className="lg:col-span-3 space-y-8">
              {/* Date Picker */}
              <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-foreground mb-4">Select Dates</h3>
                <DateRangePicker
                  unitId={selectedUnit}
                  checkIn={checkIn}
                  checkOut={checkOut}
                  onCheckInChange={handleCheckInChange}
                  onCheckOutChange={handleCheckOutChange}
                />
              </div>

              {/* Guest Count */}
              <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-foreground mb-4">Guests</h3>
                <GuestCountPicker unitId={selectedUnit} value={guests} onChange={setGuests} />
              </div>
            </div>

            {/* Right column: Pricing + Guest info + Submit */}
            <div className="lg:col-span-2 space-y-6">
              {/* Pricing */}
              <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-foreground mb-4">Pricing</h3>
                {checkIn && checkOut ? (
                  <PricingBreakdown
                    rates={rates}
                    isLoading={isLoadingRates}
                    error={ratesError ? "Unable to load pricing" : null}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">Select dates to see pricing</p>
                )}
              </div>

              {/* Guest Info */}
              <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Your Information</h3>

                <div className="space-y-2">
                  <Label htmlFor="guest-name">Full Name</Label>
                  <Input
                    id="guest-name"
                    type="text"
                    placeholder="Jane Smith"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guest-email">Email</Label>
                  <Input
                    id="guest-email"
                    type="email"
                    placeholder="jane@example.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Submit */}
              {submitError && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                  <p className="text-sm text-destructive">{submitError}</p>
                </div>
              )}

              {BOOKING_ENABLED ? (
                <Button
                  type="submit"
                  disabled={!isFormValid || isSubmitting}
                  className="w-full bg-accent-warm text-white hover:bg-accent-warm-dark h-12 text-base font-semibold"
                >
                  {isSubmitting ? "Processing\u2026" : "Pay & Book"}
                </Button>
              ) : (
                <Button
                  type="button"
                  asChild
                  className="w-full bg-accent-warm text-white hover:bg-accent-warm-dark h-12 text-base font-semibold"
                >
                  <a href="#contact">Contact Us to Book</a>
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
