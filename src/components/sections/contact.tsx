"use client";

import { useState, type FormEvent } from "react";
import { Phone, MapPin, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    dates: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const phoneNumber = process.env.NEXT_PUBLIC_GOOGLE_VOICE_NUMBER;
  const hasPhone = phoneNumber && phoneNumber !== "placeholder";

  function validate() {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.email.trim()) newErrors.email = "Email is required.";
    if (!formData.message.trim()) newErrors.message = "Message is required.";
    return newErrors;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send message");
      }

      setStatus("success");
      setFormData({ name: "", email: "", dates: "", message: "" });
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    }
  }

  return (
    <section id="contact" className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-normal"
            style={{
              fontFamily: "var(--font-heading), ui-serif, Georgia, serif",
            }}
          >
            Get in Touch
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Questions about your stay? We&apos;d love to hear from you.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left column — Contact Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="contact-name">Name</Label>
              <Input
                id="contact-name"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Your name"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-email">Email</Label>
              <Input
                id="contact-email"
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-dates">Preferred Dates</Label>
              <Input
                id="contact-dates"
                value={formData.dates}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, dates: e.target.value }))
                }
                placeholder="e.g., Mar 15-18"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-message">Message</Label>
              <Textarea
                id="contact-message"
                required
                rows={4}
                value={formData.message}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, message: e.target.value }))
                }
                placeholder="How can we help?"
              />
              {errors.message && (
                <p className="text-sm text-destructive">{errors.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-accent-warm text-white hover:bg-accent-warm-dark"
            >
              {status === "loading" ? "Sending..." : "Send Message"}
            </Button>

            {status === "success" && (
              <p className="text-sm text-success font-medium">
                Message sent! We&apos;ll get back to you soon.
              </p>
            )}
            {status === "error" && (
              <p className="text-sm text-destructive font-medium">
                {errorMessage}
              </p>
            )}
          </form>

          {/* Right column — Contact Info */}
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-surface-dark p-3">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Call or Text Us</h3>
                {hasPhone ? (
                  <a
                    href={`tel:${phoneNumber}`}
                    className="text-muted-foreground hover:text-accent-warm transition-colors"
                  >
                    {phoneNumber}
                  </a>
                ) : (
                  <p className="text-muted-foreground">Coming soon</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="rounded-full bg-surface-dark p-3">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Location</h3>
                <p className="text-muted-foreground">Leavenworth, Washington</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="rounded-full bg-surface-dark p-3">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Email</h3>
                <a
                  href="mailto:hello@tumwaterstays.com"
                  className="text-muted-foreground hover:text-accent-warm transition-colors"
                >
                  hello@tumwaterstays.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
