/**
 * Static fallback content extracted from /docs/designs/*.html.
 * Used when Sanity isn't configured (or the dataset is empty). The site is
 * designed so live Sanity data overrides each block in a single line.
 */

export type Vibe = "strange" | "who" | "lastyear";

export type StaticTrack = {
  title: string;
  duration: string;
  trackNumber: number;
  /** Plain-text lyrics; "" when unwritten (placeholder track). */
  lyrics: string;
  placeholder?: boolean;
};

export type StaticRelease = {
  _id: string;
  title: string;
  slug: string;
  releaseDate: string;          // ISO yyyy-mm-dd
  releaseDateDisplay: string;   // human-friendly
  type: "single" | "ep" | "album";
  formatLabel: string;          // "single" / "ep · 5 tracks" / etc.
  vibe: Vibe;
  blurb: string;
  runtime: string;
  artworkBy: string;
  catalog?: string;
  upc?: string;
  label?: string;
  recordedAt?: string;
  subtitle?: string;
  tracks: StaticTrack[];
  credits: Array<[string, string]>;
  streamingLinks?: {
    spotify?: string;
    appleMusic?: string;
    youtubeMusic?: string;
    tidal?: string;
    smartlink?: string;
  };
};

/* -------------------------------------------------------------------------
   Track lyric bodies — extracted verbatim from /docs/designs.
   ------------------------------------------------------------------------- */
const LYRICS_STRANGE = `i walked back in, you'd painted the walls
different color, different girl, same call
i don't know this room and i don't know you
strange how the keys still fit the lock i grew up to

strange, strange, strange —
i was the same, you were the change`;

const LYRICS_WHO_REALLY_WON = `who really won when we both walked away
standing in the dark of the same hallway
you took the keys, i took the blame
neither of us has a place to stay

[verse 2 — placeholder]
counted the years like change in a jar
counted the silences after the car
who knew we'd keep score this far —

[chorus — placeholder]
who really won —
you in the morning, me in the song
who really won —
both of us proved each other wrong`;

const LYRICS_GONE_AWAY = `you've been gone away longer than you stayed
[verse continues]
i fold up your name like a letter unread
hung your absence over the bed
slept in it most nights since you said

gone away, gone away
i could have asked you to stay
i didn't, i didn't, i didn't —
you went anyway`;

const LYRICS_BEEN_THERE_ONCE = `i've been there once
i don't need to go again
[verse continues]
the floorboards remember me
the floorboards are my friend

been there once, been there once —
the door, the dog, the dusk
been there once, can't unknow it
been there once, still know it`;

const LYRICS_LAST_YEAR = `last year i was someone you knew
last year i'd answer the phone
now the year just keeps moving
and i don't
and i don't

i'm a name in a photograph
sitting on a shelf you don't pass
last year, last year —
last year is where i was last`;

/* -------------------------------------------------------------------------
   Releases — ordered newest first to match the music index zigzag.
   ------------------------------------------------------------------------- */
