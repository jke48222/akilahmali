import { defineQuery } from "next-sanity";
import { sanityFetch } from "./sanity";

/* =========================================================================
   Shared projections
   ========================================================================= */
const RELEASE_CARD = /* groq */ `
  _id,
  title,
  "slug": slug.current,
  releaseDate,
  type,
  artwork {
    ...,
    "alt": coalesce(alt, ""),
    "lqip": asset->metadata.lqip,
    "dimensions": asset->metadata.dimensions
  }
`;

const STREAMING = /* groq */ `
  streamingLinks {
    spotify,
    appleMusic,
    youtubeMusic,
    tidal,
    smartlink
  }
`;

/* =========================================================================
   Releases
   ========================================================================= */
export const latestReleaseQuery = defineQuery(`
  *[_type == "release"] | order(releaseDate desc)[0] {
    ${RELEASE_CARD},
    description,
    credits,
    ${STREAMING},
    "tracks": tracks[]->{ _id, title, trackNumber, duration }
  }
`);

export const threeUpReleasesQuery = defineQuery(`
  *[_type == "release"] | order(releaseDate desc)[0...3] {
    ${RELEASE_CARD}
  }
`);

export const allReleasesQuery = defineQuery(`
  *[_type == "release"] | order(releaseDate desc) {
    ${RELEASE_CARD}
  }
`);

export const releaseBySlugQuery = defineQuery(`
  *[_type == "release" && slug.current == $slug][0] {
    ${RELEASE_CARD},
    description,
    credits,
    ${STREAMING},
    "tracks": tracks[]->{ _id, title, trackNumber, duration, lyrics, credits } | order(trackNumber asc)
  }
`);

/* =========================================================================
   Videos / Shows / Settings
   ========================================================================= */
export const allVideosQuery = defineQuery(`
  *[_type == "video"] | order(date desc) {
    _id, title, youtubeId, date, type,
    "release": releaseRef->{ title, "slug": slug.current }
  }
`);

export const upcomingShowsQuery = defineQuery(`
  *[_type == "show" && dateTime(date) >= dateTime(now())]
    | order(date asc) {
      _id, date, venue, city, country, billing, ticketUrl, status, notes
    }
`);

export const allShowsQuery = defineQuery(`
  *[_type == "show"] | order(date asc) {
    _id, date, venue, city, country, billing, ticketUrl, status, notes
  }
`);

export const adjacentReleasesQuery = defineQuery(`
{
  "prev": *[_type == "release" && releaseDate < $releaseDate]
    | order(releaseDate desc)[0] {
      _id, title, "slug": slug.current, releaseDate, type, artwork
    },
  "next": *[_type == "release" && releaseDate > $releaseDate]
    | order(releaseDate asc)[0] {
      _id, title, "slug": slug.current, releaseDate, type, artwork
    }
}
`);

export const videoForReleaseQuery = defineQuery(`
  *[_type == "video" && references($releaseId)] | order(date desc)[0] {
    _id, title, youtubeId, date, type
  }
`);

export const settingsQuery = defineQuery(`
  *[_type == "settings" && _id == "settings"][0] {
    siteTitle,
    footerTagline,
    shortBio,
    mediumBio,
    longBio,
    listenLinks,
    socialLinks,
    contactEmails,
    aboutPullQuote,
    "pressKit": pressKit[]{
      name,
      description,
      fileType,
      fileSize,
      "url": file.asset->url,
      "originalFilename": file.asset->originalFilename
    },
    "pressBundle": pressBundle.asset->{ url, originalFilename, size },
    "ogImage": ogImage{ ..., "alt": coalesce(alt, ""), "lqip": asset->metadata.lqip }
  }
`);

export const pageBySlugQuery = defineQuery(`
  *[_type == "page" && slug.current == $slug][0] {
    title,
    "slug": slug.current,
    intro,
    body,
    meta
  }
`);

export const allPressQuery = defineQuery(`
  *[_type == "press"] | order(date desc) {
    _id,
    publication,
    articleTitle,
    url,
    date,
    quote,
    "logo": logo{ ..., "alt": coalesce(alt, "") }
  }
`);

export const lookbookQuery = defineQuery(`
  *[_type == "lookbook" && _id == "lookbook"][0] {
    "shots": shots[]{
      label,
      tag,
      "image": image{
        ...,
        "alt": coalesce(alt, label),
        "lqip": asset->metadata.lqip,
        "dimensions": asset->metadata.dimensions
      }
    }
  }
`);

/* =========================================================================
   Typed result shapes (kept hand-written for now; can be generated later
   via `sanity typegen` once the dataset has documents).
   ========================================================================= */
export type SanityImage = {
  asset: { _ref: string; _type: "reference" };
  alt?: string;
  lqip?: string;
  dimensions?: { width: number; height: number; aspectRatio: number };
  hotspot?: { x: number; y: number; height: number; width: number };
};

export type ReleaseCard = {
  _id: string;
  title: string;
  slug: string;
  releaseDate: string;
  type: "single" | "ep" | "album";
  artwork: SanityImage;
};

export type PortableTextBlock = {
  _type: "block";
  _key?: string;
  style?: string;
  children?: Array<{ _type: "span"; text: string }>;
};

