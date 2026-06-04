/**
 * One-off seed: pushes the site's static fallback content into the Sanity
 * `production` dataset so the Studio + live site are populated.
 *
 * Idempotent — every document uses a deterministic _id via createOrReplace,
 * so re-running overwrites rather than duplicating. Images are uploaded once
 * and reused by reference.
 *
 *   node scripts/seed-sanity.mjs
 */
import { createClient } from "@sanity/client";
import { readFileSync, createReadStream } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

/* ---- env (parse env.local) ------------------------------------------- */
const envText = readFileSync(join(ROOT, "env.local"), "utf8");
const env = Object.fromEntries(
  envText
    .split("\n")
    .filter((l) => l && !l.trimStart().startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-05-14",
  token: env.SANITY_API_TOKEN,
  useCdn: false,
});

/* ---- portable-text helpers ------------------------------------------- */
let k = 0;
const key = () => `k${(k++).toString(36)}`;

function block(text, style = "normal") {
  return {
    _type: "block",
    _key: key(),
    style,
    markDefs: [],
    children: [{ _type: "span", _key: key(), text, marks: [] }],
  };
}
/** plain multi-line text -> one block per line (blank lines preserved). */
const linesToBlocks = (text) => text.split("\n").map((l) => block(l));
/** [label, value] tuples -> "label — value" blocks. */
const creditsToBlocks = (rows) => rows.map(([l, v]) => block(`${l} — ${v}`));

/* ---- image upload (cached) ------------------------------------------- */
const assetCache = new Map();
async function uploadImage(relPath, filename) {
  if (assetCache.has(relPath)) return assetCache.get(relPath);
  process.stdout.write(`  ↑ uploading ${filename} ... `);
  const asset = await client.assets.upload(
    "image",
    createReadStream(join(ROOT, "public", relPath)),
    { filename },
  );
  console.log("ok");
  assetCache.set(relPath, asset._id);
  return asset._id;
}
const imageRef = (assetId, alt) => ({
  _type: "image",
  asset: { _type: "reference", _ref: assetId },
  ...(alt ? { alt } : {}),
});

/* ---- shared links ----------------------------------------------------- */
const YTM = "https://music.youtube.com/channel/UCQVqXv4_mcRLIE0Wy1WUSHw";
const SMART = "https://linktr.ee/akilahmali";

/* ---- lyrics ----------------------------------------------------------- */
const LYRICS = {
  strange: `Night lights, I always wondered how they stayed, so bright
Siren sounds, tend to fade from the then and now
Hidden cage, often i let my thoughts roam with no space

Is it ever gonna change,
Seems to stay the same
I always found it strange

You try to tear me down, look where im at i did it on my own, you were my setback
Strangers once were friends
Rules were made to bend
Favors build to lend, that were never returned back

No one cares, til you write a song about being sad
Its my fault, i tried to hold on to what we had

Its all been so strange in the past year,
Sleepless nights, my heads finally clear

Is it ever gonna change,
Seems to stay the same
I always found it strange`,
  "last-year": `Not coming home to you
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

I'm not running, running, running back to you
Not coming, coming, coming home to you
Oh you had me, you lost me, and now we're done`,
  "my-bed": `No bitter words, no need to blame
I'm just not falling for your little game
There's no more spark, there's no more flame

All the things we said
Our story came to an end
When you were laying down in my bed
After the lies you spread
That I just can't defend
Now there's an empty place next to my bed`,
  "gone-away": `Stay
Won't you just stay

Didn't wanna do it to ya
You know you can't decide
Didn't wanna do it to ya
You were never on my side

Stay
Won't you just stay
My heart beated for ya
Now its gone away`,
  "been-there-once": `Oh he'll tell you he loves you
But I know its a lie
At first he'll try to make things right
Say you're the love of his life

You won't last
Maybe a couple months
I know that
Because I've been there once

Trust me I know, trust me I know
I've been there before`,
  "who-really-won": `Wrote songs about you
It helped me move on
I'm not obsessed with you
Bring your ego down

Who really won?
Who really won?
Who really won?
Who really won?

I'll be known some day
Give me a few years
I don't care what they say
After all of these tears`,
};

/* ---- tracks (shared docs, referenced by releases) -------------------- */
const TRACKS = [
  { _id: "track-strange", title: "Strange", trackNumber: 1, duration: "2:37" },
  { _id: "track-last-year", title: "Last Year", trackNumber: 1, duration: "3:09" },
  { _id: "track-my-bed", title: "My Bed", trackNumber: 2, duration: "2:28" },
  { _id: "track-gone-away", title: "Gone Away", trackNumber: 3, duration: "2:50" },
  { _id: "track-been-there-once", title: "Been There Once", trackNumber: 4, duration: "2:59" },
  { _id: "track-who-really-won", title: "Who Really Won?", trackNumber: 5, duration: "3:00" },
];
const lyricKey = {
  "track-strange": "strange",
  "track-last-year": "last-year",
  "track-my-bed": "my-bed",
  "track-gone-away": "gone-away",
  "track-been-there-once": "been-there-once",
  "track-who-really-won": "who-really-won",
};
const ref = (id) => ({ _type: "reference", _ref: id, _key: key() });