export const STATIC_RELEASES: StaticRelease[] = [
  {
    _id: "static-who-really-won",
    title: "Who Really Won?",
    slug: "who-really-won",
    releaseDate: "2025-07-18",
    releaseDateDisplay: "18 july 2025",
    type: "ep",
    formatLabel: "ep · 5 tracks",
    vibe: "who",
    subtitle: "an extended play",
    blurb:
      "five tracks on knowing better and doing it again anyway. written between january and may, recorded mostly at home, finished in a borrowed room with one good microphone.",
    runtime: "16:54",
    artworkBy: "noor a. for malicantsing",
    catalog: "MCS-002",
    upc: "0 197 8842 0119 7",
    label: "malicantsing music · self-released",
    recordedAt: "home + the long room, brooklyn",
    tracks: [
      { trackNumber: 1, title: "Who Really Won?", duration: "2:51", lyrics: LYRICS_WHO_REALLY_WON },
      { trackNumber: 2, title: "Gone Away", duration: "3:12", lyrics: LYRICS_GONE_AWAY },
      { trackNumber: 3, title: "Been There Once", duration: "3:38", lyrics: LYRICS_BEEN_THERE_ONCE },
      { trackNumber: 4, title: "[track 4 — placeholder]", duration: "3:15", lyrics: "", placeholder: true },
      { trackNumber: 5, title: "[track 5 — placeholder]", duration: "2:58", lyrics: "", placeholder: true },
    ],
    credits: [
      ["written by", "akilah mali"],
      ["produced by", "mali · j. okafor · ren k."],
      ["mixed by", "lior weiss"],
      ["mastered by", "mike kalajian"],
      ["artwork", "noor a."],
      ["publishing", "malicantsing music · ascap"],
    ],
  },
  {
    _id: "static-strange",
    title: "Strange",
    slug: "strange",
    releaseDate: "2025-03-01",
    releaseDateDisplay: "march · 2025",
    type: "single",
    formatLabel: "single",
    vibe: "strange",
    blurb:
      "written about the room you walk back into and don’t recognize. mixed at home, then again at midnight.",
    runtime: "3:24",
    artworkBy: "mali · self",
    catalog: "MCS-001b",
    label: "malicantsing music · self-released",
    tracks: [
      { trackNumber: 1, title: "Strange", duration: "3:24", lyrics: LYRICS_STRANGE },
    ],
    credits: [
      ["written by", "akilah mali"],
      ["produced by", "mali · j. okafor"],
      ["mixed by", "lior weiss"],
      ["mastered by", "mike kalajian"],
      ["artwork", "mali (self)"],
      ["publishing", "malicantsing music · ascap"],
    ],
  },
  {
    _id: "static-last-year",
    title: "Last Year",
    slug: "last-year",
    releaseDate: "2025-02-01",
    releaseDateDisplay: "february · 2025",
    type: "single",
    formatLabel: "single",
    vibe: "lastyear",
    blurb:
      "the first one out. written in a december that wouldn’t end. self-released as a way of saying the year was over.",
    runtime: "3:07",
    artworkBy: "mali · self",
    catalog: "MCS-001a",
    label: "malicantsing music · self-released",
    tracks: [
      { trackNumber: 1, title: "Last Year", duration: "3:07", lyrics: LYRICS_LAST_YEAR },
    ],
    credits: [
      ["written by", "akilah mali"],
      ["produced by", "mali"],
      ["mixed by", "akilah mali"],
      ["mastered by", "mike kalajian"],
      ["artwork", "mali (self)"],
      ["publishing", "malicantsing music · ascap"],
    ],
  },
];

export const STATIC_LATEST = STATIC_RELEASES[0];

/* -------------------------------------------------------------------------
   Videos
   ------------------------------------------------------------------------- */
export type StaticVideo = {
  _id: string;
  title: string;
  youtubeId: string;
  date: string;
  dateDisplay: string;
  type: "musicVideo" | "visualizer" | "bts";
  kindLabel: string;
  runtime: string;
  note: string;
  release: { title: string; slug: string };
};

// YouTube IDs are placeholders here — real IDs come from Sanity.
export const STATIC_VIDEOS: StaticVideo[] = [
  {
    _id: "static-video-who",
    title: "Who Really Won?",
    youtubeId: "dQw4w9WgXcQ",
    date: "2025-07-20",
    dateDisplay: "july 2025",
    type: "musicVideo",
    kindLabel: "official video",
    runtime: "04:21",
    note: "shot on 16mm · brooklyn",
    release: { title: "Who Really Won?", slug: "who-really-won" },
  },
  {
    _id: "static-video-strange",
    title: "Strange",
    youtubeId: "9bZkp7q19f0",
    date: "2025-03-05",
    dateDisplay: "march 2025",
    type: "visualizer",
    kindLabel: "visualizer",
    runtime: "03:24",
    note: "one take · long window",
    release: { title: "Strange", slug: "strange" },
  },
  {
    _id: "static-video-last-year",
    title: "Last Year",
    youtubeId: "3JZ_D3ELwOQ",
    date: "2025-02-10",
    dateDisplay: "february 2025",
    type: "visualizer",
    kindLabel: "lyric film",
    runtime: "03:07",
    note: "handwritten · super-8 transfer",
    release: { title: "Last Year", slug: "last-year" },
  },
  {
    _id: "static-video-been-there",
    title: "Been There Once",
    youtubeId: "kJQP7kiw5Fk",
    date: "2025-08-15",
    dateDisplay: "august 2025",
    type: "bts",
    kindLabel: "live · the long room",
    runtime: "03:51",
    note: "one mic · one chair · one take",
    release: { title: "Who Really Won?", slug: "who-really-won" },
  },
];

/* -------------------------------------------------------------------------
   Helpers
   ------------------------------------------------------------------------- */
export function releaseTypeLabel(
  r: { type: "single" | "ep" | "album"; trackCount?: number },
): string {
  if (r.type === "ep") {
    return r.trackCount ? `ep · ${r.trackCount} tracks` : "ep";
  }
  if (r.type === "album") {
    return r.trackCount ? `album · ${r.trackCount} tracks` : "album";
  }
  return "single";
}

export function releaseYear(iso: string): string {
  return iso.slice(0, 4);
}

const LONG_DATE = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

const MONTH_YEAR = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

export function formatReleaseDate(iso: string, mode: "long" | "monthYear" = "long"): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const fmt = mode === "long" ? LONG_DATE : MONTH_YEAR;
  return fmt.format(d).toLowerCase();
}

