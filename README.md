# Akilah Mali — official site

The official site for **Akilah Mali** (stage name **MALI**), an Atlanta-based
singer, songwriter, and independent artist. Built as a clean **Next.js 16 +
Tailwind v4 + Framer Motion** project. No environment variables or backend
required — music, signups, and tour data are served through live third-party
embeds.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (all routes static)
```

## Routes

| Route | Content |
| --- | --- |
| `/` | Hero video · Listen Now (Spotify top tracks + Laylo text chain) |
| `/about` | Bio + press photo |
| `/music` | Spotify embed grid (artist, EP, and singles) |
| `/music/who-really-won` | Immersive control-room experience for the EP |
| `/music/tower-of-roses` | "Tower of Roses" release stub (the control-room blast, standalone) |
| `/tour` | Press banner + tour-dates placeholder |
| `/cart` | Redirects to the external shop at `shop.akilahmali.com/cart` |

## Where to customize

Nearly all content lives in **`src/lib/site.ts`** — artist name, contact email,
nav, socials, bio, Spotify track/artist/album IDs, the Laylo drop, and the
merch/cart links. Edit there to update the site or rebrand for another artist.

- **Featured release** → `src/lib/site.ts` › `release` (title, Spotify IDs,
  listen link). The hero and the lead embeds on `/` and `/music` read from
  this block — update it on the next drop.
- **Hero video** → `src/lib/site.ts` › `assets.heroVideo` (a file in `/public/assets`),
  rendered by `src/components/Hero.tsx`.
- **Photos / cover art** → real images live in `/public/assets`; the `<Placeholder>`
  helper in `src/components/Media.tsx` renders any `src=` you pass it.
- **Spotify embeds** → `homeListen` and `musicGrid` in `src/lib/site.ts`.
- **Newsletter / text chain** → the Laylo embed (`site.laylo`) and the email
  capture in `src/components/SubscribeFooter.tsx`.

## Design tokens (`src/app/globals.css`)

- Red/maroon palette: accent `#bb8388` · maroon band `#3e1b1e` · hero base `#2a1012`
  · ink `#160d0e` · cream `#f7eeee` · rouge accent `#d23b3b`
- Type: **Nimbus Sans** (self-hosted, body + nav) · **Brittany Signature**
  (script section titles) — both in `/public/fonts`

## Notes

Media (the "Who Really Won?" hero video, press photos, wordmarks, cover art) are
the artist's own assets and live in `/public/assets`. Music playback, the email
text chain, and (when wired) tour dates are handled by live Spotify, Laylo, and
Seated embeds rather than copied content. The `/tour` page currently shows a
"tour dates coming soon" placeholder; Seated-widget styling is already present in
`globals.css` for when dates are added.
