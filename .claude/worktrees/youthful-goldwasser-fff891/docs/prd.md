# PRD — MALI Official Website + Companion Merch Store

**Prepared for:** Claude (design + build agent)
**Subject:** Akilah Mali / @malicantsing — emerging alt-R&B / introspective pop artist
**Domains (proposed):** `malicantsing.com` (main site) + `shop.malicantsing.com` (store)
**Status:** Brief v1 — ready for design exploration

---

## 1. Project Overview

Build a two-part digital presence for MALI:

1. **The website** — a moody, photo-led artist site that functions as her hub for music, video, identity, and audience capture.
2. **The companion merch store** — a small, curated drop-style store that feels like an extension of the artist's world, not a generic e-commerce template.

These are designed as **one universe in two skins**: the website is editorial and atmospheric; the store is tactile and product-forward. They share type system, palette, and motion language, but the store leans cleaner and more transactional.

The brief is opinionated about positioning and information architecture, and deliberately loose on color/type/layout — Claude has creative latitude inside the guardrails defined below.

---

## 2. Artist Context

This isn't a Billie Eilish-tier site. MALI has roughly 220 monthly Spotify listeners as of the brief date, with three 2025 releases: *Last Year* (single), *Who Really Won?* (5-track EP), and *Strange* (single). Her biggest track ("Gone Away") sits around ~10k streams; everything else is in the four-figure range. Peer cluster on Spotify: Kayliah Love, Lydiahadie, dréa szn, Evania, m!na, Ivorie Sahandé — Black femme alt-R&B / introspective indie pop.

**What this means for the site:**

- **Design for the level she's at, not the level she'll reach.** A site that screams "stadium artist" reads as overcompensation. A site that's confident, quiet, and curated reads as taste — which is the real flex at this tier.
- **Avoid empty-shelf syndrome.** With only three releases and no tour dates, conventional artist-site templates (huge "TOUR" sections, multi-album discography grids) leave dead zones. Design for *density of mood*, not density of content.
- **Build for growth.** The system has to absorb new releases, tour dates, press, and merch drops without redesign.

**Tone of voice — the "malicantsing" insight:** her handle is a wink — she can clearly sing, and the irony is the point. The site copy should carry that same dry, slightly self-aware register. Not cute. Not winky. Just confident enough to undersell.

**Lyrical/thematic register (from track titles and the linktree subhead "we've all been in relationships that didn't last"):** retrospective, post-relationship, quietly devastating, past-tense. Identity, loneliness, interpersonal loss — not romance.

---

## 3. Strategic Objectives

In rough priority order:

1. **Convert discovery → streams.** Most visitors arrive from TikTok or Instagram. The site has to get them onto a streaming platform in under two clicks.
2. **Capture audience.** Email + SMS list. This is the single most important growth lever for a microartist; streaming followers don't translate to ticket or merch buyers, but an email list does.
3. **Sell merch without feeling like a merch site.** The store is a vibe extension, not a Shopify storefront pasted onto an artist page.
4. **Press / industry credibility.** A small "about" surface + clean press contact so A&Rs, sync agents, and bloggers can take her seriously in 90 seconds.
5. **Show, don't tell.** No "I'm an emerging artist on a journey" copy. Let the photography and music carry the weight.

---

## 4. Brand & Art Direction

### 4.1 Mood

Imagine the look of a private journal photographed in soft window light, then color-graded by someone who shoots film. Quiet intensity. Past-tense. A little cold around the edges, warm in the middle. Adult, not edgelord; honest, not confessional-pop.

**Reference adjacencies (vibe, not visual copy):** the muted melancholy of Steve Lacy's *Gemini Rights* art direction, the editorial restraint of late-era Frank Ocean web presence, the photo-led intimacy of Tiff Wat's site, the typographic confidence of Peggy Gou.

**Avoid:** TikTok-coded Y2K maximalism, glitter/sparkle effects, butterflies, "core" aesthetics, neon, cyber, Lana del Rey-cosplay vintage filters, glossy 2010s pop-girl gradient blobs.

### 4.2 Palette (directional, not prescriptive)

Designer should pick one of these directions, not blend:

