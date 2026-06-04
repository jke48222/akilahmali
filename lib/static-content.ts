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
  /** Per-track streaming links. */
  spotify?: string;
  appleMusic?: string;
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
  /** Local cover artwork under /public, used when no Sanity image exists. */
  coverImage?: string;
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

/* Shared links — artist-level streaming + the linktree "everywhere" smartlink. */
const SPOTIFY_ARTIST = "https://open.spotify.com/artist/13CrflPMkTb5mmizdGYL2i";
const APPLE_ARTIST = "https://music.apple.com/us/artist/mali/1815283080";
const YTM_CHANNEL = "https://music.youtube.com/channel/UCQVqXv4_mcRLIE0Wy1WUSHw";
const SMARTLINK = "https://linktr.ee/akilahmali";

/* -------------------------------------------------------------------------
   Track lyric bodies — extracted verbatim from /docs/designs.
   ------------------------------------------------------------------------- */
const LYRICS_STRANGE = `Night lights, I always wondered how they stayed, so bright
Siren sounds, tend to fade from the then and now
Hidden cage, often i let my thoughts roam with no space

Is it ever gonna change,
Seems to stay the same
I always found it strange

You try to tear me down, look where im at i did it on my own, you were my setback
Strangers once were friends
Rules were made to bend
Favors build to lend, that were never returned back

Da da da da da
Ah ah
Da da da da

No one cares, til you write a song about being sad
Its my fault, i tried to hold on to what we had

Is it ever gonna change,
Seems to always stay the same
I always found it strange

You try to tear me down, look where im at i did it on my own, you were my setback
Strangers once were friends
Rules were made to bend
Favors build to lend, that were never returned back

Da da da
Ah ah
Da da da da

Its all been so strange in the past year,
Sleepless nights, my heads finally clear

Is it ever gonna change,
Seems to stay the same
I always found it strange`;

const LYRICS_WHO_REALLY_WON = `Wrote songs about you
It helped me move on
I'm not obsessed with you
Bring your ego down
I should've down you dirty
Would've made me feel better
I should've been meaner
Instead I let you off too easy

Who really won?
Who really won?
Who really won?
Who really won?
Who really won?
Who really won?
Who really won?
Who really won?

Seen all versions of you
The good and the bad and the ugly
Had to keep pushing through
Even while I finally broke free
Could've ended so happy
Could've been you and me
I will find someone new
I let you off too easy

Who really won?
Who really won?
Who really won?
Who really won?
Who really won?
Who really won?
Who really won?
Who really won?

I'll be known some day
Give me a few years
I don't care what they say
After all of these tears
I'll be known some day
Give me a few years
I don't care what they say
After all of these tears
I'll be known some day
Give me a few years
I don't care what they say
After all of these tears
And I wish you well
We thought it was forever
Wish we were never together
Just fucking go to-

Who really won?
Who really won?
Who really won?
Who really won?
Who really won?
Who really won?
Who really won?
Who really won?
I'm glad we're done
I'm glad we're done
I'm glad we're done
I'm glad we're done
Who really won?
Who really won?
Who really won?
Who really won?`;

const LYRICS_GONE_AWAY = `Stay
Won't you just stay

Didn't wanna do it to ya
You know you can't decide
Didn't wanna do it to ya
You were never on my side
You never trusted me
Or when I'm with my friends
You never trusted me
Baby I had nothing to hide
When I'm with you
I felt so trapped inside
When I'm without you
Baby my life feels so sublime

Our hearts were intertwined
Now my heart's on the line

Stay
Won't you just stay
My heart beated for ya
Now its gone away

Broke up on the phone
I'm doing fine all on my own
So far apart we've grown
You can't handle being alone
Your family hated me
After that trip to PCB
You twist the story
Crave anger as your main trait
We had our days
Some bad some good
My next person will do things you never could

Our hearts were intertwined
Your loss bitch, not mine

Stay
Won't you just stay
My heart beated for ya
Now its gone away

Stay
Won't you just stay
My heart beated for ya
Now its gone away
Now my heart's on the line`;

