# Tumwater Stays — Launch Checklist

## Accounts to Set Up

- [ ] **Stripe** — Create account at stripe.com, get test + live API keys
- [ ] **Resend** — Create account at resend.com, verify sending domain, get API key
- [ ] **Vercel** — Create account at vercel.com, import the GitHub repo
- [ ] **Google Voice** — Set up a number for guest calls/texts
- [ ] **PriceLabs** — Email support@pricelabs.co to activate Customer API (~$2/mo for 2 listings)

## Content to Add

- [X] **Hero photo** — Add a Cascade mountain/property photo to `public/photos/hero/hero.jpg`
- [X] **Studio photos** — Add photos to `public/photos/studio/` (update filenames in `src/data/units.ts`)
- [X] **1BR photos** — Add photos to `public/photos/onebr/` (update filenames in `src/data/units.ts`)
- [X] **Reviews** — Copy real Airbnb reviews into `src/data/reviews.ts`
- [X] **Area guide** — Customize recommendations in `src/data/area-guide.ts`
- [X] **House rules** — Update rules/policies in `src/data/house-rules.ts`
- [X] **Unit descriptions** — Refine descriptions and amenities in `src/data/units.ts`

## Airbnb Integration

- [ ] **Get iCal URLs** — Airbnb > Listing > Availability > Export Calendar (one per unit)
- [ ] **Add Airbnb listing links** — Update footer href in `src/components/footer.tsx`

## Domain & Deployment

- [ ] **Buy domain** — Purchase via any registrar (Namecheap, Cloudflare, Google Domains, etc.)
- [ ] **Set env variables on Vercel** — Add these in the Vercel dashboard under Project > Settings > Environment Variables:
  - `STRIPE_SECRET_KEY`
  - `RESEND_API_KEY`
  - `PRICELABS_API_KEY`
  - `STUDIO_ICAL_URL`
  - `ONEBR_ICAL_URL`
  - `HOST_EMAIL`
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - `NEXT_PUBLIC_GOOGLE_VOICE_NUMBER`
- [ ] **Deploy** — Push to `main` branch; Vercel deploys automatically
- [ ] **Configure custom domain** — Add domain in Vercel dashboard under Project > Settings > Domains
- [ ] **Verify Resend domain** — Set up DNS records so emails come from your domain instead of resend.dev

## Post-Launch

- [ ] **Test a booking** — Run through full flow with Stripe test keys
- [ ] **Switch Stripe to live mode** — Swap test keys for live keys
- [ ] **Update PriceLabs API** — Once activated, update endpoint in `src/lib/pricelabs.ts` if needed
