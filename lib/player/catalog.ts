/* =========================================================================
   Persistent player catalog.

   The tracks the global mini-player can stream — every entry has a real,
   same-origin audio file (Web Audio's analyser can't read cross-origin media
   without CORS, and these live under /public). `accent` is the per-song colour
   that skins the reactive circle; `mode` selects its visual style so each track
   feels distinct. Titles mirror the release tracklists so ReleaseSpread can map
   a rendered <Track> to its playable source by title.
   ========================================================================= */

export type VisualMode = "bars" | "pulse";

export type PlayerTrack = {
  id: string;
  title: string;
  artist: string;
  src: string;
  accent: string;
  mode: VisualMode;
};

export const CATALOG: PlayerTrack[] = [
  { id: "last-year",       title: "Last Year",       artist: "Akilah Mali", src: "/wrw-assets/audio/last-year.m4a",       accent: "#7cf0ff", mode: "bars"  },
  { id: "my-bed",          title: "My Bed",          artist: "Akilah Mali", src: "/wrw-assets/audio/my-bed.m4a",          accent: "#9b8cff", mode: "pulse" },
  { id: "gone-away",       title: "Gone Away",       artist: "Akilah Mali", src: "/wrw-assets/audio/gone-away.m4a",       accent: "#c8ff4a", mode: "bars"  },
  { id: "been-there-once", title: "Been There Once", artist: "Akilah Mali", src: "/wrw-assets/audio/been-there-once.m4a", accent: "#ff9a3c", mode: "pulse" },
  { id: "who-really-won",  title: "Who Really Won?", artist: "Akilah Mali", src: "/wrw-assets/audio/who-really-won.m4a",  accent: "#4dffa0", mode: "bars"  },
  { id: "strange",         title: "Strange",         artist: "Akilah Mali", src: "/wrw-assets/audio/strange.m4a",         accent: "#ff7cd5", mode: "pulse" },
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
