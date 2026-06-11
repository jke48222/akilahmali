"use client";

import { useEffect } from "react";

/**
 * DevTools signature — the insider tell on label sites and awwwards winners.
 * One styled line, printed once; renders nothing.
 */
export function ConsoleSignature() {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.info(
      "%c✿ akilah mali%c\natlanta, ga · est. 2025\nhandmade site · say hi: realmalimusic@gmail.com",
      "color:#C21A18;font-family:Georgia,serif;font-style:italic;font-size:16px",
      "color:#8C8478;font-family:monospace;font-size:11px;letter-spacing:0.08em",
    );
  }, []);
  return null;
}
