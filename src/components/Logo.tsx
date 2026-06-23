/**
 * Brand wordmark — "akilah mali" set upright in Libre Baskerville with an
 * 8-point star standing in for the tittle of the final "i". Rendered as inline
 * SVG text with `fill="currentColor"` so it inherits the surrounding text color
 * and rides the Nav's ink↔cream theme transition. `textLength` pins the
 * horizontal size so both the layout AND the star's alignment over the final
 * letter stay stable regardless of font-load timing or metric differences.
 *
 * The final "i" uses the dotless glyph (ı, U+0131) so the star is the only mark
 * above it. Size it by setting a font-size (height = 1em) via `className`.
 */
export function Wordmark({
  className,
  title = "Akilah Mali",
  fit = false,
}: {
  className?: string;
  title?: string;
  /** Size by container WIDTH (fills 100%, height follows aspect) instead of by
   *  font-size. Use in fixed-width columns so the long wordmark never overflows. */
  fit?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 614 100"
      role="img"
      aria-label={title}
      className={className}
      style={
        fit
          ? { width: "100%", height: "auto", display: "block", overflow: "visible" }
          : { height: "1em", width: "auto", display: "block", overflow: "visible" }
      }
    >
      <text
        x="0"
        y="82"
        textLength="614"
        lengthAdjust="spacingAndGlyphs"
        fontFamily="var(--font-display), Georgia, serif"
        fontWeight={400}
        fontSize="116"
        fill="currentColor"
      >
        akilah malı
      </text>
      <BrandStar />
    </svg>
  );
}

/** 8-point star tittle, positioned over the final "i" of the SVG wordmark. */
function BrandStar() {
  return (
    <path
      transform="translate(591 -2) scale(1.25)"
      fill="currentColor"
      d="M0,-16 1.72,-4.16 11.31,-11.31 4.16,-1.72 16,0 4.16,1.72 11.31,11.31 1.72,4.16 0,16 -1.72,4.16 -11.31,11.31 -4.16,1.72 -16,0 -4.16,-1.72 -11.31,-11.31 -1.72,-4.16 Z"
    />
  );
}

/**
 * The real Akilah Mali logo art (`/logo/akilah-mali-wordmark-ink.svg`, which
 * bakes in the Fraunces-italic outlines + the embedded font) rendered so it
 * still inherits the surrounding text color. The file hardcodes its own ink
 * fill, so instead of drawing it we use it as a CSS mask and paint the shape
 * with `currentColor` — the SVG's alpha gives the letterforms, `currentColor`
 * recolors them to match the header text exactly (ink on the cover, white in
 * the surveillance HUD).
 *
 * Size it like the text it sits beside: a font-size on `className` sets the
 * height (1em) and the width follows the 1000×280 artwork aspect ratio.
 */
export function WordmarkLogo({
  className,
  title = "Akilah Mali",
}: {
  className?: string;
  title?: string;
}) {
  const mask = "url(/logo/akilah-mali-wordmark-ink.svg) center / contain no-repeat";
  return (
    <span
      role="img"
      aria-label={title}
      className={className}
      style={{
        display: "block",
        height: "1em",
        width: "calc(1em * 1000 / 280)",
        backgroundColor: "currentColor",
        WebkitMask: mask,
        mask,
      }}
    />
  );
}

/**
 * Compact "am" monogram mark (matches app/icon.svg) — for tight spots where the
 * full wordmark won't fit. Inherits color via currentColor; transparent bg.
 */
export function Monogram({
  className,
  title = "Akilah Mali",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      role="img"
      aria-label={title}
      className={className}
      style={{ height: "1em", width: "1em", display: "block", overflow: "visible" }}
    >
      <text
        x="50"
        y="72"
        textAnchor="middle"
        fontFamily="var(--font-display), Georgia, serif"
        fontStyle="italic"
        fontWeight={500}
        fontSize="64"
        letterSpacing="-2"
        fill="currentColor"
      >
        am
      </text>
    </svg>
  );
}
