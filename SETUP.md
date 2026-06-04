# MALI — Website Setup Guide (End to End)

This is the complete guide to running, deploying, and configuring the site.

**The most important thing to know:** the site works out of the box with zero
configuration. All of mali's real content (releases, lyrics, credits, covers,
bio, social links, the Who Really Won? video) is baked into the code and renders
on a fresh deploy with no accounts or API keys. Every integration below is
*optional* and "lights up" one extra feature. Set them up in the order that
matters to you.

---

## Table of contents

1. [What runs out of the box vs. what each integration adds](#1-what-runs-out-of-the-box)
2. [Run it locally](#2-run-it-locally)
3. [Deploy to Vercel](#3-deploy-to-vercel)
4. [Connect the domain (and the shop subdomain)](#4-connect-the-domain)
5. [Integrations](#5-integrations) — Sanity, Email, Rate limiting, Social feeds, Shop, Analytics, Errors
6. [Editing content day to day](#6-editing-content-day-to-day)
7. [Full environment-variable reference](#7-environment-variable-reference)
8. [Common tasks](#8-common-tasks)
9. [Troubleshooting](#9-troubleshooting)
10. [The "Who Really Won?" immersive release](#10-the-who-really-won-immersive-release)

---

## 1. What runs out of the box

| Feature | Works with no setup? | Integration that upgrades it |
| --- | --- | --- |
| Home, Music, release pages, Videos, About, Press, Contact, Shows | ✅ Yes (static content in code) | Sanity CMS (edit without code) |
| `/music/who-really-won` immersive control-room experience | ✅ Yes (self-contained, see §10) | — |
| Hero background film (Who Really Won? video) | ✅ Yes | — |
| Album covers, artist portrait, lyrics, credits, streaming links | ✅ Yes | Sanity CMS |
| Email signup form | ⚠️ Renders, but submissions error | Klaviyo |
| Rate limiting on the signup form | ✅ Fails "open" (allows) | Upstash Redis |
| Instagram feed (home page) | ✅ Live via Curator.io widget | Theme/manage in Curator dashboard |
| Shop (`shop.akilahmali.com`) | ⚠️ Empty until connected | Shopify |
| Page-view analytics | ✅ Vercel Analytics auto-on | Plausible (optional 2nd) |
| Error monitoring | ✅ Off until configured | Sentry |

So: **deploy first, configure later.** Nothing breaks if a key is missing —
the related feature just falls back gracefully.

---

## 2. Run it locally

**Prerequisites:** [Node.js](https://nodejs.org) 20 or newer and Git.

```bash
git clone https://github.com/jke48222/akilahmali.git
cd akilahmali
npm install
npm run dev
```

Open <http://localhost:3000>. The site runs fully on static content — no
`.env.local` needed.

To configure integrations locally, copy the template and fill in only what you
need:

```bash
cp .env.local.example .env.local
```

`.env.local` is git-ignored; never commit real keys.

Useful commands:

| Command | What it does |
| --- | --- |
| `npm run dev` | Local dev server with hot reload |
| `npm run build` | Production build (run this before pushing big changes) |
| `npm run start` | Serve the production build locally |
| `npm run lint` | Lint the code |

---

## 3. Deploy to Vercel

The repo is already connected to Vercel and **auto-deploys on every push to the
`main` branch**. If you ever need to set it up from scratch:

1. Push the repo to GitHub (already done: `jke48222/akilahmali`).
2. Go to [vercel.com/new](https://vercel.com/new), import the GitHub repo.
3. Framework preset: **Next.js**. Root directory: **`./`** (the app is at the
   repo root). Leave build settings at their defaults.
4. Add any environment variables you want (Section 7), then **Deploy**.

After the first deploy, every `git push` to `main` ships automatically. Pull
requests get their own preview URLs.

**Adding/changing env vars in Vercel:** Project → **Settings → Environment
Variables**. Add the variable, choose the environments (Production / Preview /
Development), save, then **redeploy** (Deployments → ⋯ → Redeploy) so the new
value is picked up.

---

## 4. Connect the domain

The site expects two hosts:

- **`akilahmali.com`** → the main site
- **`shop.akilahmali.com`** → the store (routed automatically by
  `vercel.json` — requests to that subdomain are rewritten to the `/shop`
  routes)

Steps:

1. In Vercel: Project → **Settings → Domains** → add `akilahmali.com` **and**
   `shop.akilahmali.com`.
2. At your domain registrar, point DNS at Vercel (Vercel shows the exact
   records — usually an `A` record for the apex and a `CNAME` for `shop`).
3. Wait for DNS + SSL to provision (minutes to a couple hours).

> The brand name shown on the site is **mali**, but the technical domain stays
> `akilahmali.com`. If you ever move to a new domain, update `SITE_URL` in
> `app/layout.tsx`, `app/sitemap.ts`, `app/robots.ts`, and the `shop.` host
> values in `vercel.json` and the store components.

---

## 5. Integrations

Each section is independent. Do them in whatever order you care about. After
setting any env var in Vercel, redeploy.

### 5a. Sanity CMS — edit content without touching code

**Why:** lets mali (or anyone) edit releases, lyrics, credits, bios, shows,
press, and images from a visual editor at `yoursite.com/studio`, instead of
editing `lib/static-content.ts`. Until it's configured, the site uses the
static content and `/studio` is intentionally inactive.

1. Create a project at [sanity.io](https://www.sanity.io) (free tier is fine).
2. Note the **Project ID** and use the **`production`** dataset.
3. Project → **API → Tokens** → create a token with **Viewer** scope (use
   **Editor** if you want draft/preview mode). Copy it.
4. Project → **API → CORS origins** → add your site URL(s) and
   `http://localhost:3000`.
5. Set env vars (Vercel + `.env.local`):
   ```
   NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
   NEXT_PUBLIC_SANITY_DATASET=production
   NEXT_PUBLIC_SANITY_API_VERSION=2025-05-14
   SANITY_API_TOKEN=your_viewer_token
   SANITY_REVALIDATE_SECRET=any_long_random_string
   ```
6. Redeploy. Visit `yoursite.com/studio` and log in. The content models already
   exist: **Settings, Lookbook, Releases, Tracks, Videos, Shows, Press,
   Pages.** Anything you publish overrides the matching static block.
7. **Instant updates (optional):** Sanity → **API → Webhooks** → add a webhook
   pointing to `https://yoursite.com/api/revalidate`, method `POST`, with the
   **Secret** set to the same `SANITY_REVALIDATE_SECRET` value. This refreshes
   the affected pages the moment you publish (otherwise they refresh on their
   own within ~60 seconds).

> You don't have to use Sanity. Editing `lib/static-content.ts` directly and
> pushing is a perfectly valid workflow (see Section 6).

### 5b. Klaviyo — the email signup form

**Why:** makes the "hear it first" / mailing-list forms actually save emails.
Without it, the form renders but submitting returns an error.

1. In [Klaviyo](https://www.klaviyo.com): **Settings → API Keys** → create a
   **Private API Key** with scopes `lists:write`, `profiles:write`,
   `subscriptions:write`.
2. Open the **List** you want signups to land in; the numeric **List ID** is in
   the URL.
3. Set:
   ```
   KLAVIYO_PRIVATE_API_KEY=pk_xxx
   KLAVIYO_LIST_ID=XXXXXX
   ```
4. Redeploy and test the form on the home page.

### 5c. Upstash Redis — rate limiting

**Why:** stops bots from spamming the signup endpoint. If it's not set, the
limiter "fails open" (lets requests through) — fine for launch, recommended for
production.

Easiest path: Vercel → **Storage → Marketplace → Upstash → Connect**. It
auto-injects `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`. Or create
a database at [upstash.com](https://upstash.com) and copy those two values in
manually.

### 5d. Social feed (Instagram via Curator.io)

The home page has a **feed** section that displays mali's Instagram posts via a
[Curator.io](https://curator.io) widget (free plan). The published feed id is
hardcoded in `components/CuratorFeed.tsx`, so there's nothing to set in the
environment.

To manage it:

1. Log in to [curator.io](https://curator.io).
2. Make sure the feed is connected to the correct Instagram account
   (**@akilah.mali**) — the posts shown on the site are whatever that feed
   pulls.
3. Use the dashboard to theme the widget (colors, layout, columns) so it matches
   the dark site, and to add sources.

To point the site at a different Curator feed, replace `FEED_SRC` in
`components/CuratorFeed.tsx` with the new published script URL.

> The free plan adds a small "Powered by Curator" badge and allows ~2,000
> monthly views across up to 3 sources. TikTok can be added as a source in
> Curator if/when its API access is available to you.

### 5e. Shopify — the store

**Why:** powers `shop.akilahmali.com`. Until connected, the shop routes are
empty.

1. In Shopify admin, create a **custom app** (or Headless app) and enable the
   **Storefront API** with scopes `read_products`, `read_product_listings`,
   `write_checkouts`.
2. Copy the **Storefront API access token** and your **`*.myshopify.com`** host
   (the internal one, not the public domain).
3. Set:
   ```
   SHOPIFY_STORE_DOMAIN=mali-shop.myshopify.com
   SHOPIFY_STOREFRONT_API_TOKEN=your_storefront_token
   SHOPIFY_STOREFRONT_API_VERSION=2026-01
   ```
4. Redeploy. Products you publish in Shopify appear in the store, and checkout
   hands off to Shopify.

### 5f. Analytics

- **Vercel Analytics + Speed Insights** are already wired and turn on
  automatically on Vercel — nothing to do.
- **Plausible (optional):** register your domain at
  [plausible.io](https://plausible.io) and set
  `NEXT_PUBLIC_PLAUSIBLE_DOMAIN=akilahmali.com`. Leave it empty in
  dev/preview so the script never loads there.

### 5g. Sentry — error monitoring

**Why:** alerts you to runtime errors. Optional.

1. Create a project at [sentry.io](https://sentry.io).
2. Set:
   ```
   SENTRY_DSN=...
   NEXT_PUBLIC_SENTRY_DSN=...        # same DSN, exposed to the browser
   SENTRY_ORG=your-org
   SENTRY_PROJECT=your-project
   SENTRY_AUTH_TOKEN=...             # for source-map upload at build time
   ```

---

## 6. Editing content day to day

There are two ways to change what's on the site. You can mix them.

### Option A — Edit the code (no accounts needed)

All of mali's content lives in **`lib/static-content.ts`**:

- Releases (titles, dates, durations, blurbs, credits, streaming links, cover image paths)
- Track lyrics (the `LYRICS_*` constants)
- Videos
- Bio paragraphs, pull quote, gallery
- Press kit, contact buckets
- Social links and listen links

Images live in **`public/images/`**
(`mali-portrait.jpg`, `last-year.jpg`, `strange.jpg`, `who-really-won.jpg`).

To change something: edit the file (or drop a new image into `public/images/`
and point to it), commit, and push to `main`. Vercel redeploys automatically.

### Option B — Edit in Sanity (after 5a)

Go to `yoursite.com/studio`, edit visually, publish. Published documents
override the matching static content. Best for non-technical, frequent edits.

---

## 7. Environment-variable reference

Everything is optional. Set what you need in Vercel (and `.env.local` for local
dev). Full template: `.env.local.example`.

| Variable | Feature | Required? |
| --- | --- | --- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity CMS | For CMS editing |
| `NEXT_PUBLIC_SANITY_DATASET` | Sanity (`production`) | With CMS |
| `NEXT_PUBLIC_SANITY_API_VERSION` | Sanity API date | With CMS |
| `SANITY_API_TOKEN` | Sanity reads / Studio | With CMS |
| `SANITY_REVALIDATE_SECRET` | Instant publish webhook | Optional |
| `SHOPIFY_STORE_DOMAIN` | Store | For the shop |
| `SHOPIFY_STOREFRONT_API_TOKEN` | Store | For the shop |
| `SHOPIFY_STOREFRONT_API_VERSION` | Store (`2026-01`) | For the shop |
| `KLAVIYO_PRIVATE_API_KEY` | Email signup | For signups |
| `KLAVIYO_LIST_ID` | Email signup | For signups |
| `UPSTASH_REDIS_REST_URL` | Rate limiting | Recommended |
| `UPSTASH_REDIS_REST_TOKEN` | Rate limiting | Recommended |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Plausible analytics | Optional |
| `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` | Error monitoring | Optional |
| `SENTRY_ORG` / `SENTRY_PROJECT` / `SENTRY_AUTH_TOKEN` | Sentry build upload | Optional |

---

## 8. Common tasks

**Add or change a release/single/EP**
Edit the `STATIC_RELEASES` array in `lib/static-content.ts` (or add it in
Sanity). Add its cover to `public/images/` and set `coverImage`. Add lyrics as a
new `LYRICS_*` constant and reference it in the track list.

**Update streaming links**
Edit the `streamingLinks` on each release, and the shared `SPOTIFY_ARTIST` /
`APPLE_ARTIST` / `YTM_CHANNEL` / `SMARTLINK` constants at the top of
`lib/static-content.ts`.

**Update social handles/links**
`STATIC_SOCIAL_LINKS` and `STATIC_LISTEN_LINKS` in `lib/static-content.ts`, plus
`SOCIAL_PROFILES` in `lib/social.ts`, and the footer links in
`components/Footer.tsx`.

**Swap the hero background video**
Change `VIDEO_ID` in `components/home/HeroVideo.tsx`.

**Replace the artist photo**
Drop a new file in `public/images/` and update the references in
`app/(main)/about/page.tsx` and `lib/static-content.ts` (gallery/feed fallback).

**Change brand colors or fonts**
Colors: the `@theme` palette at the top of `app/globals.css`.
Fonts: `app/layout.tsx` (Fraunces / Space Grotesk / Space Mono).

**Add a show**
Add it in Sanity (Shows), or it shows the "no dates yet" state until then.

---

## 9. Troubleshooting

**The signup form errors when I submit.** Klaviyo isn't configured — set
`KLAVIYO_PRIVATE_API_KEY` and `KLAVIYO_LIST_ID`, then redeploy.

**`/studio` shows nothing / won't load.** Sanity isn't configured yet, which is
expected. Complete Section 5a.

**The Instagram feed shows the wrong posts.** The feed pulls from whatever
account is connected in the Curator dashboard — make sure it's @akilah.mali.

**The shop is empty.** Shopify isn't connected (Section 5e), or no products are
published.

**Changed an env var but nothing changed.** Env vars only apply on a fresh
build — redeploy from the Vercel dashboard.

**The hero video shows a brief loading frame.** Normal — YouTube buffers for a
moment, then the film fades in. The intro screen on first visit covers this.

**A change to `next.config.ts` didn't take effect locally.** Restart
`npm run dev` (config is read at startup, not hot-reloaded).

**A newly added route 404s or bounces in dev.** Next compiles new route folders
on first request; if a freshly added page misbehaves, restart `npm run dev`.

---

## 10. The "Who Really Won?" immersive release

`/music/who-really-won` is **not** a normal release page — it's a full-screen
WebGL "security control room" experience (the EP's concept). The discography
links to it like any other release; the `[slug]` route detects the
`who-really-won` slug and renders the experience instead of the standard spread.

**How it's wired**

- Experience component: `components/wrw/grid/WhoReallyWon.tsx` — paper-tear intro
  → 3D control room → click a monitor to zoom into a feed → full-screen "blast".
- Rendered from `app/(main)/music/[slug]/page.tsx` when `slug === "who-really-won"`.
- The blue desk button opens a bare looping page at
  `/music/who-really-won/turntable` (just the vinyl video + the track, nothing else).
- On these immersive routes the site nav, footer, intro, scroll bar, and custom
  cursor are suppressed via `lib/immersive.ts` + `components/ChromeGate.tsx`
  (and the global chrome components). The grid uses its own reticle cursor
  (`.wrw-cursor` in `app/globals.css`).

**The 7 monitor feeds** — photo, song title, looping audio, streaming links, and
on-screen position — are all defined in **`lib/wrw/grid.ts`**, one object per
monitor. To swap a photo, change its `src`; to retune where it sits on the GLB
screen, adjust `pos` / `size` / `rotY`; `accent` is its hover-glow colour;
`tag` adds a small descriptor under the blast title (e.g. `"SINGLE"`).

**Assets**

| Asset | Path |
| --- | --- |
| Monitor + blast photos | `public/images/100_*.JPG` |
| Music-video feed | `public/video/who-really-won.mp4` |
| Per-feed looping audio | `public/wrw-assets/audio/*.m4a` |
| 3D room model (WebP-compressed, ~1.3 MB) | `public/wrw-assets/models/wrw.glb` |
| Turntable page media | `public/wrw-assets/turntable/{vinyl.mp4,tower-of-roses.mp3}` |

**Performance notes**

- The room model's textures are stored as **WebP** to keep the download small
  (~1.3 MB vs ~12 MB as PNG). If you re-export from Blender (PNG textures),
  re-run a texture→WebP repack before committing so the room loads fast.
- The WebGL render loop only runs while the room is actually on screen — it's
  paused behind the paper cover and behind an open blast — and renders at a
  capped device-pixel-ratio. Keep that in mind if you add per-frame work.
