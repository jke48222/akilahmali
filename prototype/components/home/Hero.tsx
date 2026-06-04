import { Reveal } from "@/components/Reveal";

type HeroImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  blurDataURL?: string;
};

type HeroProps = {
  /**
   * Pass a hero photo when one exists; otherwise the designed CSS field is used.
   * Slot a Sanity-resolved image in here in a single line — the rest of the
   * hero composition (grain, vignette, type) stays the same.
   */
  image?: HeroImage;
};

export function Hero({ image }: HeroProps) {
  return (
    <section
      id="top"
      className="relative w-full"
      style={{ minHeight: "100svh" }}
      aria-label="MALI — chapter i"
    >
      <div className="absolute inset-0 field hero-field field-light">
        {image ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              filter: "saturate(0.92) contrast(1.02)",
              ...(image.blurDataURL
                ? {
                    backgroundImage: `url(${image.blurDataURL})`,
                    backgroundSize: "cover",
                  }
                : {}),
            }}
            decoding="async"
          />
        ) : null}

        {/* Drifting noise overlay — pure CSS, no JS. */}
        <div
          className="absolute inset-0 drift pointer-events-none"
          aria-hidden="true"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.35 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
            mixBlendMode: "soft-light",
            opacity: 0.4,
          }}
        />
        {/* Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(120% 90% at 50% 40%, transparent 55%, rgba(0,0,0,0.55) 100%)",
          }}
        />
      </div>

      {/* Top-right chapter meta */}
      <div className="absolute top-24 md:top-28 right-gutter md:right-gutter-md lg:right-gutter-lg text-right z-10">
        <p
          className="font-mono text-mono-xs uppercase tracking-caps-lg"
          style={{ color: "rgba(232,226,214,0.65)" }}
        >
          <span className="block">chapter — i</span>
          <span className="block mt-1">mmxxv</span>
        </p>
      </div>

      {/* Left-edge vertical caption */}
      <div className="hidden md:block absolute left-6 lg:left-8 top-1/2 -translate-y-1/2 z-10">
        <p
          className="vtype font-mono text-mono-xs uppercase tracking-caps-xl"
          style={{ color: "rgba(232,226,214,0.55)" }}
        >
          akilah · mali ·{" "}
          <span style={{ color: "rgba(232,226,214,0.8)" }}>est. 2025</span>
        </p>
      </div>

      {/* Wordmark + tagline */}
      <div className="absolute inset-x-0 bottom-0 z-10">
        <div className="mx-auto max-w-page px-gutter md:px-gutter-md lg:px-gutter-lg pb-10 md:pb-14 lg:pb-16">
          <Reveal as="h1">
            <span
              className="font-display block leading-[0.82] tracking-display select-none"
              style={{
                fontSize: "var(--text-display-xl)",
                color: "var(--color-cream)",
                textShadow: "0 1px 0 rgba(0,0,0,0.15)",
              }}
            >
              MALI
            </span>
          </Reveal>
          <Reveal delay={180}>
            <div className="mt-4 md:mt-5 flex items-end justify-between gap-6">
              <p
                className="font-display italic text-[22px] md:text-[28px] lg:text-[32px] leading-none"
                style={{ color: "var(--color-cream)" }}
              >
                been there once,
                <span className="block opacity-70 mt-1">
                  and i can&rsquo;t go back.
                </span>
              </p>
              <div
                className="hidden md:flex items-center gap-2 font-mono text-mono-xs uppercase tracking-caps-lg pb-2"
                style={{ color: "rgba(232,226,214,0.65)" }}
                aria-hidden="true"
              >
                <span>scroll</span>
                <span
                  className="block w-10 h-px"
                  style={{ background: "rgba(232,226,214,0.65)" }}
                />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
