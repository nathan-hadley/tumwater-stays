import { redirect } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { stripe } from "@/lib/stripe";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function BookingSuccessPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const sessionId = typeof params.session_id === "string" ? params.session_id : null;

  if (!sessionId) {
    redirect("/");
  }

  let session: Awaited<ReturnType<typeof stripe.checkout.sessions.retrieve>> | null = null;
  let fetchError = false;

  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    fetchError = true;
  }

  const metadata = session?.metadata;
  const unitName = metadata?.unitName;
  const checkIn = metadata?.checkIn;
  const checkOut = metadata?.checkOut;
  const guestName = metadata?.guestName;
  const guestEmail = metadata?.guestEmail;
  const guests = metadata?.guests;
  const amountTotal = session?.amount_total;

  // Trigger confirmation email (fire-and-forget, don't block the page)
  if (session && !fetchError && guestEmail) {
    const origin =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    fetch(`${origin}/api/booking-confirmation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        unitName,
        checkIn,
        checkOut,
        guestName,
        guestEmail,
        totalPaid: amountTotal,
        guests,
      }),
    }).catch(() => {
      // Silently fail — confirmation email is best-effort
    });
  }

  // Fallback: generic thank-you when Stripe retrieval fails
  if (fetchError || !session) {
    return (
      <main className="min-h-screen bg-background flex items-start justify-center px-4">
        <div className="mt-32 max-w-lg mx-auto text-center">
          <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
            <div className="flex justify-center mb-6">
              <CheckCircle className="h-16 w-16 text-success" />
            </div>
            <h1
              className="text-3xl mb-4 text-foreground"
              style={{
                fontFamily: "var(--font-heading), ui-serif, Georgia, serif",
              }}
            >
              Thank You for Your Booking!
            </h1>
            <p className="text-muted-foreground mb-8">
              Your payment was received. You will receive a confirmation email
              with details and next steps shortly.
            </p>
            <a
              href="/"
              className="inline-block rounded-md bg-accent-warm px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-warm-dark"
            >
              Back to Home
            </a>
          </div>
        </div>
      </main>
    );
  }

  const formattedAmount =
    amountTotal != null
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "usd",
        }).format(amountTotal / 100)
      : null;

  return (
    <main className="min-h-screen bg-background flex items-start justify-center px-4">
      <div className="mt-32 max-w-lg mx-auto text-center">
        <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
          <div className="flex justify-center mb-6">
            <CheckCircle className="h-16 w-16 text-success" />
          </div>

          <h1
            className="text-3xl mb-2 text-foreground"
            style={{
              fontFamily: "var(--font-heading), ui-serif, Georgia, serif",
            }}
          >
            Booking Confirmed!
          </h1>

          <p className="text-muted-foreground mb-8">
            Your reservation has been confirmed and payment processed.
          </p>

          {/* Booking details */}
          <div className="text-left space-y-3 rounded-lg border border-border bg-background p-5 mb-8">
            {unitName && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Unit</span>
                <span className="font-medium text-foreground">{unitName}</span>
              </div>
            )}
            {checkIn && checkOut && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Dates</span>
                <span className="font-medium text-foreground">
                  {checkIn} to {checkOut}
                </span>
              </div>
            )}
            {guestName && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Guest</span>
                <span className="font-medium text-foreground">{guestName}</span>
              </div>
            )}
            {formattedAmount && (
              <div className="flex justify-between text-sm border-t border-border pt-3 mt-3">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="font-semibold text-foreground">
                  {formattedAmount}
                </span>
              </div>
            )}
          </div>

          <p className="text-sm text-muted-foreground mb-8">
            You will receive a confirmation email at{" "}
            <span className="font-medium text-foreground">{guestEmail}</span>{" "}
            with check-in details and next steps.
          </p>

          <a
            href="/"
            className="inline-block rounded-md bg-accent-warm px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-warm-dark"
          >
            Back to Home
          </a>
        </div>
      </div>
    </main>
  );
}
