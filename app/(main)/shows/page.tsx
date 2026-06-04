import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { NotifyForm } from "@/components/shows/NotifyForm";
import { getUpcomingShows, type ShowItem } from "@/lib/queries";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Shows",
  description: "Live dates from Akilah Mali.",
  alternates: { canonical: "/shows" },
  openGraph: {
    title: "Shows · Akilah Mali",
    description: "Live dates from Akilah Mali.",
    url: "/shows",
    images: ["/opengraph-image"],
  },
};

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
    default: return "tickets";
  }
}

export default async function ShowsPage() {
  const shows = (await getUpcomingShows()) ?? [];
  const hasShows = shows.length > 0;

  return (
    <>
      <PageHeader title="Shows" />
      {hasShows ? <FilledState shows={shows} /> : <EmptyState />}
    </>
  );
}

function EmptyState() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-page px-gutter md:px-gutter-md lg:px-gutter-lg mt-10 md:mt-16">
        <Reveal>
          <p className="text-[16px] text-ink-2">
            no shows announced yet — drop your email to be the first to know.
          </p>
        </Reveal>
        <Reveal delay={120}>
          <div className="mt-8 w-full" style={{ maxWidth: "520px" }}>
            <NotifyForm />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function FilledState({ shows }: { shows: ShowItem[] }) {
  return (
    <section className="relative" aria-labelledby="shows-list-heading">
      <div className="mx-auto max-w-page px-gutter md:px-gutter-md lg:px-gutter-lg mt-10 md:mt-16">
        <h2 id="shows-list-heading" className="sr-only">
          Upcoming shows
        </h2>
        <Reveal>
          <ul className="border-t border-ink list-none p-0">
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
                        <> &nbsp;·&nbsp; <span className="text-ink-3">{s.billing}</span></>
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
                    <div className="grid grid-cols-12 gap-4 md:gap-6 items-baseline py-5 md:py-7">
                      {Inner}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
