/* =========================================================================
   WHO REALLY WON? — shared release data for the WebGL rollouts.
   Five songs, end to end, from the last night to the year after.
   ========================================================================= */

export type Side = "him" | "her";

export interface WrwTrack {
  n: number;
  title: string;
  runtime: string;
  /** served from /public/wrw-assets/audio */
  file: string;
  /** the dated chapter label */
  exhibit: string;
  /** the emotional core line, pulled from the lyric */
  lyric: string;
  /** a redacted/document fragment (oklama device) */
  redacted: string;
  /** who's "ahead" after this track in the running tally */
  side: Side;
  /** scene accent for the 3D verdict, hex */
  accent: string;
}

export const WRW_TRACKS: WrwTrack[] = [
  {
    n: 1,
    title: "Last Year",
    runtime: "3:09",
    file: "/wrw-assets/audio/last-year.m4a",
    exhibit: "DAY 001 — THE LAST NIGHT",
    lyric: "you told me you loved me last year — but i fear it didn't even last, dear.",
    redacted: "EXHIBIT A · not coming home to you · █████ sleeping the days away",
    side: "him",
    accent: "#7cf0ff",
  },
  {
    n: 2,
    title: "My Bed",
    runtime: "2:28",
    file: "/wrw-assets/audio/my-bed.m4a",
    exhibit: "DAY 046 — THE EMPTY SIDE",
    lyric: "now there's an empty place next to my bed.",
    redacted: "EXHIBIT B · the lies you spread █████ that i just can't defend",
    side: "him",
    accent: "#9b8cff",
  },
  {
    n: 3,
    title: "Gone Away",
    runtime: "2:50",
    file: "/wrw-assets/audio/gone-away.m4a",
    exhibit: "DAY 140 — LETTING GO",
    lyric: "my heart beated for ya — now it's gone away. your loss, not mine.",
    redacted: "EXHIBIT C · after that trip to ████ · your loss ███ not mine",
    side: "her",
    accent: "#c8ff4a",
  },
  {
    n: 4,
    title: "Been There Once",
    runtime: "2:59",
    file: "/wrw-assets/audio/been-there-once.m4a",
    exhibit: "DAY 243 — THE WARNING",
    lyric: "you won't last — maybe a couple months. 'cause i've been there once.",
    redacted: "EXHIBIT D · trust me i know █████ i've been there before",
    side: "her",
    accent: "#c8ff4a",
  },
  {
    n: 5,
    title: "Who Really Won?",
    runtime: "3:00",
    file: "/wrw-assets/audio/who-really-won.m4a",
    exhibit: "DAY 365 — ONE YEAR LATER",
    lyric: "wrote songs about you — it helped me move on. i'm glad we're done.",
    redacted: "EXHIBIT E · i'll be known some day █████ give me a few years",
    side: "her",
    accent: "#c8ff4a",
  },
];

export const WRW_META = {
  artist: "AKILAH MALI",
  title: "WHO REALLY WON?",
  format: "AN EXTENDED PLAY",
  catalog: "MALI-002",
  year: "2025",
  runtime: "14:26",
  cover: "/images/who-really-won.jpg",
  links: [
    { label: "SPOTIFY", href: "https://open.spotify.com/album/1erR9OC9qZj0mbYH7STB6X" },
    { label: "APPLE MUSIC", href: "https://music.apple.com/us/album/who-really-won-ep/1833313976" },
    { label: "TIDAL", href: "https://tidal.com/album/453842873" },
    { label: "FILM", href: "https://www.youtube.com/watch?v=ZNVD8oNf35M" },
  ],
} as const;

/** A handful of the digicam photo ids for the OS photo library. */
export const WRW_PHOTOS = [
  "100_0259", "100_0320", "100_0307", "100_0266", "100_0271", "100_0272",
  "100_0306", "100_0311", "100_0348", "100_0361", "100_0371", "100_0300",
  "100_0265", "100_0334", "100_0376", "100_0252",
];
export const wrwPhoto = (id: string) => `/wrw-assets/img/${id}.JPG`;
