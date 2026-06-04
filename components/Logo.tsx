/**
 * Brand wordmark, rendered as inline SVG text in the display face (Fraunces
 * italic) with `fill="currentColor"` so it inherits the surrounding text color
 * — letting it ride the Nav's ink↔cream theme transition exactly like the old
 * text node did. `textLength` pins the horizontal size so the layout is stable
 * regardless of font-load timing or metric differences.
 *
 * Size it by setting a font-size (height = 1em) on the element via `className`,
 * just like the text it replaces; the width derives from the aspect ratio.
 */
export function Wordmark({
  className,
  title = "Akilah Mali",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 614 100"
      role="img"
      aria-label={title}
      className={className}
      style={{ height: "1em", width: "auto", display: "block", overflow: "visible" }}
    >
      <text
        x="0"
        y="82"
        textLength="614"
        lengthAdjust="spacingAndGlyphs"
        fontFamily="var(--font-display), Georgia, serif"
        fontStyle="italic"
        fontWeight={400}
        fontSize="116"
        fill="currentColor"
      >
        akilah mali
      </text>
    </svg>
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