const LYRICS_BEEN_THERE_ONCE = `Da-da-da-da-da
Da-da-da-da
Da-da-da-da-da
Da-da-da

Oh he'll tell you he loves you
But I know its a lie
At first he'll try to make things right
Say you're the love of his life
He'll try to control you
Let's hope that I'm fly
Every time that you guys argue
He will paint you as the bad guy
Trust me I know, trust me I know
I've been there before
Trust me I know, trust me I know
Oh I've been there before

You won't last
Maybe a couple months
I know that
Because I've been there once

Y'know he's gonna listen to this and he's gonna try so hard to prove me wrong
But when you guys are done this will all make sense

Oh he'll make me seem crazy
It's your choice on who to believe
I'll wait til you guys are alone
Just make sure you clear out that phone

You won't last
Maybe a couple months
I know that
Because I've been there once

Trust me I know, trust me I know
I've been there before
Trust me I know, trust me I know
I've been there before

And I'm saying this
Not to be a bitch
But I'm warning you
He's not who he says he is

And for some reason I always wondered why he's gotten broken up with in every single relationship
Now I know why

He claims abandonment issues
But the real issue is him
Honey the longer you stay
The darker your light will be dimmed

You won't last
I'm saying that
As a fair warning
You'll be the one crying

Trust me I know, trust me I know
I've been there before
This is my message to ya`;

const LYRICS_MY_BED = `No bitter words, no need to blame
I'm just not falling for your little game
There's no more spark, there's no more flame
I know you will always will remember my name

All the things we said
Our story came to an end
When you were laying down in my bed
After the lies you spread
That I just can't defend
Now there's an empty place next to my bed

I took the fall and wore the shame
So don't go around and just slander my name
The pain you brought don't just come for fame

All the things we said
Our story came to an end
When you were laying down in my bed
After the lies you spread
That I just can't defend
Now there's an empty place next to my bed

Oh the fire you started inside
I feel as if I cannot hide
Running circles inside my mind
Oh this time I won't just let it slide

Your lips would lie
I won't confide in you
Now that I'm gone
I'm not someone you never knew

All the things we said
Oh it's all come to an end
To an end
Now there's an empty space next to my bed`;

const LYRICS_LAST_YEAR = `Not coming home to you
They say its gonna be okay
Even though I sleep my days away
Oh just tell me its gonna be okay
Tell me its okay

You told me you loved me last year
But I fear that it didn't even last dear
I know you called me crazy
You know you cant deny
I know you gave up on me
I hope you're satisfied

You told me you loved me last year
But I fear that we didn't even last dear
I was stuck in a daze
Though I'd be your bride
The clouds are shades of gray
Now I just wanna cry
I hope you hear this and name all the things you miss about me
Do you remember all the things we used to do? To do

You told me you loved me last year
But I fear that we're never getting back dear
I know you've called me crazy
You know you can't deny
I know you gave up on me
I hope you're satisfied

I'm not running, running, running back to you
Not coming, coming, coming home to you
Oh you had me, you lost me, and now we're done
Can I still call you baby even though we're done
Oh I'm running, running, running back to you
I'm coming, coming, coming home to you
But I fear that it didn't even last dear`;

/* -------------------------------------------------------------------------
   Releases — ordered newest first to match the music index zigzag.
   ------------------------------------------------------------------------- */
/* Per-track streaming links. */
const SP = (id: string) => `https://open.spotify.com/track/${id}`;
const AM = (slug: string, album: string, i: string) =>
  `https://music.apple.com/us/album/${slug}/${album}?i=${i}`;

