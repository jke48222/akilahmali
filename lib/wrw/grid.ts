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

const SPOTIFY = "https://open.spotify.com/album/1erR9OC9qZj0mbYH7STB6X";
const APPLE = "https://music.apple.com/us/album/who-really-won-ep/1833313976";
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
  /** clickable screen plane in world space (on the GLB monitor's glass) */
  pos: [number, number, number];
  size: [number, number]; // photo size: width (along z), height (along y)
  rotY: number;
};

export const FEEDS: Feed[] = [
  {
    n: 1, title: "Last Year", kind: "image", src: "/images/100_0348.JPG",
    audio: "/wrw-assets/audio/last-year.m4a", accent: "#7cf0ff", spotify: SPOTIFY, apple: APPLE,
    pos: [3.58, 1.73, -4.135], size: [0.33, 0.31], rotY: -1.483, // top centre
  },
  {
    n: 2, title: "My Bed", kind: "image", src: "/images/100_0312.JPG",
    audio: "/wrw-assets/audio/my-bed.m4a", accent: "#9b8cff", spotify: SPOTIFY, apple: APPLE,
    pos: [3.55, 1.4, -4.366], size: [0.24, 0.23], rotY: -1.527, // left upper
  },
  {
    n: 3, title: "Gone Away", kind: "image", src: "/images/100_0324.JPG",
    audio: "/wrw-assets/audio/gone-away.m4a", accent: "#c8ff4a", spotify: SPOTIFY, apple: APPLE,
    pos: [3.569, 1.397, -4.009], size: [0.25, 0.27], rotY: -1.558, // centre mid
  },
  {
    n: 4, title: "Been There Once", kind: "image", src: "/images/100_0335.JPG",
    audio: "/wrw-assets/audio/been-there-once.m4a", accent: "#ff9a3c", spotify: SPOTIFY, apple: APPLE,
    pos: [3.55, 1.03, -4.366], size: [0.24, 0.26], rotY: -1.527, // left lower
  },
  {
    n: 5, title: "Who Really Won?", kind: "image", src: "/images/100_0347.JPG",
    audio: "/wrw-assets/audio/who-really-won.m4a", accent: "#4dffa0", spotify: SPOTIFY, apple: APPLE,
    pos: [3.563, 1.03, -4.007], size: [0.255, 0.265], rotY: -1.553, // centre lower
  },
  {
    n: 6, title: "Who Really Won Music Video", titleLines: ["Who Really Won", "Music Video"],
    kind: "video", src: "/video/who-really-won.mp4",
    // play the song track via the unlocked <audio> (reliable) while the video runs muted
    audio: "/wrw-assets/audio/who-really-won.m4a", accent: "#ff2b2b", youtube: YOUTUBE,
    pos: [3.483, 1.417, -3.543], size: [0.22, 0.24], rotY: -1.807, // right upper (angled)
  },
  {
    n: 7, title: "Strange", tag: "SINGLE", kind: "image", src: "/images/100_0309.JPG",
    audio: "/wrw-assets/audio/strange.m4a", accent: "#ff7cd5", spotify: SPOTIFY, apple: APPLE,
    pos: [3.483, 1.06, -3.542], size: [0.24, 0.27], rotY: -1.802, // right lower (angled)
  },
];
