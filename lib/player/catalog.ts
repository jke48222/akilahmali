/* =========================================================================
   Persistent player catalog.

   IMPORTANT — streams must count. The on-site orb plays a 30-second PREVIEW
   only (same-origin so the Web Audio analyser can drive the visualizer); it
   never serves the full song, so listening here can't replace a real stream.
   Every track carries its Spotify + Apple Music links so the full listen
   happens on those platforms, where it counts toward her streaming numbers.

   `accent` / `accent2` are the two-tone colours that skin the reactive orb;
   `mode` picks its visual personality (see PersistentPlayer). Titles mirror the
   release tracklists so ReleaseSpread can map a rendered <Track> by title.
   ========================================================================= */

export type VisualMode = "aurora" | "wave" | "bloom" | "orbit" | "pulse";

export type PlayerTrack = {
  id: string;
  title: string;
  artist: string;
  /** 30s preview clip (teaser only — never the full song). */
  src: string;
  accent: string;
  accent2: string;
  mode: VisualMode;
  /** Full-song links — where a real stream is registered. */
  spotify: string;
  apple: string;
};

const sp = (id: string) => `https://open.spotify.com/track/${id}`;
const EP = "1833313976";
const am = (slug: string, album: string, i: string) =>
  `https://music.apple.com/us/album/${slug}/${album}?i=${i}`;
const preview = (f: string) => `/wrw-assets/audio/previews/${f}.m4a`;

export const CATALOG: PlayerTrack[] = [
  {
    id: "last-year", title: "Last Year", artist: "Akilah Mali", mode: "wave",
    src: preview("last-year"), accent: "#6CC6FF", accent2: "#A99CFF",
    spotify: sp("6kIg3mQRYjpel7qYwHaZMA"), apple: am("last-year", EP, "1833313978"),
  },
  {
    id: "my-bed", title: "My Bed", artist: "Akilah Mali", mode: "aurora",
    src: preview("my-bed"), accent: "#B49BFF", accent2: "#FF9BE0",
    spotify: sp("0VkYr8VpokT0L2DExqtRbG"), apple: am("my-bed", EP, "1833314189"),
  },
  {
    id: "gone-away", title: "Gone Away", artist: "Akilah Mali", mode: "bloom",
    src: preview("gone-away"), accent: "#34E0C4", accent2: "#8FF0C2",
    spotify: sp("15gG3VoteXYpZaP6Ns9s5C"), apple: am("gone-away", EP, "1833314190"),
  },
  {
    id: "been-there-once", title: "Been There Once", artist: "Akilah Mali", mode: "orbit",
    src: preview("been-there-once"), accent: "#FF8E6E", accent2: "#FFC979",
    spotify: sp("6UjxD0WgUJaIA3AA1I2psf"), apple: am("been-there-once", EP, "1833314192"),
  },
  {
    id: "who-really-won", title: "Who Really Won?", artist: "Akilah Mali", mode: "pulse",
    src: preview("who-really-won"), accent: "#57E2A5", accent2: "#6BD6FF",
    spotify: sp("23iYibyDKBPWAYKzkJiXw2"), apple: am("who-really-won", EP, "1833314194"),
  },
  {
    id: "strange", title: "Strange", artist: "Akilah Mali", mode: "aurora",
    src: preview("strange"), accent: "#FF8FCD", accent2: "#C79BFF",
    spotify: sp("1jtebf1xPtxiwIlrlrbTi0"), apple: am("strange", "1857222138", "1857222139"),
  },
];

const normalize = (s: string) =>
  s.trim().toLowerCase().replace(/[?!.,'"]/g, "").replace(/\s+/g, " ");

const BY_TITLE = new Map(CATALOG.map((t) => [normalize(t.title), t]));
const BY_ID = new Map(CATALOG.map((t) => [t.id, t]));

export function trackByTitle(title: string): PlayerTrack | null {
  return BY_TITLE.get(normalize(title)) ?? null;
}

export function trackById(id: string): PlayerTrack | null {
  return BY_ID.get(id) ?? null;
}
