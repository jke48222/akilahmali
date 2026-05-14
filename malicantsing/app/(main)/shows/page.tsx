import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { NotifyForm } from "@/components/shows/NotifyForm";
import { getPageBySlug, getUpcomingShows, type ShowItem } from "@/lib/queries";
import { STATIC_CONTACT_EMAIL } from "@/lib/static-content";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("shows");
  const description =
    page?.meta?.description ??
    "Live dates from MALI. Drop your email to be the first to know when shows are announced.";
  return {
    title: page?.meta?.title ?? page?.title ?? "Shows",
    description,
    alternates: { canonical: "/shows" },
    openGraph: {
      title: `${page?.title ?? "Shows"} — MALI`,
      description,
      url: "/shows",
    },
  };
}

/* -------------------------------------------------------------------------
   Display helpers
   ------------------------------------------------------------------------- */
const DAY_NAMES = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function formatShowDate(iso: string): { compact: string; dow: string } {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { compact: iso, dow: "" };
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return { compact: `${dd}.${mm}.${yy}`, dow: DAY_NAMES[d.getDay()] };
}

function isSoldOut(s: ShowItem): boolean {
  return s.status === "soldOut" || s.status === "cancelled";
}

function ticketLabel(s: ShowItem): string {
  switch (s.status) {
    case "soldOut": return "sold out";
    case "cancelled": return "cancelled";
    case "tba": return "details soon";
    case "onSale": return "tickets";
    default: return "tickets";
  }
}

/* -------------------------------------------------------------------------
   Page
   ------------------------------------------------------------------------- */
export default async function ShowsPage() {
  const shows = (await getUpcomingShows()) ?? [];

  // When Sanity is not configured `getUpcomingShows` returns null;
  // when configured but empty, it returns []. Both render the empty state.
  const hasShows = shows.length > 0;
  const totalAnnounced = shows.filter(
    (s) => s.status === "announced" || s.status === "onSale" || s.status === "soldOut",
  ).length;

  return (
    <>
      <PageHeader
        index="00 / live"
        meta={hasShows ? `${totalAnnounced} announced` : "0 announced — ∞ possible"}
        title="Shows"
        subhead={
          hasShows ? (
            <>
              upcoming — when there&rsquo;s upcoming.
              <br />
              past — coming, when there&rsquo;s past.
            </>
          ) : (
            <>
              upcoming — when there&rsquo;s upcoming.
              <br />
              past — coming, when there&rsquo;s past.
            </>
          )
        }
      />

      {hasShows ? <FilledState shows={shows} /> : <EmptyState />}
    </>
  );
}

/* -------------------------------------------------------------------------
   Empty state
   ------------------------------------------------------------------------- */
