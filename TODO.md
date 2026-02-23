# Tumwater Stays — Launch Checklist

## Accounts to Set Up

- [ ] **Stripe** — Create account at stripe.com, get test + live API keys
- [ ] **Resend** — Create account at resend.com, verify sending domain, get API key
- [ ] **Cloudflare** — Create account, set up Workers project
- [ ] **Google Voice** — Set up a number for guest calls/texts
- [ ] **PriceLabs** — Email support@pricelabs.co to activate Customer API (~$2/mo for 2 listings)

## Content to Add

- [ ] **Hero photo** — Add a Cascade mountain/property photo to `public/photos/hero/hero.jpg`
- [ ] **Studio photos** — Add photos to `public/photos/studio/` (update filenames in `src/data/units.ts`)
- [ ] **1BR photos** — Add photos to `public/photos/onebr/` (update filenames in `src/data/units.ts`)
- [ ] **Reviews** — Copy real Airbnb reviews into `src/data/reviews.ts`
- [ ] **Area guide** — Customize recommendations in `src/data/area-guide.ts`
- [ ] **House rules** — Update rules/policies in `src/data/house-rules.ts`
- [ ] **Unit descriptions** — Refine descriptions and amenities in `src/data/units.ts`

## Airbnb Integration

- [ ] **Get iCal URLs** — Airbnb > Listing > Availability > Export Calendar (one per unit)
- [ ] **Add Airbnb listing links** — Update footer href in `src/components/footer.tsx`

## Domain & Deployment

- [ ] **Buy domain** — Purchase via Cloudflare Registrar (tumwaterstays.com or similar)
- [ ] **Set env secrets on Cloudflare** — Run for each:
  ```
  npx wrangler secret put STRIPE_SECRET_KEY
  npx wrangler secret put RESEND_API_KEY
  npx wrangler secret put PRICELABS_API_KEY
  npx wrangler secret put STUDIO_ICAL_URL
  npx wrangler secret put ONEBR_ICAL_URL
  npx wrangler secret put HOST_EMAIL
  npx wrangler secret put NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  npx wrangler secret put NEXT_PUBLIC_GOOGLE_VOICE_NUMBER
  ```
- [ ] **Deploy** — `npm run deploy`
- [ ] **Configure custom domain** — Add domain to Workers project in Cloudflare dashboard
- [ ] **Verify Resend domain** — Set up DNS records so emails come from your domain instead of resend.dev

## Post-Launch

- [ ] **Test a booking** — Run through full flow with Stripe test keys
- [ ] **Switch Stripe to live mode** — Swap test keys for live keys
- [ ] **Update PriceLabs API** — Once activated, update endpoint in `src/lib/pricelabs.ts` if needed
