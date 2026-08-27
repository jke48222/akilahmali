# Akilah Mali, official site

The official website for Akilah Mali (stage name MALI), an independent Atlanta singer and
songwriter. It is where someone who just heard a song goes to hear the rest, read who she is, and
leave a way to be told about the next release.

**Live at [akilahmali.com](https://www.akilahmali.com)**

> **Read this first if you are auditing the stack.** This repository contains **two separate
> projects**. The site described in the first half is the one that is live, and it is a static
> site with one API route. A second, unshipped prototype named `malicantsing` is committed inside
> `.claude/worktrees/` and has an entirely different and much larger stack: Shopify, Sanity,
> Klaviyo, Redis. **None of that runs on akilahmali.com.** It is documented in its own clearly
> marked section at the bottom.

## What problem this solves

An independent artist at roughly 220 monthly Spotify listeners has a specific and unglamorous
problem: the platforms own the relationship. Spotify knows who listens. Instagram knows who
follows. Neither will hand over a list, and both decide on their own terms who sees the next
release.

The site exists to convert that borrowed attention into something the artist owns: an email
address and a phone number on a list she controls. Everything else on it, the music, the photos,
the bio, is there to earn the thirty seconds it takes someone to type an email into the footer.

That framing decides the architecture. A site whose job is to hold attention for a minute and
capture a signup should not have a database, a content backend, or a build that can break on a
release day. Music playback, the mailing list, and (when there are dates) the tour calendar are all
served by the platforms that already own that data, embedded live. The site's own content is one
hand-edited TypeScript file. There is nothing to keep in sync and nothing to log into.

## How it works

A static Next.js site. Every route prerenders to HTML at build time, confirmed live by the
`x-nextjs-prerender: 1` response header. There is exactly one server route in the whole
application.

```
src/lib/site.ts        one hand-edited file: artist, nav, socials, bio,
      │                Spotify IDs, the Laylo drop, contact email
      ▼
src/app/**/page.tsx    6 static pages
      │
      ├──► Spotify iframes         music playback, never copied audio
      ├──► Laylo iframe            the text chain signup
      └──► POST /api/subscribe ──► Laylo GraphQL subscribeToUser
                                   (the one server route)
```

### The routes

| Route | What it is |
| --- | --- |
| `/` | Hero video, then Listen Now: the featured release and the text-chain signup |
| `/about` | Bio and press photography |
| `/music` | Spotify embed grid, artist and album and singles |
| `/music/who-really-won` | A WebGL control-room experience built for the EP. See below. |
| `/music/tower-of-roses` | The current single, as a standalone release page |
| `/tour` | Press banner and a "dates coming soon" placeholder. Seated widget styling is already in `globals.css` for when dates exist. |
| `/cart` | Three lines. Redirects to the external store. |

Navigation is HOME, ABOUT, MERCH, TOUR, MUSIC, from
[`src/lib/site.ts`](src/lib/site.ts). MERCH points off-site to `shop.akilahmali.com`.

### The one server route

[`src/app/api/subscribe/route.ts`](src/app/api/subscribe/route.ts) takes an email from the footer,
validates its shape, and forwards it to Laylo's GraphQL `subscribeToUser` mutation. Laylo is the
service that runs the artist's text-and-email drop list. The API key is a secret, so this route
exists purely to keep it off the client.

It fails honestly rather than pretending. With no `LAYLO_API_KEY` set it returns 503 and the
message "Signups aren't connected yet", instead of returning success into a void.

### The Who Really Won experience

[`/music/who-really-won`](src/components/wrw/grid/) is the one piece of real engineering on the
site: a 3D security control room, built with three.js through react-three-fiber, where seven
monitors each carry one track from the EP. Clicking a monitor blows that feed up full screen with
its own audio preview and its release links. The monitor positions were not placed by eye. They
were calibrated by raycasting the GLB model's own monitor faces and running k-means over the hit
points, so the overlaid photographs sit exactly on the screen geometry the model already had.

It is loaded through `next/dynamic` with `ssr: false`
([`WhoReallyWonClient.tsx`](src/components/wrw/grid/WhoReallyWonClient.tsx)). Importing it
statically pulled the entire three.js graph into the first-load bundle of every release route,
including text-only ones that render and redirect. Splitting it keeps three, drei, fiber, and gsap
out of every other route and lets the page shell paint while the chunk streams.

[`src/lib/device.ts`](src/lib/device.ts) backs it with two heuristics: a memoized coarse-pointer
check that dials back antialiasing, device pixel ratio, and texture anisotropy on touch devices,
and a live `prefers-reduced-motion` subscription through `useSyncExternalStore` that updates if the
visitor flips the OS setting mid-session.

### Design

Self-hosted type: Nimbus Sans for body and navigation, Golden Hopes and Brittany Signature for
display, all four faces in `/public/fonts`. A red and oxblood palette defined as eight custom
properties in [`src/app/globals.css`](src/app/globals.css): brick `#b0453c`, oxblood `#4a1715`,
hero base `#2c0d0c`, warm near-black ink `#190a09`, warm cream `#f6efe9`, and a refined accent red
`#bf3b32`.

## What is not in this site

Stated explicitly because the prototype below makes it easy to assume otherwise. None of the
following is present in the live application, and each was checked:

| Not present | Checked how |
| --- | --- |
| Shopify, or any cart | No Shopify package in `package.json` or `package-lock.json`. `src/app/cart/page.tsx` is a 3 line redirect. There is no cart state anywhere. |
| Sanity, or any CMS | No dependency. Content is `src/lib/site.ts`, edited by hand. `akilahmali.com/studio` returns 404. |
| Webhooks, HMAC verification, ISR | No `revalidatePath`, no `revalidate`, no signature verification anywhere in `src/`. Every route is static. |
| Klaviyo | No dependency. The list is Laylo. |
| Rate limiting, Redis, Upstash | No dependency, and grepping `src/` for `ratelimit` and `throttle` returns nothing. `/api/subscribe` is unthrottled. |

### The store link, and a stale code comment

[`src/lib/shop.ts`](src/lib/shop.ts) is a feature flag whose comment states that
`shop.akilahmali.com` is not built and that DNS does not resolve, and it hides shop links until
`NEXT_PUBLIC_SHOP_URL` is set.

**That comment is now out of date, and the flag does less than it says.** As of 27 Aug 2026
`shop.akilahmali.com` resolves and serves a Fourthwall storefront that is password-locked (it
answers 302 to `/password`). And `SHOP_URL` gates exactly one link, the store button inside the EP
experience's blast overlay. The MERCH item in the navigation and the `/cart` redirect are hardcoded
to `shop.akilahmali.com` in [`src/lib/site.ts`](src/lib/site.ts) and are live on the site right
now, pointing at that locked store. Anyone touching the shop wiring should reconcile these three
places first.

## Results

| Measured | Value | How |
| --- | --- | --- |
| Live status | HTTP 200, prerendered | `curl` to akilahmali.com, `x-nextjs-prerender: 1` |
| Pages | 6 static routes plus `/cart` redirect | `src/app/` |
| Server routes | 1 | `src/app/api/subscribe/route.ts` |
| Application source | 3,155 lines across 37 TypeScript files | `src/` |
| Static assets | 66 MB in `public/` | `du -sh public/` |
| Commits | 69, from 4 Jun 2026 to 12 Aug 2026 | `git log` |
| Automated tests | 0 | no test files, no test runner |

**Not measured, and therefore not claimed:** Lighthouse scores, frame rate inside the WebGL
experience, bundle sizes, or conversion on the signup. No audit artifact or profiler output is
committed. The code splitting described above is a structural fact about the imports, not a
measured byte count.

**Not tested:** no test suite of any kind. The WebGL experience in particular was tuned by hand on
available devices, which is why `src/lib/device.ts` exists.

## Running it

Requires Node 20.9 or newer, which is what Next 16 declares in its own `engines` field.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # all routes static
npm run lint
```

No environment variables are needed to run or build the site. One is needed for the footer signup
to actually work:

| Variable | Effect |
| --- | --- |
| `LAYLO_API_KEY` | Without it, `/api/subscribe` returns 503 with a clear message and no signup is captured. Generate one in Laylo under Settings, Integrations. |
| `NEXT_PUBLIC_SHOP_URL` | Re-enables the store link inside the EP blast overlay. Does not affect the hardcoded MERCH nav item. |

This repository cannot tell you whether `LAYLO_API_KEY` is set on the deployment, because that
lives in the hosting environment. If signups matter, verify it there.

Security headers (HSTS, nosniff, Referrer-Policy, Permissions-Policy) and immutable caching for
static assets are set in [`vercel.json`](vercel.json).

## Project layout

```
src/
├── app/
│   ├── page.tsx about/ music/ tour/    The static pages
│   ├── music/who-really-won/           The WebGL EP experience
│   ├── music/tower-of-roses/           The current single
│   ├── api/subscribe/route.ts          The only server route
│   ├── cart/page.tsx                   3 line external redirect
│   └── globals.css layout.tsx          Fonts, palette, embed styling
├── components/
│   ├── Hero Header ListenNow SpotifyEmbed LayloCard SubscribeFooter
│   └── wrw/grid/                       Control room: scene, monitors, HUD,
│                                       blast overlay, paper-tear landing
└── lib/
    ├── site.ts                         The content file. Edit this.
    ├── shop.ts                         Store feature flag. See the note above.
    ├── device.ts motion.ts             Pointer and reduced-motion heuristics
    └── wrw/grid.ts wrw/tracks.ts       The seven feeds and the EP track data

public/
├── assets/  images/                    Hero video, press photos, cover art,
│                                       wordmarks. The artist's own material.
├── wrw-assets/                         EP photography, audio previews, and the
│                                       two GLB models for the control room
└── fonts/                              Four self-hosted faces

.claude/worktrees/                      The unshipped prototype. See below.
```

To update the site for a new release, edit `release` in [`src/lib/site.ts`](src/lib/site.ts). The
hero and the lead embeds on `/` and `/music` all read from that one block.

## Status

Shipped and live. 69 commits, most recently the Tower of Roses drop on 12 Aug 2026, which brought
a new hero video, the Golden Hopes display face, the release stub page, and retired the earlier
turntable component.

Known gaps, in the order I would address them:

- **The shop wiring is inconsistent**, as described above. Three places disagree about whether the
  store exists, and the store that now answers is password-locked.
- **`/api/subscribe` has no rate limiting.** It is a public unauthenticated endpoint that forwards
  to a third-party API on the artist's account. It should have a throttle before it matters.
- **`/tour` is a placeholder.** The Seated widget styling is already written; there are no dates.
- **No tests**, and the WebGL experience is the part most likely to regress silently on a
  dependency bump.

---

# The malicantsing prototype (not deployed)

Everything below describes a **different, unshipped project** that happens to be committed inside
this repository. It does not run on akilahmali.com. It has never been deployed anywhere.

## Where it lives

```
.claude/worktrees/youthful-goldwasser-fff891/
```

117 tracked files, added in a single commit `5e015a2` on 4 Jun 2026. Its `package.json` names it
`malicantsing`. Its own README is untouched `create-next-app` boilerplate.

## What it is

A two-part build from a product brief at
[`docs/prd.md`](.claude/worktrees/youthful-goldwasser-fff891/docs/prd.md): an artist site plus a
companion drop-style merch store, described in the brief as one universe in two skins. The brief's
header marks its status as "Brief v1, ready for design exploration" and lists its domains,
`malicantsing.com` and `shop.malicantsing.com`, as proposed. `malicantsing.com` does not resolve.

Its route groups are `(main)` with home, about, music, `music/[slug]`, videos, shows, press, and
contact, and `(store)` with `shop` and `shop/products/[handle]`.

## What it actually implements

This is not a scaffold. The integrations are real, and this is the stack that the live site is
sometimes assumed to have:

- **Shopify.** `@shopify/storefront-api-client` and `@shopify/hydrogen-react`, with a client,
  typed queries, and formatting under `lib/shopify/`. `app/api/cart/route.ts` keeps the Shopify
  cart ID in a cookie that is `httpOnly`, `sameSite: "lax"`, and `secure` in production, so the
  cart identifier never reaches client JavaScript, and clears the cookie when Shopify reports the
  cart is gone.
- **Sanity.** `sanity`, `next-sanity`, `@sanity/client`, and `@sanity/image-url`, with the Studio
  embedded at `app/studio/[[...tool]]/page.tsx` and **8 content schemas**: release, track, video,
  show, press, page, lookbook, settings.
- **Webhook-driven revalidation.** `app/api/revalidate/route.ts` verifies the Sanity webhook
  signature with `isValidSignature(rawBody, signature, SECRET)` before doing anything, rejects with
  401 if it fails, then maps the document type to the routes that depend on it and calls
  `revalidatePath()` on each. This is the incremental static regeneration the live site does not
  have.
- **Klaviyo**, via `klaviyo-api`, for the mailing list, where the live site uses Laylo.
- **Redis rate limiting.** `@upstash/ratelimit` and `@upstash/redis`, with
  `lib/rate-limit.ts` implementing a sliding window at **5 signups per IP per minute**, and
  degrading to allow-with-`skipped` when the Upstash environment variables are absent so a partial
  deploy does not break signups.
- Sentry, Vercel Analytics and Speed Insights, and Zod schema validation.

## Why it is documented here

Because it is in the repository, and a reader who greps `package-lock.json` inside the worktree
will find Shopify and Sanity and reasonably conclude the live site runs them. It does not. The
live site is the static one described in the first half of this file. The prototype is a more
ambitious build against a proposed brand and a proposed domain, and it stopped at brief stage.

If the store or a CMS is ever wanted on akilahmali.com, this worktree is where the working
integrations already are.

---

Site and code by Jalen Edusei, [jalenedusei.com](https://www.jalenedusei.com). Music, photography,
and video are Akilah Mali's own material. She owns her masters.
