import NextLink from "next/link";

/**
 * Release ticker — the label-site marquee strip (donttaptheglass, UMG artist
 * pages). One slow, even scroll between two hairlines; hover pauses it. The
 * whole strip is a single link to /music so it reads as a stamp, not chrome.
 */
const REPEATS = 6;

function Half({ hidden }: { hidden?: boolean }) {
  return (
    <span className="ticker-half" aria-hidden={hidden || undefined}>
      {Array.from({ length: REPEATS }).map((_, i) => (
        <span key={i} className="ticker-unit">
          <span className="font-display italic">who really won?</span>
          <span className="ticker-dot" aria-hidden="true">
            ✱
          </span>
          <span className="font-mono text-mono-xs uppercase tracking-caps-lg">
            out now
          </span>
          <span className="ticker-dot" aria-hidden="true">
            ✱
          </span>
        </span>
      ))}
    </span>
  );
}

export function Ticker() {
  return (
    <NextLink
      href="/music"
      aria-label="who really won? — out now. listen"
      className="ticker block border-y border-rule"
    >
      <div className="ticker-track py-4 md:py-5">
        <Half />
        <Half hidden />
      </div>
    </NextLink>
  );
}