async function main() {
  console.log(`Seeding ${client.config().projectId}/${client.config().dataset} ...\n`);

  console.log("Uploading images:");
  const imgStrange = await uploadImage("images/strange.jpg", "strange.jpg");
  const imgWrw = await uploadImage("images/who-really-won.jpg", "who-really-won.jpg");
  const imgLastYear = await uploadImage("images/last-year.jpg", "last-year.jpg");
  const imgPortrait = await uploadImage("images/mali-portrait.jpg", "mali-portrait.jpg");

  const docs = [];

  /* tracks */
  for (const t of TRACKS) {
    docs.push({
      _id: t._id,
      _type: "track",
      title: t.title,
      trackNumber: t.trackNumber,
      duration: t.duration,
      lyrics: linesToBlocks(LYRICS[lyricKey[t._id]]),
    });
  }

  /* releases */
  docs.push({
    _id: "release-strange",
    _type: "release",
    title: "Strange",
    slug: { _type: "slug", current: "strange" },
    releaseDate: "2025-12-10",
    type: "single",
    artwork: imageRef(imgStrange, "Strange · cover artwork"),
    description: [
      block(
        "the newest one. on strangers who used to be friends, favors that never came back, and getting where you're going on your own.",
      ),
    ],
    credits: creditsToBlocks([
      ["vocals", "akilah brown-pagan"],
      ["written by", "akilah brown-pagan"],
      ["produced by", "kay oh"],
      ["artwork", "akilah mali"],
      ["label", "Akilah Mali LLC"],
    ]),
    streamingLinks: {
      spotify: "https://open.spotify.com/track/1jtebf1xPtxiwIlrlrbTi0",
      appleMusic: "https://music.apple.com/us/album/strange/1857222138?i=1857222139",
      youtubeMusic: YTM,
      smartlink: SMART,
    },
    tracks: [ref("track-strange")],
  });

  docs.push({
    _id: "release-who-really-won",
    _type: "release",
    title: "Who Really Won?",
    slug: { _type: "slug", current: "who-really-won" },
    releaseDate: "2025-09-05",
    type: "ep",
    artwork: imageRef(imgWrw, "Who Really Won? · ep cover"),
    description: [
      block(
        "five songs about the same person, end to end, from the last night to the year after. last year came out first as a single. the rest followed it here.",
      ),
    ],
    credits: creditsToBlocks([
      ["vocals", "akilah brown-pagan"],
      ["written by", "akilah brown-pagan"],
      ["produced by", "ava aultman · bonnierogerr · (prod.sol)"],
      ["artwork", "akilah mali"],
      ["label", "Akilah Mali LLC"],
    ]),
    streamingLinks: {
      spotify: "https://open.spotify.com/album/1erR9OC9qZj0mbYH7STB6X",
      appleMusic: "https://music.apple.com/us/album/who-really-won-ep/1833313976",
      youtubeMusic: YTM,
      tidal: "https://tidal.com/album/453842873",
      smartlink: SMART,
    },
    tracks: [
      ref("track-last-year"),
      ref("track-my-bed"),
      ref("track-gone-away"),
      ref("track-been-there-once"),
      ref("track-who-really-won"),
    ],
  });

  docs.push({
    _id: "release-last-year",
    _type: "release",
    title: "Last Year",
    slug: { _type: "slug", current: "last-year" },
    releaseDate: "2025-05-23",
    type: "single",
    artwork: imageRef(imgLastYear, "Last Year · cover artwork"),
    description: [
      block(
        "the first one out, released on its own before the ep. not coming home, sleeping the days away, trying to believe it will be okay.",
      ),
    ],
    credits: creditsToBlocks([
      ["vocals", "akilah brown-pagan"],
      ["written by", "akilah brown-pagan"],
      ["produced by", "ava aultman"],
      ["artwork", "akilah mali"],
      ["label", "Akilah Mali LLC"],
    ]),
    streamingLinks: {
      spotify: "https://open.spotify.com/track/6kIg3mQRYjpel7qYwHaZMA",
      appleMusic: "https://music.apple.com/us/album/last-year/1833313976?i=1833313978",
      youtubeMusic: YTM,
      smartlink: SMART,
    },
    tracks: [ref("track-last-year")],
  });

  /* video */
  docs.push({
    _id: "video-who-really-won",
    _type: "video",
    title: "Who Really Won?",
    youtubeId: "ZNVD8oNf35M",
    date: "2025-09-05",
    type: "musicVideo",
    releaseRef: { _type: "reference", _ref: "release-who-really-won" },
  });

  /* settings singleton */
  docs.push({
    _id: "settings",
    _type: "settings",
    siteTitle: "Akilah Mali",
    footerTagline: "akilah mali · b. 2005 · est. 2025",
    shortBio:
      "akilah mali is a singer and songwriter from atlanta. she writes about the people she used to love and the rooms she left them in.",
    mediumBio:
      "akilah mali is a singer and songwriter. she was raised in dallas, georgia and is based in atlanta. she writes about the people she used to love and the rooms she left them in. born in 2005, her first single last year came out in may 2025, landing on the who really won? ep that september. strange followed in december. everything so far is self-released.",
    longBio: [
      block(
        "akilah mali is a singer and songwriter. she was raised in dallas, georgia and is based in atlanta. she writes about the people she used to love and the rooms she left them in.",
      ),
      block(
        "she was born in 2005. her first single, last year, came out in may 2025. it landed on the who really won? ep that september alongside my bed, gone away, been there once, and the title track. strange followed in december.",
      ),
      block("everything so far is self-released, and she writes every word herself."),
    ],
    listenLinks: {
      spotify: "https://open.spotify.com/artist/13CrflPMkTb5mmizdGYL2i",
      appleMusic: "https://music.apple.com/us/artist/mali/1815283080",
      youtubeMusic: YTM,
      smartlink: SMART,
    },
    socialLinks: {
      instagram: "https://www.instagram.com/akilah.mali",
      tiktok: "https://www.tiktok.com/@akilahmali",
      youtube: "https://www.youtube.com/@akilahmali",
    },
    contactEmails: {
      general: "realmalimusic@gmail.com",
      press: "realmalimusic@gmail.com",
    },
    aboutPullQuote: {
      line1: "i'll be known some day.",
      line2: "give me a few years.",
      attribution: "who really won?, 2025",
    },
    ogImage: imageRef(imgPortrait, "Akilah Mali"),
  });

  /* editable pages */
  docs.push({
    _id: "page-about",
    _type: "page",
    title: "About",
    slug: { _type: "slug", current: "about" },
    intro: [
      block(
        "akilah mali is a singer and songwriter from atlanta. she writes about the people she used to love and the rooms she left them in.",
      ),
    ],
    body: [
      block(
        "she was born in 2005. her first single, last year, came out in may 2025. it landed on the who really won? ep that september alongside my bed, gone away, been there once, and the title track. strange followed in december.",
      ),
      block("everything so far is self-released, and she writes every word herself."),
    ],
    meta: {
      title: "About · Akilah Mali",
      description: "singer and songwriter from atlanta. self-released since 2025.",
    },
  });
  docs.push({
    _id: "page-press",
    _type: "page",
    title: "Press",
    slug: { _type: "slug", current: "press" },
    intro: [block("press, interviews, and downloads.")],
    meta: { title: "Press · Akilah Mali" },
  });
  docs.push({
    _id: "page-contact",
    _type: "page",
    title: "Contact",
    slug: { _type: "slug", current: "contact" },
    intro: [block("for general, press, booking, and sync inquiries.")],
    meta: { title: "Contact · Akilah Mali" },
  });

  /* lookbook singleton (placeholder shots — swap in the Studio) */
  docs.push({
    _id: "lookbook",
    _type: "lookbook",
    title: "Lookbook — Chapter I",
    shots: [
      { _type: "lookbookShot", _key: key(), image: imageRef(imgPortrait, "mali — portrait"), label: "01 — portrait", tag: "placeholder" },
      { _type: "lookbookShot", _key: key(), image: imageRef(imgWrw, "who really won? — cover"), label: "02 — who really won?", tag: "placeholder" },
      { _type: "lookbookShot", _key: key(), image: imageRef(imgStrange, "strange — cover"), label: "03 — strange", tag: "placeholder" },
      { _type: "lookbookShot", _key: key(), image: imageRef(imgLastYear, "last year — cover"), label: "04 — last year", tag: "placeholder" },
    ],
  });

  console.log(`\nWriting ${docs.length} documents ...`);
  let tx = client.transaction();
  for (const d of docs) tx = tx.createOrReplace(d);
  await tx.commit({ visibility: "async" });

  console.log("\n✅ Done. Seeded:");
  console.log(`   ${TRACKS.length} tracks · 3 releases · 1 video · settings · 3 pages · lookbook`);
}

main().catch((err) => {
  console.error("\n❌ Seed failed:", err.message || err);
  process.exit(1);
});