function EmptyState() {
  return (
    <section className="relative" aria-labelledby="shows-empty-heading">
      <div className="mx-auto max-w-page px-gutter md:px-gutter-md lg:px-gutter-lg mt-16 md:mt-24">
        <div className="h-px w-full bg-rule" aria-hidden="true" />
        <div
          className="flex flex-col items-center justify-center text-center px-2 py-24 md:py-40 lg:py-48"
          style={{ minHeight: "60svh" }}
        >
          <Reveal>
            <p className="font-mono text-mono-xs uppercase tracking-caps-xl mb-10 md:mb-14 text-ink-3">
              status — quiet
            </p>
          </Reveal>

          <Reveal delay={120}>
            <h2
              id="shows-empty-heading"
              className="font-display italic leading-[1.02] tracking-mark"
              style={{ fontSize: "clamp(56px, 8vw, 132px)" }}
            >
              no shows
              <br />
              <span className="text-ink-2">announced.</span>
            </h2>
          </Reveal>

          <Reveal delay={220}>
            <div
              className="mt-12 md:mt-14 w-32 h-px overflow-hidden"
              aria-hidden="true"
              style={{ background: "var(--color-ink-3)" }}
            >
              <div className="breath h-full bg-ink" />
            </div>
          </Reveal>

          <Reveal delay={300}>
            <p className="mt-12 md:mt-14 font-mono text-mono-sm uppercase tracking-caps-lg text-ink-2">
              drop your email — you&rsquo;ll be the first to know.
            </p>
          </Reveal>

          <Reveal delay={380}>
            <div className="mt-8 md:mt-10 w-full" style={{ maxWidth: "520px" }}>
              <NotifyForm />
            </div>
          </Reveal>

          <Reveal delay={480}>
            <div className="mt-14 md:mt-16 max-w-[44ch] font-mono text-mono-sm uppercase tracking-caps leading-[1.9] text-ink-2">
              and if you want her in your city — say so.
              <br />
              <a
                href={`mailto:${STATIC_CONTACT_EMAIL}?subject=show%20suggestion%20%E2%80%94%20your%20city`}
                className="ulink mt-2 inline-block text-accent"
              >
                {STATIC_CONTACT_EMAIL} &nbsp;·&nbsp; subject: your city
              </a>
            </div>
          </Reveal>
        </div>
        <div className="h-px w-full bg-rule" aria-hidden="true" />
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------
   Filled state
   ------------------------------------------------------------------------- */
function FilledState({ shows }: { shows: ShowItem[] }) {
  return (
    <section className="relative" aria-labelledby="shows-list-heading">
      <div className="mx-auto max-w-page px-gutter md:px-gutter-md lg:px-gutter-lg mt-16 md:mt-24">
        <Reveal>
          <div className="flex items-baseline gap-4 font-mono text-mono-xs uppercase tracking-caps-lg text-ink-3">
            <span>upcoming</span>
            <span className="block h-px flex-1 bg-rule" aria-hidden="true" />
            <span>{shows.length} dates</span>
          </div>
        </Reveal>

        <h2 id="shows-list-heading" className="sr-only">
          Upcoming shows
        </h2>

        <Reveal delay={120}>
          <ul className="mt-10 md:mt-14 border-t border-ink list-none p-0">
            {shows.map((s) => {
              const { compact, dow } = formatShowDate(s.date);
              const sold = isSoldOut(s);
              const label = ticketLabel(s);
              const hasUrl = Boolean(s.ticketUrl) && !sold;
              const Inner = (
                <>
                  <div className="col-span-4 md:col-span-3 font-mono uppercase tracking-[0.06em] tabular-nums text-ink">
                    <span className="text-[18px] md:text-[22px]">{compact}</span>
                    <span className="ml-2 text-mono-xs tracking-caps-md text-ink-3">
                      · {dow}
                    </span>
                  </div>
                  <div className="col-span-8 md:col-span-6">
                    <div
                      className="font-display italic leading-[0.95]"
                      style={{ fontSize: "clamp(24px, 2.6vw, 36px)" }}
                    >
                      {s.city}
                      {s.country && s.country !== "USA" ? `, ${s.country}` : ""}
                    </div>
                    <div className="mt-1 font-mono text-mono-xs uppercase tracking-caps text-ink-2">
                      {s.venue}
                      {s.billing ? (
                        <>
                          {" "}
                          &nbsp;·&nbsp;{" "}
                          <span className="text-ink-3">{s.billing}</span>
                        </>
                      ) : null}
                    </div>
                  </div>
                  <div
                    className={`col-span-12 md:col-span-3 md:text-right font-mono text-mono-sm uppercase tracking-caps-md inline-flex items-baseline gap-2 md:justify-end ${sold ? "text-ink-3" : "text-ink"}`}
                  >
                    <span className={sold ? "" : "ulink"}>{label}</span>
                    {hasUrl ? (
                      <span className="text-ink-2" aria-hidden="true">
                        <ArrowUpRight size={14} strokeWidth={1.1} />
                      </span>
                    ) : null}
                  </div>
                </>
              );
              return (
                <li key={s._id} className="border-b border-rule">
                  {hasUrl ? (
                    <a
                      href={s.ticketUrl!}
                      rel="noopener"
                      target="_blank"
                      className="grid grid-cols-12 gap-4 md:gap-6 items-baseline py-5 md:py-7 group"
                    >
                      {Inner}
                    </a>
                  ) : (
                    <div
                      className="grid grid-cols-12 gap-4 md:gap-6 items-baseline py-5 md:py-7"
                      aria-disabled={sold ? true : undefined}
                    >
                      {Inner}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </Reveal>

        <Reveal delay={260}>
          <div className="mt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 font-mono text-mono-xs uppercase tracking-caps-md text-ink-3">
            <span>last updated — when dates land.</span>
            <a
              href={`mailto:${STATIC_CONTACT_EMAIL}?subject=show%20suggestion%20%E2%80%94%20your%20city`}
              className="ulink inline-flex items-center gap-2"
            >
              suggest a city <ArrowUpRight size={12} strokeWidth={1.1} aria-hidden="true" />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
