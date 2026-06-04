# MALI

Official website for the artist **mali** (Akilah Brown-Pagan) — music, videos,
social feed, store, and editorial pages. Built with Next.js, dark-cinematic
design, an interactive enter screen, a video hero, and a custom interactive UI
layer.

## Quick start

```bash
npm install
npm run dev      # http://localhost:3000
```

The site runs fully on the content baked into the code — **no API keys or
accounts are required** to run or deploy it. Every integration (CMS, store,
email, social feeds, analytics) is optional and enhances one feature.

## Full setup

See **[SETUP.md](./SETUP.md)** for the complete end-to-end guide: local dev,
deploying to Vercel, connecting the domain, and configuring each integration
(Sanity CMS, Klaviyo, Upstash, social feeds, Shopify, analytics, Sentry).

## Stack

- **Next.js** (App Router) on **Vercel** (auto-deploys from `main`)
- **Sanity** for optional content management (`/studio`)
- **Shopify** Storefront API for the store (`shop.malicantsing.com`)
- **Klaviyo** for the mailing list, **Upstash Redis** for rate limiting
- **Curator.io** widget for the live Instagram feed
- Type: **Fraunces** + **Space Grotesk** + **Space Mono**

## Editing content

Content lives in `lib/static-content.ts` (edit + push), or in Sanity once
configured. Images are in `public/images/`. See SETUP.md §6 and §8.
