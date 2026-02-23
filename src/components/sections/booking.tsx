"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { units } from "@/data/units";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  GuestCountPicker,
  type GuestCounts,
} from "@/components/guest-count-picker";
import { DateRangePicker } from "@/components/date-range-picker";
import {
  PricingBreakdown,
  type NightlyRate,
} from "@/components/pricing-breakdown";

const DEFAULT_GUESTS: GuestCounts = { adults: 1, children: 0, infants: 0 };

export function Booking() {
  const [selectedUnit, setSelectedUnit] = useState<"studio" | "onebr">(
    "studio"
  );
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [guests, setGuests] = useState<GuestCounts>(DEFAULT_GUESTS);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");

  // Pricing state
  const [rates, setRates] = useState<NightlyRate[] | null>(null);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [ratesError, setRatesError] = useState<string | null>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Reset guests when unit changes
  const handleUnitChange = useCallback((unitId: "studio" | "onebr") => {
    setSelectedUnit(unitId);
    setGuests(DEFAULT_GUESTS);
    setCheckIn(null);
    setCheckOut(null);
    setRates(null);
    setRatesError(null);
  }, []);

  // Reset check-out when check-in changes
  const handleCheckInChange = useCallback(
    (date: Date | null) => {
      setCheckIn(date);
      setCheckOut(null);
      setRates(null);
      setRatesError(null);
    },
    []
  );

  const handleCheckOutChange = useCallback((date: Date | null) => {
    setCheckOut(date);
  }, []);

  // Fetch pricing whenever unit + checkIn + checkOut are all set
  useEffect(() => {
    if (!checkIn || !checkOut) {
      setRates(null);
      setRatesError(null);
      return;
    }

    const controller = new AbortController();

    async function fetchPricing() {
      setIsLoadingRates(true);
      setRatesError(null);

      try {
        const params = new URLSearchParams({
          unit: selectedUnit,
          checkIn: format(checkIn!, "yyyy-MM-dd"),
          checkOut: format(checkOut!, "yyyy-MM-dd"),
        });

        const res = await fetch(`/api/pricing?${params}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error("Failed to fetch pricing");
        }

        const data = await res.json();
        setRates(data.rates);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setRatesError("Unable to load pricing");
      } finally {
        setIsLoadingRates(false);
      }
    }

    fetchPricing();

    return () => controller.abort();
  }, [selectedUnit, checkIn, checkOut]);

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
          className="text-3xl md:text-4xl text-center mb-10 text-foreground"
          style={{
            fontFamily: "var(--font-heading), ui-serif, Georgia, serif",
          }}
        >
          Book Your Stay
        </h2>

        {/* Unit Selector */}
        <div className="grid grid-cols-2 gap-3 mb-8 max-w-lg mx-auto">
          {units.map((unit) => (
            <button
              key={unit.id}
              type="button"
              onClick={() =>
                handleUnitChange(unit.id as "studio" | "onebr")
              }
              className={cn(
                "rounded-xl border-2 p-4 text-left transition-all",
                selectedUnit === unit.id
                  ? "border-accent-warm ring-2 ring-accent-warm bg-accent-warm/5"
                  : "border-border hover:border-muted-foreground/30 bg-card"
              )}
            >
              <div className="text-sm font-semibold text-foreground">
                {unit.name}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {unit.tagline}
              </div>
            </button>
          ))}
        </div>

        {/* Two-column layout */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left column: Date picker + Guest count */}
            <div className="lg:col-span-3 space-y-8">
              {/* Date Picker */}
              <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-foreground mb-4">
                  Select Dates
                </h3>
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
                <h3 className="text-sm font-semibold text-foreground mb-4">
                  Guests
                </h3>
                <GuestCountPicker
                  unitId={selectedUnit}
                  value={guests}
                  onChange={setGuests}
                />
              </div>
            </div>

            {/* Right column: Pricing + Guest info + Submit */}
            <div className="lg:col-span-2 space-y-6">
              {/* Pricing */}
              <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-foreground mb-4">
                  Pricing
                </h3>
                {checkIn && checkOut ? (
                  <PricingBreakdown
                    rates={rates}
                    isLoading={isLoadingRates}
                    error={ratesError}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Select dates to see pricing
                  </p>
                )}
              </div>

              {/* Guest Info */}
              <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-4">
                <h3 className="text-sm font-semibold text-foreground">
                  Your Information
                </h3>

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

              <Button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className="w-full bg-accent-warm text-white hover:bg-accent-warm-dark h-12 text-base font-semibold"
              >
                {isSubmitting ? "Processing\u2026" : "Pay & Book"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