const TRK = {
  strange: { spotify: SP("1jtebf1xPtxiwIlrlrbTi0"), appleMusic: AM("strange", "1857222138", "1857222139") },
  lastYear: { spotify: SP("6kIg3mQRYjpel7qYwHaZMA"), appleMusic: AM("last-year", "1833313976", "1833313978") },
  myBed: { spotify: SP("0VkYr8VpokT0L2DExqtRbG"), appleMusic: AM("my-bed", "1833313976", "1833314189") },
  goneAway: { spotify: SP("15gG3VoteXYpZaP6Ns9s5C"), appleMusic: AM("gone-away", "1833313976", "1833314190") },
  beenThereOnce: { spotify: SP("6UjxD0WgUJaIA3AA1I2psf"), appleMusic: AM("been-there-once", "1833313976", "1833314192") },
  whoReallyWon: { spotify: SP("23iYibyDKBPWAYKzkJiXw2"), appleMusic: AM("who-really-won", "1833313976", "1833314194") },
};

export const STATIC_RELEASES: StaticRelease[] = [
  {
    _id: "static-strange",
    title: "Strange",
    slug: "strange",
    releaseDate: "2025-12-10",
    releaseDateDisplay: "december · 2025",
    type: "single",
    formatLabel: "single",
    vibe: "strange",
    blurb:
      "the newest one. on strangers who used to be friends, favors that never came back, and getting where you're going on your own.",
    runtime: "2:37",
    artworkBy: "akilah mali",
    coverImage: "/images/strange.jpg",
    catalog: "MALI-003",
    upc: "198025752619",
    label: "Akilah Mali LLC",
    tracks: [
      { trackNumber: 1, title: "Strange", duration: "2:37", lyrics: LYRICS_STRANGE, ...TRK.strange },
    ],
    credits: [
      ["vocals", "akilah brown-pagan"],
      ["written by", "akilah brown-pagan"],
      ["produced by", "kay oh"],
      ["artwork", "akilah mali"],
      ["label", "Akilah Mali LLC"],
    ],
    streamingLinks: {
      spotify: "https://open.spotify.com/track/1jtebf1xPtxiwIlrlrbTi0",
      appleMusic: "https://music.apple.com/us/album/strange/1857222138?i=1857222139",
      youtubeMusic: YTM_CHANNEL,
      smartlink: SMARTLINK,
    },
  },
  {
    _id: "static-who-really-won",
    title: "Who Really Won?",
    slug: "who-really-won",
    releaseDate: "2025-09-05",
    releaseDateDisplay: "september · 2025",
    type: "ep",
    formatLabel: "ep · 5 tracks",
    vibe: "who",
    subtitle: "an extended play",
    blurb:
      "five songs about the same person, end to end, from the last night to the year after. last year came out first as a single. the rest followed it here.",
    runtime: "14:26",
    artworkBy: "akilah mali",
    coverImage: "/images/who-really-won.jpg",
    catalog: "MALI-002",
    upc: "198025546058",
    label: "Akilah Mali LLC",
    tracks: [
      { trackNumber: 1, title: "Last Year", duration: "3:09", lyrics: LYRICS_LAST_YEAR, ...TRK.lastYear },
      { trackNumber: 2, title: "My Bed", duration: "2:28", lyrics: LYRICS_MY_BED, ...TRK.myBed },
      { trackNumber: 3, title: "Gone Away", duration: "2:50", lyrics: LYRICS_GONE_AWAY, ...TRK.goneAway },
      { trackNumber: 4, title: "Been There Once", duration: "2:59", lyrics: LYRICS_BEEN_THERE_ONCE, ...TRK.beenThereOnce },
      { trackNumber: 5, title: "Who Really Won?", duration: "3:00", lyrics: LYRICS_WHO_REALLY_WON, ...TRK.whoReallyWon },
    ],
    credits: [
      ["vocals", "akilah brown-pagan"],
      ["written by", "akilah brown-pagan"],
      ["produced by", "ava aultman · bonnierogerr · (prod.sol)"],
      ["artwork", "akilah mali"],
      ["label", "Akilah Mali LLC"],
    ],
    streamingLinks: {
      spotify: "https://open.spotify.com/album/1erR9OC9qZj0mbYH7STB6X",
      appleMusic: "https://music.apple.com/us/album/who-really-won-ep/1833313976",
      youtubeMusic: YTM_CHANNEL,
      tidal: "https://tidal.com/album/453842873",
      smartlink: SMARTLINK,
    },
  },
  {
    _id: "static-last-year",
    title: "Last Year",
    slug: "last-year",
    releaseDate: "2025-05-23",
    releaseDateDisplay: "may 2025",
    type: "single",
    formatLabel: "single",
    vibe: "lastyear",
    blurb:
      "the first one out, released on its own before the ep. not coming home, sleeping the days away, trying to believe it will be okay.",
    runtime: "3:09",
    artworkBy: "akilah mali",
    coverImage: "/images/last-year.jpg",
    catalog: "MALI-001",
    upc: "198025546041",
    label: "Akilah Mali LLC",
    tracks: [
      { trackNumber: 1, title: "Last Year", duration: "3:09", lyrics: LYRICS_LAST_YEAR, ...TRK.lastYear },
    ],
    credits: [
      ["vocals", "akilah brown-pagan"],
      ["written by", "akilah brown-pagan"],
      ["produced by", "ava aultman"],
      ["artwork", "akilah mali"],
      ["label", "Akilah Mali LLC"],
    ],
    streamingLinks: {
      spotify: "https://open.spotify.com/track/6kIg3mQRYjpel7qYwHaZMA",
      appleMusic: "https://music.apple.com/us/album/last-year/1833313976?i=1833313978",
      youtubeMusic: YTM_CHANNEL,
      smartlink: SMARTLINK,
    },
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

// Real videos. More come from Sanity once they exist.
export const STATIC_VIDEOS: StaticVideo[] = [
  {
    _id: "static-video-who-really-won",
    title: "Who Really Won?",
    youtubeId: "ZNVD8oNf35M",
    date: "2025-09-05",
    dateDisplay: "september 2025",
    type: "musicVideo",
    kindLabel: "official video",
    runtime: "",
    note: "",
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
  "akilah mali is a singer and songwriter. she was raised in dallas, georgia and is based in atlanta. she writes about the people she used to love and the rooms she left them in.",
  "she was born in 2005. her first single, last year, came out in may 2025. it landed on the who really won? ep that september alongside my bed, gone away, been there once, and the title track. strange followed in december.",
  "everything so far is self-released, and she writes every word herself.",
];

export const STATIC_PULL_QUOTE = {
  line1: "i'll be known some day.",
  line2: "give me a few years.",
  attribution: "who really won?, 2025",
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
  { kind: "photo", src: "/images/mali-portrait.jpg", label: "mali", caption: "mali — portrait, 2025", pos: "50% 25%" },
  { kind: "photo", src: "/images/who-really-won.jpg", label: "who really won?", caption: "who really won? — ep cover, 2025", pos: "50% 50%" },
  { kind: "photo", src: "/images/last-year.jpg", label: "last year", caption: "last year — single cover, 2025", pos: "50% 50%" },
  { kind: "photo", src: "/images/strange.jpg", label: "strange", caption: "strange — single cover, 2025", pos: "50% 50%" },
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
  instagram: "https://www.instagram.com/akilah.mali",
  tiktok: "https://www.tiktok.com/@malicantsing",
  youtube: "https://www.youtube.com/@akilahmali",
  twitter: "",
};

/** Shared external links surfaced across the site (footer, about, etc.). */
export const STATIC_LISTEN_LINKS = {
  spotify: "https://open.spotify.com/artist/13CrflPMkTb5mmizdGYL2i",
  appleMusic: "https://music.apple.com/us/artist/mali/1815283080",
  youtubeMusic: "https://music.youtube.com/channel/UCQVqXv4_mcRLIE0Wy1WUSHw",
  smartlink: "https://linktr.ee/akilahmali",
};

