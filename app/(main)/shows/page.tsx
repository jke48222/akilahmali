import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { NotifyForm } from "@/components/shows/NotifyForm";
import { ShowsList } from "@/components/shows/ShowsList";
import { getUpcomingShows } from "@/lib/queries";

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

export default async function ShowsPage() {
  const shows = (await getUpcomingShows()) ?? [];
  const hasShows = shows.length > 0;

  return (
    <>
      <PageHeader title="Shows" />
      {hasShows ? <ShowsList shows={shows} /> : <EmptyState />}
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

