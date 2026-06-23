/**
 * Single source of truth for site content — Akilah Mali (stage name: MALI).
 * Links/catalog per the artist's official brand doc. Handles standardized on
 * @akilahmali. She owns her masters (Akilah Mali LLC).
 */

export const site = {
  artist: "Akilah Mali",
  contactEmail: "realmalimusic@gmail.com",
  // Hero CTA → the "Who Really Won?" release page (on-site deep link)
  listenUrl: "/music/who-really-won",

  // Laylo "text chain" drop (color matches the red theme: cb9a9e)
  laylo: {
    dropId: "6cbd0409-ccb8-4ea5-bde4-c740adadc82d",
    embedSrc:
      "https://embed.laylo.com?dropId=6cbd0409-ccb8-4ea5-bde4-c740adadc82d&color=cb9a9e&minimal=false&theme=light&background=translucent&customTitle=sign%20up%20for%20my%20text%20chain!",
  },
  cartUrl: "https://shop.akilahmali.com/cart",

  nav: [
    { label: "HOME", href: "/" },
    { label: "ABOUT", href: "/about" },
    { label: "MERCH", href: "https://shop.akilahmali.com", external: true },
    { label: "TOUR", href: "/tour" },
    { label: "MUSIC", href: "/music" },
  ],

  socials: [
    { name: "instagram", href: "https://www.instagram.com/akilah.mali" },
    { name: "youtube", href: "https://www.youtube.com/@akilahmali" },
    { name: "spotify", href: "https://open.spotify.com/artist/13CrflPMkTb5mmizdGYL2i" },
    { name: "applemusic", href: "https://music.apple.com/us/artist/mali/1815283080" },
    { name: "tiktok", href: "https://www.tiktok.com/@akilah.mali" },
    { name: "linktree", href: "https://linktr.ee/akilahmali" },
  ],

  // Real asset paths in /public/assets
  assets: {
    wordmark: "/assets/wordmark.png", // black "akilah mali" logo (transparent)
    wordmarkWhite: "/assets/wordmark-white.png", // white version for dark headers
    heroVideo: "/assets/hero.mp4", // "Who Really Won?" music video (supplied)
    heroPoster: "/assets/hero-poster.jpg",
    pixieMermaid: "/assets/pixie-mermaid.png", // abstract black silhouette decoration
    pix3: "/assets/pix3.png",
    pix4: "/assets/pix4.png",
    bgLavender: "/assets/grain-light.png", // fine red grain tile (light sections)
    bgPlum: "/assets/grain-dark.png", // fine maroon grain tile (dark sections)
  },

  // Homepage "Listen Now" — Akilah Mali's top tracks + artist player
  homeListen: [
    { type: "track", id: "15gG3VoteXYpZaP6Ns9s5C", height: 152 }, // Gone Away (most streamed)
    { type: "track", id: "1jtebf1xPtxiwIlrlrbTi0", height: 152 }, // Strange
    { type: "artist", id: "13CrflPMkTb5mmizdGYL2i", height: 352 },
  ],

  // /music grid — MALI top tracks + Strange + Who Really Won? EP catalog
  musicGrid: [
    { kind: "single", type: "artist", id: "13CrflPMkTb5mmizdGYL2i", height: 352 }, // MALI — Top Tracks
    { kind: "single", type: "album", id: "1erR9OC9qZj0mbYH7STB6X", height: 352 }, // Who Really Won? (EP)
    { kind: "single", type: "track", id: "15gG3VoteXYpZaP6Ns9s5C", height: 152 }, // Gone Away
    { kind: "single", type: "track", id: "23iYibyDKBPWAYKzkJiXw2", height: 152 }, // Who Really Won?
    { kind: "single", type: "track", id: "6kIg3mQRYjpel7qYwHaZMA", height: 152 }, // Last Year
    { kind: "single", type: "track", id: "0VkYr8VpokT0L2DExqtRbG", height: 152 }, // My Bed
    { kind: "single", type: "track", id: "6UjxD0WgUJaIA3AA1I2psf", height: 152 }, // Been There Once
    { kind: "single", type: "track", id: "1jtebf1xPtxiwIlrlrbTi0", height: 152 }, // Strange (single)
  ],

  // /about
  bio: [
    "Last year, Atlanta-based singer, songwriter, and independent artist Akilah Mali stepped into the light with her debut EP, Who Really Won?, and her emotionally charged follow-up single, “Strange.” The intimately crafted projects showcase her strongest and most honest songwriting yet, presaging this chapter as her most authentic and assured to date.",
    "Writing, recording, and releasing all of her music entirely herself, Akilah Mali has built a growing catalog that continues to resonate with listeners. She first established her distinct, vulnerable sound with her early 2025 single “Last Year.” Just months later, she released her debut 5-track EP, Who Really Won?, a breakout project that showcased her complete creative control. Featuring standout tracks like “Gone Away” and “My Bed,” the 14-minute release further cemented her ability to craft records exploring the relatable, messy realities of relationships that just didn't last.",
    "In late 2025, Akilah’s standalone single “Strange” became another watershed moment in her early career. Tackling the painful realities of fading connections, including strangers who used to be friends and favors that never came back, the track paved the way for a deeper emotional resonance with her audience. Her trajectory has been defined by a fierce work ethic and an absolute dedication to her artistic vision as an independent creator.",
    "This era represents a creative turning point in her career, setting the stage for what comes next. As she writes and produces her next wave of releases, her evolving sound continues to examine the growing pains of early adulthood, internal contradiction, and the old versions of ourselves that we shed with age.",
    "Guided by the same independence and artistic control that have defined her work from the beginning, Akilah Mali enters her next chapter with a clearer sense of purpose and a voice that continues to grow more distinct with each release.",
  ],

  subscribeBlurb:
    "Sign up with your email address to stay in touch and receive music and tour updates from Akilah.",
} as const;

export type Site = typeof site;
