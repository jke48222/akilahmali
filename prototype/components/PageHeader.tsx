import { Reveal } from "./Reveal";
import { SectionLabel } from "./home/SectionLabel";

type PageHeaderProps = {
  /** Index label, e.g. "00 / index" */
  index: string;
  /** Right-side meta on the rule, e.g. "three releases · 2025" */
  meta: string;
  /** Display title (defaults to giant clamp size from designs). */
  title: string;
  /** Right-aligned subhead column under the title. */
  subhead?: React.ReactNode;
  className?: string;
};

/**
 * Shared page-top header used by /music, /videos, and editorial routes.
 * Matches the artifact pattern: index marker, giant display title (col 8),
 * mono description (col 4).
 */
export function PageHeader({
  index,
  meta,
  title,
  subhead,
  className = "",
}: PageHeaderProps) {
  return (
    <section className={`relative pt-32 md:pt-40 lg:pt-44 ${className}`.trim()}>
      <div className="mx-auto max-w-page px-gutter md:px-gutter-md lg:px-gutter-lg">
        <Reveal>
          <SectionLabel index={index} label={meta} />
        </Reveal>

        <div className="mt-8 md:mt-10 grid grid-cols-12 gap-6 md:gap-10 items-end">
          <Reveal as="div" className="col-span-12 md:col-span-8">
            <h1
              className="font-display leading-[0.9] tracking-display"
              style={{ fontSize: "clamp(96px, 14vw, 220px)" }}
            >
              {title}
            </h1>
          </Reveal>
          {subhead ? (
            <Reveal as="div" delay={120} className="col-span-12 md:col-span-4 md:pb-4">
              <p className="font-mono text-mono-sm uppercase tracking-caps-md leading-[1.8] text-ink-2">
                {subhead}
              </p>
            </Reveal>
          ) : null}
        </div>
      </div>
    </section>
  );
}
