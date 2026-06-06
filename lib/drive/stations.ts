/* =========================================================================
   THE DRIVE — radio stations (the menu).

   Each song is a "station" on the car radio. Tuning the dial re-skins the city
   to that song's mood; selecting pushes the camera through the windshield into
   the song's film.

   IMPORTANT — streams must count (same hard rule as the orb + the WRW grid).
   The Drive plays a 30-second PREVIEW only (same-origin so the Web Audio
   analyser can drive the rain/city reactivity); it never serves a full song.
   So the preview + Spotify + Apple fields are sourced from the single shared
   catalog (lib/player/catalog.ts) by track id — one source of truth for the
   global orb AND this world — and every station surfaces the platform links
   where a real, counted stream happens.

   The Drive-specific fields layered on top are purely cosmetic/navigational:
     accent / accent2 — the station's neon two-tone (crimson family)
     skyColor         — re-skins the sky + fog when this station is tuned (M4)
     hookText         — a lyric-ish line shown on the dial readout
     filmSrc          — the full-screen still/film shown in StationFilm (M5)
     isLandmark       — the "Tower of Roses" moment (camera drifts up the neon
                        tower before the push — M6)

   Mirrors the data-driven shape of lib/wrw/grid.ts (FEEDS).
   ========================================================================= */

import { trackById, type PlayerTrack } from "@/lib/player/catalog";

export type Station = {
  /** matches the catalog track id AND the ?song= deep-link slug */
  id: string;
  title: string;
  artist: string;
  /** 30s preview clip (teaser only — never the full song) */
  preview: string;
  /** full-song links — where a real stream is registered */
  spotify: string;
  apple: string;
  /** neon two-tone that skins this station (crimson family) */
  accent: string;
  accent2: string;
  /** sky + fog colour when this station is tuned */
  skyColor: string;
  /** a short lyric-ish line for the dial readout */
  hookText: string;
  /** the full-screen still/film for the station's film (M5) */
  filmSrc: string;
  /** the Tower of Roses landmark moment (M6) */
  isLandmark?: boolean;
};

/* The Drive's crimson re-skin of the real catalog. `track` is the catalog id
   (source of the preview + stream links); the rest is this world's styling. */
type StationSkin = {
  track: string;
  accent: string;
  accent2: string;
  skyColor: string;
  hookText: string;
  filmSrc: string;
  isLandmark?: boolean;
};

const SKINS: StationSkin[] = [
  {
    track: "last-year", accent: "#ff3a46", accent2: "#ff8a4c", skyColor: "#15050a",
    hookText: "same on-ramp, same rain, last year all over again",
    filmSrc: "/images/100_0348.JPG",
  },
  {
    track: "my-bed", accent: "#ff5d7e", accent2: "#c01a4f", skyColor: "#1a0410",
    hookText: "the city slides by — I never get out of the car",
    filmSrc: "/images/100_0312.JPG",
  },
  {
    track: "gone-away", accent: "#e0103a", accent2: "#6a3aff", skyColor: "#0c0410",
    hookText: "tail-lights smear into the wet asphalt and you're gone",
    filmSrc: "/images/100_0324.JPG",
  },
  {
    track: "been-there-once", accent: "#ff9a3c", accent2: "#ff3a46", skyColor: "#1a0a04",
    hookText: "sodium light, brake light, I've been down here once before",
    filmSrc: "/images/100_0335.JPG",
  },
  {
    track: "who-really-won", accent: "#ff2b2b", accent2: "#ff7d92", skyColor: "#160406",
    hookText: "round and round the same skyline — who really won?",
    filmSrc: "/images/100_0347.JPG",
  },
  {
    // the landmark: a neon high-rise blooming with roses, glimpsed through the
    // wet window — the camera drifts up the tower before the push (M6).
    track: "strange", accent: "#ff4d6d", accent2: "#ff9ec7", skyColor: "#1a0614",
    hookText: "the tower of roses, blooming in the dark — strange",
    filmSrc: "/images/100_0309.JPG",
    isLandmark: true,
  },
];

function build(skin: StationSkin): Station | null {
  const t: PlayerTrack | null = trackById(skin.track);
  if (!t) return null; // a catalog id was renamed — drop the station rather than ship a dead link
  return {
    id: t.id,
    title: t.title,
    artist: t.artist,
    preview: t.src,
    spotify: t.spotify,
    apple: t.apple,
    accent: skin.accent,
    accent2: skin.accent2,
    skyColor: skin.skyColor,
    hookText: skin.hookText,
    filmSrc: skin.filmSrc,
    isLandmark: skin.isLandmark,
  };
}

export const STATIONS: Station[] = SKINS.map(build).filter((s): s is Station => s !== null);

/** Station index for a ?song= slug (or null when there's no matching station). */
export function stationIndexForSong(slug: string): number | null {
  const i = STATIONS.findIndex((s) => s.id === slug);
  return i >= 0 ? i : null;
}

/** Wrap an index into the [0, STATIONS.length) ring — the radio tunes in a loop. */
export function wrapStation(index: number): number {
  const n = STATIONS.length;
  return ((index % n) + n) % n;
}
