/**
 * Safe serialization for JSON-LD embedded in a <script type="application/ld+json">
 * via dangerouslySetInnerHTML.
 *
 * Plain JSON.stringify does NOT escape `<`, so any CMS- or merchant-authored
 * string containing `</script>` (e.g. a Shopify product description or a Sanity
 * track title) would break out of the tag — a stored-XSS / markup-injection
 * vector. It also leaves the raw U+2028 / U+2029 line separators that are valid
 * in JSON but break the surrounding HTML/JS parse. Escaping all of these to
 * their \uXXXX forms keeps the payload byte-for-byte valid JSON while making it
 * inert inside HTML.
 */
const LS = new RegExp(String.fromCharCode(0x2028), "g"); // U+2028 line separator
const PS = new RegExp(String.fromCharCode(0x2029), "g"); // U+2029 paragraph separator

export function jsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(LS, "\\u2028")
    .replace(PS, "\\u2029");
}

/* =========================================================================
   Canonical artist entity.

   "Akilah Mali" collides in search with Mali Music (Kortney Pollard), the
   Indian singer Mali, and the country. One @id-anchored entity, referenced by
   every MusicAlbum/MusicRecording on the site, plus sameAs trust anchors, is
   what disambiguates her for Google's Knowledge Graph.
   ========================================================================= */
export const SITE_URL = "https://akilahmali.com";
export const ARTIST_ID = `${SITE_URL}/#artist`;

export const ARTIST_SAME_AS = [
  "https://open.spotify.com/artist/13CrflPMkTb5mmizdGYL2i",
  "https://music.apple.com/us/artist/mali/1815283080",
  "https://music.youtube.com/channel/UC_F92jN7yVa0CU_PbS3Db9g",
  "https://www.youtube.com/@akilahmali",
  "https://www.instagram.com/akilah.mali",
  "https://www.tiktok.com/@akilahmali",
  "https://tidal.com/browse/artist/5453",
  // TODO(akilah): add these once the entries exist — they're the strongest
  // trust anchors Google reads for Knowledge Panel disambiguation:
  //   "https://musicbrainz.org/artist/<mbid>",
  //   "https://www.discogs.com/artist/<discogs-id>",
];

/** Full Person+MusicGroup entity for the homepage and /about. */
export function artistJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["Person", "MusicGroup"],
    "@id": ARTIST_ID,
    name: "Akilah Mali",
    alternateName: ["MALI", "Akilah Brown-Pagan"],
    url: SITE_URL,
    image: `${SITE_URL}/images/mali-portrait.jpg`,
    genre: ["Alternative R&B", "Bedroom Pop", "R&B"],
    foundingDate: "2025",
    foundingLocation: {
      "@type": "Place",
      name: "Atlanta, Georgia, United States",
    },
    homeLocation: {
      "@type": "Place",
      name: "Atlanta, Georgia, United States",
    },
    sameAs: ARTIST_SAME_AS,
  };
}

/** Compact reference for byArtist fields — resolves to the entity above. */
export function artistRef() {
  return {
    "@type": "MusicGroup",
    "@id": ARTIST_ID,
    name: "Akilah Mali",
  };
}
