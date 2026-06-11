import NextLink from "next/link";
import { Magnetic } from "@/components/Magnetic";

/**
 * Rotating circular-text badge — the "sticker" detail label sites pin over a
 * hero (PinkPantheress, awwwards-circuit staple). Mono caps ride a circle
 * around a cherry seed; rotation pauses on hover and the type lifts to cream.
 * Pure SVG + CSS, no JS — the Magnetic wrapper adds the pointer pull.
 */
export function SpinBadge() {
  return (
    <Magnetic strength={0.25}>
      <NextLink
        href="/music"
        aria-label="who really won? — out now. listen"
        className="spin-badge block"
      >
        <svg
          className="spin-badge-svg"
          width="132"
          height="132"
          viewBox="0 0 140 140"
          aria-hidden="true"
        >
          <defs>
            <path
              id="spin-ring"
              d="M70,70 m-52,0 a52,52 0 1,1 104,0 a52,52 0 1,1 -104,0"
              fill="none"
            />
          </defs>
          <text className="spin-badge-text" fontSize="8.5" letterSpacing="0.74">
            <textPath href="#spin-ring">
              who really won? — out now — who really won? — out now —
            </textPath>
          </text>
          <circle cx="70" cy="70" r="3" fill="var(--color-accent-2)" />
        </svg>
      </NextLink>
    </Magnetic>
  );
}
