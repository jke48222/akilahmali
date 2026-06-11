# The label-site detail playbook

What separates a homemade artist site from one built by a studio for a label.
Distilled from: oklama, donttaptheglass / chromakopia (Tyler), SOS / CTRL (SZA),
eusexua (FKA twigs), Utopia (Travis Scott), blonded (Frank Ocean), AWGE,
kanye2049, callmeifyougetlost, PinkPantheress, Olivia Rodrigo, Lucky Daye,
Coco Jones, Gorillaz, Faye Webster, Caroline Polachek, Mitski, billie's room,
Porter Robinson, Gesaffelstein, year0001, bladee + the awwwards music circuit.

The big lesson: **none of these win on big flashy design. They win on a hundred
tiny decisions that all agree with each other.** The art direction is one idea
(a world, a color, an object) and every detail — cursor, footer, error message,
favicon, console log — speaks in that idea's voice.

---

## 1. One world, fully committed

- **Tyler, the Creator** rebuilds the entire site per album. donttaptheglass is
  one room; chromakopia is one green-lit gate. No section exists that doesn't
  serve the record.
- **SZA's SOS site** was a ship's terminal; **kanye2049** is a password-locked
  OS; **billie's room** is literally one 3D room. The metaphor IS the nav.
- **AWGE** is a fake desktop OS. **Brent Faiyaz/ISO** uses a File/Edit/Special
  menu bar — software chrome as brand.
- *Mali translation:* the payphone, the drive, the WRW control room already do
  this. The detail pass is making the *main* site speak rose/cherry/noir with
  the same commitment.

## 2. Typography tells

- One brand face used **everywhere** (display, body, UI) + one mono for labels.
  Never three fonts.
- Mono caps with wide tracking (0.18–0.32em) for every label, button, eyebrow,
  legal line — this is the single strongest "label site" signal (Lucky Daye,
  Olivia Rodrigo's typewriter legal text, blonded).
- Display type set tight (line-height 0.82–0.95, tracking −0.02em) and HUGE
  (Coco Jones's viewport-width SUBSCRIBE).
- Lowercase as a voice decision, applied without exception.
- `text-wrap: balance` on headings; no widowed words.

## 3. Micro-interactions (the awwwards layer)

- **Marquee/ticker strips** announcing the release; slow, even, pause on hover
  (donttaptheglass, dozens of awwwards winners).
- **Rotating circular-text badges** ("out now ·") — the sticker detail
  (PinkPantheress pins stickers over a scene).
- **Link underlines that draw in from the left and exit to the right**
  (600ms, custom bezier) — never a CSS `text-decoration` toggle.
- **Magnetic buttons**, image zoom + desaturate-to-saturate on hover,
  custom cursors that react to targets (scale on hover, shrink on press).
- Awwwards-tier stacks: GSAP + Lenis smooth scroll + view transitions
  (Orage case study), WebGL/Three.js where there's budget. Sound design on
  interactions (Igloo Inc) for the very top tier.
- Everything honors `prefers-reduced-motion`.

## 4. The footer is where labels show their hand

- **Newsletter strip**: underlined email input + boxed JOIN + consent
  microcopy — "By connecting, you agree to receive news and updates from X"
  (Lucky Daye, every UMG/Warner footer). Homemade sites skip the consent line;
  labels never do.
- Icon-only social row, far right, 5–7 platforms, quiet gray → white on hover.
- Legal row in tiny mono caps: © year + rights holder, privacy, terms, cookie
  choices. Olivia Rodrigo's even carries a screen-reader phone line.
- **Personality stamps**: blonded's live timestamp ("6.10.26 00:00 PM"),
  hometown lines, "est." dates. The footer is a place, not a sitemap.

## 5. Copy voice

- Terse, confident, zero marketing language: "store →", "tour", "listen".
- Poetic where it counts: blonded's mailing-list prompt is "What's moving
  faster, the tea or the cup?" — the form itself is in-world.
- Error messages and empty states stay in voice (lowercase, human).

## 6. Production polish (invisible until it's missing)

- Real favicon set + themed `theme-color` + manifest; OG images per page.
- Schema.org MusicGroup/MusicAlbum JSON-LD; canonical URLs.
- `::selection` in brand color; themed scrollbar; no iOS tap-flash;
  `scroll-padding-top` so anchors clear the fixed nav.
- Custom 404 in voice. Console-log signature (the insider handshake).
- Fulfillment honesty in shops ("allow 2–6 weeks") reads as craft, not delay.

## 7. Fan-service mechanics (the viral layer)

- **callmeifyougetlost**: ID-card generator — make the fan the artwork.
- **kanye2049**: passwords hidden in album titles; **Gorillaz**: explorable
  Kong Studios. Give superfans one secret. (Mali already has: the payphone
  number, the drive.)

---

## Applied in this pass

- [x] Release ticker strip under the hero (slow marquee, pause on hover, links to /music)
- [x] Rotating circular "out now" badge on the hero (SVG textPath + Magnetic pull)
- [x] Newsletter consent microcopy under the email capture
- [x] Footer: icon-only social row + live Atlanta clock (blonded timestamp detail)
- [x] Themed scrollbar, `scroll-padding-top`, no iOS tap-flash, noir overscroll
- [x] `text-wrap: balance` on headings
- [x] Console signature easter egg

## Backlog (next passes)

- [ ] Page transitions (View Transitions API) — cross-fade between routes
- [ ] Split-line mask reveals on display headings (chars/lines rise from a clip)
- [ ] Lenis-style inertial scroll on the main site (keep native in the worlds)
- [ ] A fan generator à la CMIYGL (e.g. "leave a voicemail" card from /payphone audio)
- [ ] Scroll-velocity-reactive ticker speed
- [ ] In-voice 404 (a disconnected-number page — ties to the payphone)
- [ ] Hover sound design (one soft tape-click), behind a mute toggle