- **Direction A — "Cold Window":** off-white background (#F4F2EE-ish), deep cool charcoal text (#1A1B1D), a single accent pulled from album art (likely a dusty rose or muted plum from the *Who Really Won?* artwork).
- **Direction B — "Late Room":** near-black background (#0B0B0C), warm bone text (#E8E2D6), single accent again pulled from artwork.
- **Direction C — "Velvet":** monochrome deep aubergine or oxblood, very limited type contrast, photography does all the color work.

The accent color is a *highlight*, not a brand color — used sparingly for hovers, the email signup CTA, and small interactive states. Don't paint anything in it.

### 4.3 Typography

Pair a serif display face with a clean sans body. Strong recommendation:

- **Display:** a contemporary serif with personality — candidates include **PP Editorial New**, **Migra**, **Reckless**, **GT Sectra Display**, or **Tiempos Headline**. Used at large sizes for the wordmark, hero, and section headers. Track tight, set big.
- **Body:** **Söhne**, **Inter**, **Neue Haas Grotesk**, or **GT America Mono** for credits/captions. Body copy 16–18px, generous line height (1.5–1.7).

The wordmark should be set in the display face, all caps, "MALI" with letter-spacing tuned for a poster-like weight. No custom logo lockup needed for v1.

### 4.4 Motion

Restraint over flash. The whole site should feel like a slow exhale.

- Fade-and-rise on scroll for content blocks (subtle, 600–800ms, ease-out).
- Photography that subtly parallax-shifts (not aggressive — 5–10px max).
- Hover states are typographic (underline animation, color shift) — no scale-up bouncing.
- One hero "moment" — see § 6.1.
- No autoplay video with sound. No cursor effects. No webgl orbs.

### 4.5 Imagery

Photography is the brand. Recommend MALI shoot or curate a small library (~12–20 images) in a consistent palette/grade for v1. Mix of:

- Editorial portraits (close-crop, eye contact)
- Environmental shots (interiors, windows, mirrors, hands, fabric texture)
- One full-bleed hero image
- Behind-the-scenes / studio
- Square crops for music release tiles

Designer should treat photography as a primary content type — not as decoration behind text.

---

## 5. Information Architecture

### 5.1 Main site — `malicantsing.com`

```
/                  Home (hero + latest release + about-snippet + signup + footer)
/music             Discography (EP + singles, embedded players, lyrics on hover/expand)
/music/[slug]      Individual release page (artwork, credits, links out, lyrics, video)
/videos            Music videos + visualizers (YouTube embeds in custom frames)
/about             Long-form artist bio, photos, press quotes
/shows             Live dates (empty-state-friendly, see §6.5)
/press             Press kit: hi-res photos, bio, logo files, contact
/contact           Booking / management / sync / press routing
```

Footer everywhere: streaming platform icons, social icons, email capture, copyright, "Shop" link.

### 5.2 Store — `shop.malicantsing.com`

```
/                  Shop home — featured drop + collection grid
/products/[slug]   Product detail
/cart              Cart
/checkout          Checkout (handled by Shopify or chosen backend)
/account           Login / order history (if Shopify)
/policies/*        Shipping, returns, FAQ
```

The store header includes a persistent "← back to malicantsing.com" link.

---

## 6. Page-by-Page Requirements (Main Site)

### 6.1 Home

**The Hero — the one "moment."** Full-viewport, photography-led. Either:

- **Option A:** A single still portrait, full-bleed, with the wordmark "MALI" set large in the display serif overlaid bottom-left, and a single-line tagline beneath. Tagline should be lyric-derived, not marketing copy. e.g. *"who really won?"* set in italics. No buttons in the hero — let the scroll affordance do the work.
- **Option B:** A muted, looping background video (15–30s, no sound, soft motion only) with same typographic overlay.

**Below the fold, in order:**

1. **Latest Release** — large artwork, release title, year, embedded Spotify play button + Apple Music link + "All platforms" link to her Linktree-equivalent landing.
2. **Three-up music tiles** — Last Year / Who Really Won? / Strange. Square artworks, hover reveals title + year.
3. **About snippet** — 2–3 sentences max. Link out to /about.
4. **Email capture** — single field, no friction. Copy: something like "for the next one." No "subscribe to my newsletter!" Pro tip: lead with email, ask for phone optionally on a second screen — SMS converts far better for artist drops.
5. **Footer.**

### 6.2 Music (`/music`)

Three releases right now, so don't grid them four-wide and let them rattle around. Stack them vertically as **editorial spreads** — each release gets a row with:

- Big artwork on one side
- Title, year, "Single" or "EP" tag, tracklist with durations on the other side
- Embedded play (Spotify preferred, fallback Apple Music)
- "Listen everywhere" link out
- Lyrics behind a toggle/expand per track
- Credits in small mono type below

This scales: each new release is a new spread. No restructure needed at 4 releases, 10 releases, or 20.

### 6.3 Music Release Detail (`/music/[slug]`)

One per release. Same editorial spread treatment, expanded:

- Full-bleed artwork hero
- Release date, format, label (likely self-released)
- Full credits block (writers, producers, mix, master, art direction)
- All streaming/purchase links
- Music video embed if applicable
- Full lyrics for every track
- "Next release" / "Previous release" navigation at the bottom

### 6.4 Videos (`/videos`)

YouTube embeds, but framed — wrap each embed in a custom container with title, release association, and date. Grid of 2 columns desktop, 1 mobile. Lazy-load thumbnails using YouTube's `lite-youtube` pattern, not full iframe — for performance.

### 6.5 Shows (`/shows`)

She likely has no announced dates. **Don't hide the page** — handle the empty state with intention:

> *"no shows announced. drop your email and you'll be the first."*

Email capture inline. When dates are added, the page flips to a clean stacked-list format: date, city, venue, "tickets" CTA.

### 6.6 About (`/about`)

Long-form, single-column, narrow column width (~600px max). Big lead photo. Two to four paragraphs of bio in the artist's own voice (not third-person publicist-speak — unless that's deliberately the joke). Embedded quotes if any press exists. Photo gallery at the bottom (4–8 images, click to expand).

### 6.7 Press (`/press`)

Utilitarian. Tabular list of downloadable assets:

- Hi-res press photos (.zip + individual)
- One-sheet bio (PDF, 1 page)
- Logo / wordmark files (.svg, .png — black, white, transparent)
- Recent press mentions (if any)
- Press contact email

### 6.8 Contact (`/contact`)

Three routing buckets, each with an email:

- **General / fan mail** — `realmalimusic@gmail.com`
- **Booking** — (placeholder until she has a booking agent)
- **Sync / licensing** — (placeholder)
- **Press** — (placeholder)

Use a single email until roles fill in; just be explicit about that. Don't fake an agency.

---

## 7. Merch Store Requirements

### 7.1 Positioning

The store should feel **drop-coded, not catalog-coded.** Think small-batch, limited, "while supplies last." This is the right register for an emerging artist whose audience is small but engaged.

References for *register* (not visual copy): xo.store (lookbook aesthetic, photo-forward, sparse grid), the Billie Eilish store (vibrant but curated, character-driven), Yana's site (minimal merch presented as art).

### 7.2 Launch SKU recommendations (designer doesn't decide, but PRD assumes)

For the v1 store, assume 3–6 SKUs, e.g.:

- One hero tee with cover-art-derived graphic
- One long-sleeve or hoodie
- One physical music item (vinyl 7", cassette of *Who Really Won?*, or signed CD — even one of these as a "limited" SKU builds list and revenue)
- One small-format item (poster, sticker pack)

### 7.3 Store home

- Hero — single image of one product styled editorially (on a body, in a room, not on a white seamless). Wordmark + "shop" overlaid.
- Collection grid — 2 columns mobile, 3 desktop. Each product card: lifestyle image, hover reveals product on white. Name + price below.
- Inline lookbook strip — 4–6 images of merch styled in context, scroll horizontally.
- Email capture for "next drop."

### 7.4 Product detail

- Image carousel — minimum 3 images per product (lifestyle, flat, detail).
- Title, price, color/size selectors, qty, add to cart.
- Short description — 1–2 sentences, conversational.
- Materials / fit / care — collapsible.
- Shipping & returns — collapsible.
- "Pairs with" — 2–3 related products at the bottom.

### 7.5 Backend stack — recommendation

For a microartist's first store, **Shopify with a headless Hydrogen front-end is overkill.** Suggested options in order of pragmatism:

1. **Shopify Basic + custom theme** — simplest, well-supported, scales. ~$39/mo. Use a quality theme (Dawn, Sense, or paid like Impulse) and customize, OR build a custom theme in Liquid.
2. **Shopify headless (Hydrogen / Next.js + Storefront API)** — if Jalen is building this, this gives full creative control and shares a codebase with the main site. Recommended if engineering effort is available.
3. **Snipcart or Shopify Buy SDK embedded into a Next.js store** — lightest, but limited inventory/fulfillment tooling.
4. **Big Cartel** — cheapest, weakest brand control. Pass.

**Default recommendation: Option 2 (Next.js + Shopify Storefront API)** since Jalen has the stack experience for it, and it lets the main site and store share design system, components, and deploy pipeline.

### 7.6 Fulfillment

For v1, recommend a print-on-demand integration (Printful, Printify, or similar) for apparel — no inventory risk. Physical music (vinyl/CDs) is small-batch and self-fulfilled. Add Shopify's shipping label automation.

---

## 8. Inspiration Library — What to Pull From Each

The provided references aren't equal in relevance. Treat them as a parts bin, not a template list. Specific extractions:

| Reference | What to take | What NOT to take |
|---|---|---|
| **yanaofficial.com** | Editorial restraint; large photography; serif/sans pairing | Don't fully blackout — MALI's register is warmer |
| **tiffdidwhat.com** | Photo-led intimacy; quiet motion; tight nav | (good fit overall — closest reference) |
| **aespa.com** | The principle of treating the site as an immersive experience | None of the K-pop maximalism, animated mascots, or color saturation — opposite register from MALI |
| **xo.store** | Drop-coded merch presentation; lookbook strip; minimal navigation | Don't go fully monochrome / luxury-aloof — keep MALI's site warmer |
| **store.billieeilish.com** | Character-led merchandising; product photography in styled environments | Don't replicate the brand-mascot density; MALI isn't a character, she's a person |
| **peggygou.com** | Typographic confidence; oversized wordmark; bold structural grid | The retro-futurist palette — wrong for MALI |
| **charlottedewitte.com** | Monochrome discipline; brutalist structure; restrained motion | The techno coldness — too sterile for MALI's warmth |
| **therealcocojones.com** | Warm photo-forward R&B presentation; press-friendly | None — closest peer-tier vibe; worth studying carefully |

**The single closest reference for overall feel:** Tiff Wat (tiffdidwhat.com) and Coco Jones (therealcocojones.com). The single closest reference for the merch store: xo.store.

---

## 9. Technical Requirements

### 9.1 Stack (recommendation)

- **Framework:** Next.js 15+ (App Router) — shared between main site and store
- **Hosting:** Vercel
- **CMS:** Sanity, Contentful, or Payload — for releases, videos, press, shows. Don't hardcode content — MALI or her team needs to update without a developer.
- **Store backend:** Shopify (Storefront API, headless)
- **Email capture:** Klaviyo (preferred for artist/merch crossover) or Mailchimp
- **SMS capture (v2):** Community.com or Klaviyo SMS
- **Analytics:** Plausible or Fathom (privacy-friendly) + Shopify analytics for store
- **Image pipeline:** Next/Image with Sanity's CDN or Cloudinary
- **Type:** self-hosted via Fontshare (free tier) or licensed via Adobe Fonts

### 9.2 Performance budget

- LCP < 2.0s on 4G mobile
- CLS < 0.05
- Lighthouse performance score ≥ 90 mobile, 95 desktop
- Hero image ≤ 200kb after optimization
- No blocking JS over 80kb on initial load

### 9.3 Accessibility

- WCAG 2.2 AA minimum
- All embedded audio/video has captions or transcript
- Lyrics double as text-track alternatives
- Keyboard nav for all interactive elements
- Color contrast verified for chosen palette
- `prefers-reduced-motion` honored — all parallax/fade behaviors disabled when requested

### 9.4 SEO

- Per-release pages with structured data (`MusicAlbum`, `MusicRecording` schema)
- Open Graph + Twitter card per page with release artwork
- Sitemap + robots.txt
- Canonical URLs configured

### 9.5 Integrations

- Spotify embed (oEmbed) for releases
- Apple Music link-outs
- YouTube `lite-youtube` for videos
- Linktree-equivalent landing baked into the site (`/listen` route) for paid social / TikTok bio link
- Optional: Songfinch-style "smartlink" generator for new releases (linkfire.com or similar)

---

## 10. Content Requirements (from MALI)

Before build, MALI/team needs to deliver:

- **Photography library** — 12–20 finished images in consistent grade (portraits + environments)
- **Bio copy** — short (60 words), medium (150 words), long (300 words)
- **Release metadata** — for *Last Year*, *Who Really Won?*, *Strange*: full tracklist, credits, lyrics, release dates, label
- **Music videos** — YouTube links + thumbnails
- **Logo/wordmark** — or approval to set wordmark in chosen display serif
- **Email/SMS list (existing)** — for import
- **Merch product assets** — flat + lifestyle photography per SKU, sizing chart, materials info

---

## 11. Phasing

### MVP (target: 4–6 weeks)

Main site:
- Home, Music (index + 3 release pages), About, Press, Contact, Shows (empty state)
- Email capture (Klaviyo)
- Full responsive
- CMS-driven for releases

Store:
- Defer to V1.5

### V1.5 (target: +2–3 weeks after MVP)

- Companion store launches with 3–6 SKUs
- First drop campaign integrated with email/SMS list
- Lookbook editorial on store home

### V2 (target: +3 months)

- Members area / fan login (if it makes sense — only if there's exclusive content to gate)
- Tour date integration with Bandsintown / Songkick
- Pre-save tool for next release
- Multi-language toggle (if international audience grows)

---

## 12. Success Metrics

- **Discovery → stream conversion rate** — % of homepage visitors who click out to a streaming platform (target: 35%+)
- **Email capture rate** — % of visitors who submit email (target: 4%+ overall, 8%+ on /shows empty state)
- **Store conversion rate** — visitors → purchasers (target: 1.5%+ at launch, scale toward 2.5%)
- **Press contact submissions** — qualitative; track inbound from /press
- **Bounce rate on home** — target < 50%
- **Average session depth** — target > 2.5 pages

---

## 13. Out of Scope (v1 — explicitly)

- Fan community / forum / Discord integration on-site
- Audio player that persists across page navigation (nice-to-have, not v1)
- WebGL / 3D / Three.js anything (wrong register)
- Multi-currency store (single USD storefront at launch)
- Wholesale / B2B merch
- Mobile app
- Spotify Canvas custom uploads (out of band — handled directly via Spotify for Artists)

---

## 14. Open Questions (need answers before build)

1. **Domain.** `malicantsing.com` available? Alternatives: `akilahmali.com`, `mali-music.com`. Confirm before any work.
2. **Wordmark decision.** Set in chosen display serif (free, fast), or commission a custom logo (slower, ~$1k–3k)? Recommend the former for v1.
3. **Photography.** Does she have a finished photo library, or does this need a shoot first? If a shoot is needed, that's a 2–3 week prerequisite blocker.
4. **Booking / management.** Is there a real booking contact, or solo-managed right now? Determines how /contact routes.
5. **Merch budget.** Print-on-demand (no inventory risk) vs small-batch screen-printed (better margins, requires upfront)?
6. **Vinyl/physical.** Is there interest/budget for a 7" or cassette pressing of *Who Really Won?* — it's a strong list-builder and merch hero, ~$1.5–3k for 100 units.
7. **Existing list.** Any current email/SMS list to import? From where?

---

## Appendix A — Copy voice samples (directional)

The site copy should sound like the artist, not the marketing department. A few sample lines to calibrate:

- Hero tagline (lyric-derived): *who really won?*
- Shows empty state: *no shows yet. you'll be the first to hear about it.*
- Email capture: *for the next one.*
- About lead: *mali lives in [city]. she writes songs about people she used to know.*
- Press contact: *for press, sync, or licensing → [email]*
- Store welcome: *small batch. when it's gone it's gone.*

No exclamation points anywhere on the site. No "✨" or emoji. No "hey friends!" No "music lover" anything.

---

**End of brief.**
