/* =========================================================================
   WHO REALLY WON? — THE SECURITY GRID (deck 03)
   The 7 monitor "feeds". We keep the GLB's own monitors (their real layout)
   and overlay one clickable, cover-cropped photo on each screen face — so the
   photo looks like it's on the monitor, and each is its own click target.
   Positions/sizes/rotations below were calibrated by raycasting the GLB's
   monitor faces (k-means over the hit points).

   Layout (the GLB's native arrangement):
          [1]
     [2][3]   [6]
     [4][5]   [7]
   ========================================================================= */

// Per-track deep links. The five EP tracks share the EP album id; "Strange"
// is its own single (separate album id).
const EP = "1833313976";
const sp = (id: string) => `https://open.spotify.com/track/${id}`;
const am = (slug: string, album: string, i: string) =>
  `https://music.apple.com/us/album/${slug}/${album}?i=${i}`;
const YOUTUBE = "https://www.youtube.com/watch?v=ZNVD8oNf35M";

export type Feed = {
  n: number; // 1-based display number
  title: string;
  /** optional multi-line title for the blast (e.g. song / "Music Video") */
  titleLines?: string[];
  /** small descriptor under the blast title (e.g. "SINGLE") */
  tag?: string;
  kind: "image" | "video";
  /** photo or video shown on the monitor + as the blast background */
  src: string;
  /** looping audio for the blast; null = use the video's own track */
  audio: string | null;
  accent: string;
  /** streaming links shown in the blast (icons) */
  spotify?: string;
  apple?: string;
  youtube?: string;
  /** monitor centre in world space (the screen sits here) */
  pos: [number, number, number];
  size: [number, number]; // legacy metadata (monitor size is now uniform — see SCREEN_SIZE)
  rotY: number; // yaw — how the monitor faces the room (varied per monitor for a hand-placed look)
};

/* Every CCTV monitor is rendered at this one uniform on-screen picture size
   (world units — the visible CRT screen, ~5:4). The camera zoom (focusFor)
   frames exactly this, and RoomModel scales the model so its screen matches it.
   Replaces the old per-feed `size`, now only metadata.

   At this size the monitor BODY footprint is ~0.280 wide × ~0.289 tall, so the
   positions below are spaced ~0.290 (cols) / ~0.289 (rows) — the casings touch
   without overlapping. The bottom row (4, 5) and the side-lower (7) sit FLUSH on
   the desk: the desk top is at worldY 0.866 and the body bottom is 0.169 below
   the screen centre, so their centres are at 0.866 + 0.169 = 1.035.

   Each monitor is yaw-rotated a little differently (rotY) for a hand-placed
   look — no pitch/roll, just horizontal rotation.

   Layout: the five middle monitors form a touching pyramid (1 straddles 2/3,
   with 4/5 beneath), and 6/7 are a touching stacked pair off to the right.
       [1]
     [2][3]      [6]
     [4][5]      [7]                                                          */
export const SCREEN_SIZE: [number, number] = [0.24, 0.204];

export const FEEDS: Feed[] = [
  {
    n: 1, title: "Last Year", kind: "image", src: "/images/100_0348.JPG",
    audio: "/wrw-assets/audio/last-year.m4a", accent: "#7cf0ff",
    spotify: sp("6kIg3mQRYjpel7qYwHaZMA"), apple: am("last-year", EP, "1833313978"),
    pos: [3.566, 1.613, -4.183], size: [0.33, 0.31], rotY: -1.39, // top, straddling 2/3
  },
  {
    n: 2, title: "My Bed", kind: "image", src: "/images/100_0312.JPG",
    audio: "/wrw-assets/audio/my-bed.m4a", accent: "#9b8cff",
    spotify: sp("0VkYr8VpokT0L2DExqtRbG"), apple: am("my-bed", EP, "1833314189"),
    pos: [3.55, 1.324, -4.335], size: [0.24, 0.23], rotY: -1.66, // left upper
  },
  {
    n: 3, title: "Gone Away", kind: "image", src: "/images/100_0324.JPG",
    audio: "/wrw-assets/audio/gone-away.m4a", accent: "#c8ff4a",
    spotify: sp("15gG3VoteXYpZaP6Ns9s5C"), apple: am("gone-away", EP, "1833314190"),
    pos: [3.564, 1.324, -4.03], size: [0.25, 0.27], rotY: -1.46, // right upper
  },
  {
    n: 4, title: "Been There Once", kind: "image", src: "/images/100_0335.JPG",
    audio: "/wrw-assets/audio/been-there-once.m4a", accent: "#ff9a3c",
    spotify: sp("6UjxD0WgUJaIA3AA1I2psf"), apple: am("been-there-once", EP, "1833314192"),
    pos: [3.55, 1.035, -4.335], size: [0.24, 0.26], rotY: -1.61, // left lower (flush on desk)
  },
  {
    n: 5, title: "Who Really Won?", kind: "image", src: "/images/100_0347.JPG",
    audio: "/wrw-assets/audio/who-really-won.m4a", accent: "#4dffa0",
    spotify: sp("23iYibyDKBPWAYKzkJiXw2"), apple: am("who-really-won", EP, "1833314194"),
    pos: [3.564, 1.035, -4.03], size: [0.255, 0.265], rotY: -1.42, // right lower (flush on desk)
  },
  {
    n: 6, title: "Who Really Won Music Video", titleLines: ["Who Really Won", "Music Video"],
    kind: "video", src: "/video/who-really-won.mp4",
    // play the song track via the unlocked <audio> (reliable) while the video runs muted
    audio: "/wrw-assets/audio/who-really-won.m4a", accent: "#ff2b2b", youtube: YOUTUBE,
    pos: [3.483, 1.324, -3.543], size: [0.22, 0.24], rotY: -1.92, // side pair, upper (angled)
  },
  {
    n: 7, title: "Strange", tag: "SINGLE", kind: "image", src: "/images/100_0309.JPG",
    audio: "/wrw-assets/audio/strange.m4a", accent: "#ff7cd5",
    spotify: sp("1jtebf1xPtxiwIlrlrbTi0"), apple: am("strange", "1857222138", "1857222139"),
    pos: [3.483, 1.035, -3.542], size: [0.24, 0.27], rotY: -1.7, // side pair, lower (flush on desk)
  },
];

/* Release pages that have a matching blast feed, so they can deep-link straight
   into it (e.g. /music/who-really-won?song=last-year). Mapped by title so the
   index stays correct even if FEEDS is reordered. */
const RELEASE_SLUG_TO_FEED_TITLE: Record<string, string> = {
  "last-year": "Last Year",
  strange: "Strange",
};

/** Feed index for a release/song slug, or null when there's no matching blast. */
export function feedIndexForReleaseSlug(slug: string): number | null {
  const title = RELEASE_SLUG_TO_FEED_TITLE[slug];
  if (!title) return null;
  const i = FEEDS.findIndex((f) => f.title === title);
  return i >= 0 ? i : null;
}