/** Find the static release adjacent to a given date (for prev/next nav fallback). */
export function staticAdjacent(currentDate: string) {
  const sorted = [...STATIC_RELEASES].sort((a, b) =>
    a.releaseDate.localeCompare(b.releaseDate),
  );
  const idx = sorted.findIndex((r) => r.releaseDate === currentDate);
  return {
    prev: idx > 0 ? sorted[idx - 1] : null,
    next: idx >= 0 && idx < sorted.length - 1 ? sorted[idx + 1] : null,
  };
}

export function vibeFromSlug(slug: string): Vibe {
  if (slug === "who-really-won") return "who";
  if (slug === "last-year") return "lastyear";
  return "strange";
}

/* =========================================================================
   Editorial page fallbacks (about / press / contact / shows)
   Extracted verbatim from /docs/designs/*.html
   ========================================================================= */

export const STATIC_BIO_PARAGRAPHS: string[] = [
  "mali is a singer and songwriter from [city]. she writes about people she used to know, places she used to live, and the difference between what happened and what she thought happened.",
  "her first releases — last year, who really won?, and strange — came out in 2025. she records mostly at night.",
  "malicantsing is the handle. the joke is on the people who took it seriously.",
];

export const STATIC_PULL_QUOTE = {
  line1: "i've been there once.",
  line2: "i don't need to go again.",
  attribution: "been there once · who really won?, 2025",
};

export type GalleryFrame = {
  kind: "photo" | "field";
  label: string;
  caption: string;
  /** For "photo" kind: a URL. For "field" kind: a CSS class on globals.css. */
  src?: string;
  fieldClass?: "ph-studio" | "ph-room" | "ph-mirror";
  pos?: string;
};

export const STATIC_GALLERY: GalleryFrame[] = [
  { kind: "field", fieldClass: "ph-studio", label: "still · strange", caption: "still · strange · 2025 — placeholder" },
  { kind: "field", fieldClass: "ph-room", label: "set · who really won?", caption: "set · who really won? — placeholder" },
  { kind: "field", fieldClass: "ph-mirror", label: "porch · baltimore", caption: "porch · baltimore, 2024 — placeholder" },
  { kind: "field", fieldClass: "ph-studio", label: "studio · brooklyn", caption: "studio · brooklyn, 2025 — placeholder" },
  { kind: "field", fieldClass: "ph-room", label: "the long room", caption: "the long room — placeholder" },
  { kind: "field", fieldClass: "ph-mirror", label: "self · mirror", caption: "self · mirror — placeholder" },
];

export type StaticPressAsset = {
  name: string;
  description: string;
  type: string;     // "zip" | "pdf" | "svg"
  size: string;
};

export const STATIC_PRESS_KIT: StaticPressAsset[] = [
  { name: "press photos", description: "six hi-res images, 300dpi", type: "zip", size: "24 mb" },
  { name: "one-sheet bio", description: "short + medium + long bio · printable", type: "pdf", size: "1 page" },
  { name: "wordmark — black", description: "set in instrument serif · on transparent", type: "svg", size: "6 kb" },
  { name: "wordmark — white", description: "set in instrument serif · on transparent", type: "svg", size: "6 kb" },
  { name: "wordmark — print", description: "vector · cmyk · for print use", type: "pdf", size: "180 kb" },
];

export const STATIC_CONTACT_EMAIL = "realmalimusic@gmail.com";

export type ContactBucket = {
  label: string;
  sub: string;
  /** Resolved email, or null when the role is unfilled. */
  email: string | null;
  /** Placeholder copy when no email exists. */
  tbd?: string;
  /** Fallback email shown when the bucket is tbd. */
  fallback?: string;
};

export const STATIC_BUCKETS: ContactBucket[] = [
  {
    label: "general",
    sub: "fan mail · everything else",
    email: STATIC_CONTACT_EMAIL,
  },
  {
    label: "booking",
    sub: "shows, festivals, support slots",
    email: null,
    tbd: "not yet represented",
    fallback: STATIC_CONTACT_EMAIL,
  },
  {
    label: "sync / licensing",
    sub: "film, tv, ad placement",
    email: null,
    tbd: "roles tbd",
    fallback: STATIC_CONTACT_EMAIL,
  },
  {
    label: "press",
    sub: "features, interviews, reviews",
    email: STATIC_CONTACT_EMAIL,
  },
];

export const STATIC_SOCIAL_LINKS = {
  instagram: "https://instagram.com/malicantsing",
  tiktok: "https://tiktok.com/@malicantsing",
  youtube: "https://youtube.com/@malicantsing",
  twitter: "",
};