export type Track = {
  _id: string;
  title: string;
  trackNumber: number;
  duration: string;
  lyrics?: PortableTextBlock[];
  credits?: PortableTextBlock[];
};

export type StreamingLinks = {
  spotify?: string;
  appleMusic?: string;
  youtubeMusic?: string;
  tidal?: string;
  smartlink?: string;
};

export type LatestRelease = ReleaseCard & {
  description?: PortableTextBlock[];
  credits?: PortableTextBlock[];
  streamingLinks?: StreamingLinks;
  tracks?: Track[];
};

export type ReleaseDetail = LatestRelease;

export type VideoCard = {
  _id: string;
  title: string;
  youtubeId: string;
  date: string;
  type: "musicVideo" | "visualizer" | "bts";
  release?: { title: string; slug: string } | null;
};

export type AdjacentReleases = {
  prev: ReleaseCard | null;
  next: ReleaseCard | null;
};

/* =========================================================================
   Typed helpers — the public data API used by pages
   ========================================================================= */

export async function getAllReleases(): Promise<ReleaseCard[] | null> {
  return sanityFetch<ReleaseCard[]>(allReleasesQuery);
}

export async function getReleaseBySlug(
  slug: string,
): Promise<ReleaseDetail | null> {
  return sanityFetch<ReleaseDetail>(releaseBySlugQuery, { slug });
}

export async function getAdjacentReleases(
  releaseDate: string,
): Promise<AdjacentReleases | null> {
  return sanityFetch<AdjacentReleases>(adjacentReleasesQuery, { releaseDate });
}

export async function getVideoForRelease(
  releaseId: string,
): Promise<VideoCard | null> {
  return sanityFetch<VideoCard>(videoForReleaseQuery, { releaseId });
}

export async function getAllVideos(): Promise<VideoCard[] | null> {
  return sanityFetch<VideoCard[]>(allVideosQuery);
}

/* -------------------------------------------------------------------------
   Site settings (singleton)
   ------------------------------------------------------------------------- */
export type ContactEmails = {
  general?: string;
  booking?: string;
  sync?: string;
  press?: string;
};

export type SocialLinks = {
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  twitter?: string;
};

export type ListenLinks = {
  spotify?: string;
  appleMusic?: string;
  youtubeMusic?: string;
  tidal?: string;
  smartlink?: string;
};

export type PressAsset = {
  name: string;
  description?: string;
  fileType?: string;
  fileSize?: string;
  url?: string;
  originalFilename?: string;
};

export type PressBundle = {
  url?: string;
  originalFilename?: string;
  size?: number;
};

export type SiteSettings = {
  siteTitle?: string;
  footerTagline?: string;
  shortBio?: string;
  mediumBio?: string;
  longBio?: PortableTextBlock[];
  listenLinks?: ListenLinks;
  socialLinks?: SocialLinks;
  contactEmails?: ContactEmails;
  aboutPullQuote?: { line1?: string; line2?: string; attribution?: string };
  pressKit?: PressAsset[];
  pressBundle?: PressBundle | null;
  ogImage?: SanityImage;
};

export async function getSettings(): Promise<SiteSettings | null> {
  return sanityFetch<SiteSettings>(settingsQuery);
}

/* -------------------------------------------------------------------------
   Pages (editable copy for /about, /press, /contact, /shows)
   ------------------------------------------------------------------------- */
export type SitePage = {
  title: string;
  slug: string;
  intro?: PortableTextBlock[];
  body?: PortableTextBlock[];
  meta?: { title?: string; description?: string };
};

export async function getPageBySlug(slug: string): Promise<SitePage | null> {
  return sanityFetch<SitePage>(pageBySlugQuery, { slug });
}

/* -------------------------------------------------------------------------
   Shows
   ------------------------------------------------------------------------- */
export type ShowItem = {
  _id: string;
  date: string;
  venue: string;
  city: string;
  country?: string;
  billing?: string;
  ticketUrl?: string;
  status: "announced" | "onSale" | "soldOut" | "cancelled" | "tba";
  notes?: string;
};

export async function getUpcomingShows(): Promise<ShowItem[] | null> {
  return sanityFetch<ShowItem[]>(upcomingShowsQuery);
}

export async function getAllShows(): Promise<ShowItem[] | null> {
  return sanityFetch<ShowItem[]>(allShowsQuery);
}

/* -------------------------------------------------------------------------
   Press mentions
   ------------------------------------------------------------------------- */
export type PressMention = {
  _id: string;
  publication: string;
  articleTitle: string;
  url: string;
  date: string;
  quote?: PortableTextBlock[];
  logo?: SanityImage | null;
};

export async function getAllPress(): Promise<PressMention[] | null> {
  return sanityFetch<PressMention[]>(allPressQuery);
}

/* -------------------------------------------------------------------------
   Lookbook (store)
   ------------------------------------------------------------------------- */
export type LookbookShot = {
  label?: string;
  tag?: string;
  image: SanityImage & {
    alt?: string;
    lqip?: string;
    dimensions?: { width: number; height: number };
  };
};

export type LookbookData = { shots?: LookbookShot[] | null } | null;

export async function getLookbook(): Promise<LookbookData> {
  return sanityFetch<LookbookData>(lookbookQuery);
}
