import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { SectionLabel } from "@/components/home/SectionLabel";
import { PortableTextBody } from "@/components/PortableTextBody";
import { LightboxGallery, type GalleryItem } from "@/components/LightboxGallery";
import { NavThemeSentinel } from "@/components/NavThemeSentinel";
import { getPageBySlug, getSettings } from "@/lib/queries";
import {
  STATIC_BIO_PARAGRAPHS,
  STATIC_GALLERY,
  STATIC_PULL_QUOTE,
  STATIC_SOCIAL_LINKS,
  STATIC_CONTACT_EMAIL,
} from "@/lib/static-content";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("about");
  const description =
    page?.meta?.description ??
    "MALI is a singer and songwriter — about page, photography, contact.";
  return {
    title: page?.meta?.title ?? page?.title ?? "About",
    description,
    alternates: { canonical: "/about" },
    openGraph: {
      title: `${page?.title ?? "About"} — MALI`,
      description,
      url: "/about",
      type: "profile",
    },
  };
}

export default async function AboutPage() {
  const [page, settings] = await Promise.all([
    getPageBySlug("about"),
    getSettings(),
  ]);

  const pullQuote = {
    line1: settings?.aboutPullQuote?.line1 ?? STATIC_PULL_QUOTE.line1,
    line2: settings?.aboutPullQuote?.line2 ?? STATIC_PULL_QUOTE.line2,
    attribution:
      settings?.aboutPullQuote?.attribution ?? STATIC_PULL_QUOTE.attribution,
  };

  const social = {
    instagram: settings?.socialLinks?.instagram ?? STATIC_SOCIAL_LINKS.instagram,
    tiktok: settings?.socialLinks?.tiktok ?? STATIC_SOCIAL_LINKS.tiktok,
    youtube: settings?.socialLinks?.youtube ?? STATIC_SOCIAL_LINKS.youtube,
    spotify: settings?.listenLinks?.spotify ?? "",
  };
  const generalEmail = settings?.contactEmails?.general ?? STATIC_CONTACT_EMAIL;

  // Gallery items: prefer Sanity images embedded in body, fall back to static gradients.
  const gallery: GalleryItem[] = STATIC_GALLERY.map((g) => ({
    kind: g.kind,
    src: g.src,
    fieldClass: g.fieldClass,
    label: g.label,
    caption: g.caption,
    pos: g.pos,
  }));

  return (
    <>
      {/* Lead photo — full-bleed dark scrim */}
      <section className="relative w-full">
        <NavThemeSentinel height="70svh" />
        <div className="relative lead-ar w-full field ph-mirror">
          <div className="absolute inset-0 lead-scrim pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 pb-8 md:pb-12 lg:pb-14">
            <div className="mx-auto max-w-page px-gutter md:px-gutter-md lg:px-gutter-lg grid grid-cols-12 gap-3 items-end">
              <p
                className="col-span-7 md:col-span-6 font-mono text-mono-xs uppercase tracking-caps-lg"
                style={{ color: "rgba(232,226,214,0.78)" }}
              >
                akilah mali · b. 2001
              </p>
              <p
                className="col-span-5 md:col-span-6 md:text-right font-mono text-mono-xs uppercase tracking-caps-lg"
                style={{ color: "rgba(232,226,214,0.6)" }}
              >
                photo · ll, 2025 · brooklyn
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Title block — narrow column */}
      <section className="relative">
        <div className="mx-auto max-w-page px-gutter md:px-gutter-md lg:px-gutter-lg pt-20 md:pt-28">
          <Reveal>
            <div className="mx-auto" style={{ maxWidth: "620px" }}>
              <SectionLabel index="00 / a short bio" label="~ 90 seconds" />
              <h1
                className="font-display leading-[0.86] tracking-display mt-8"
                style={{ fontSize: "clamp(80px, 11vw, 168px)" }}
              >
                A girl, <br />
                <span className="italic text-ink-2">and a few songs</span>
                <span className="text-ink-3">.</span>
              </h1>
              <p className="mt-5 font-mono text-mono-xs uppercase tracking-caps-md text-ink-3">
                about &nbsp;·&nbsp; mali &nbsp;·&nbsp; v.01
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Bio — Sanity body if available; static paragraphs otherwise */}
      <section className="relative">
        <div className="mx-auto max-w-page px-gutter md:px-gutter-md lg:px-gutter-lg pt-14 md:pt-20">
          <div className="mx-auto" style={{ maxWidth: "620px" }}>
            {page?.body && page.body.length > 0 ? (
              <Reveal>
                <PortableTextBody value={page.body} className="dropcap" />
              </Reveal>
            ) : (
              STATIC_BIO_PARAGRAPHS.map((p, i) => (
                <Reveal key={i} delay={i * 120}>
                  <p
                    className={`text-[17px] md:text-[18px] leading-[1.7] ${i === 0 ? "dropcap text-ink mt-0" : "mt-7 text-ink-2"}`}
                  >
                    {p}
                  </p>
                </Reveal>
              ))
            )}

            <Reveal delay={280}>
              <div className="mt-10 flex items-center gap-3 font-mono text-mono-xs uppercase tracking-caps-md text-ink-3">
                <span className="inline-block h-px w-10 bg-rule" aria-hidden="true" />
                <span>written by mali</span>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Pull quote */}
      <section className="relative">
        <div className="mx-auto max-w-page px-gutter md:px-gutter-md lg:px-gutter-lg pt-section md:pt-section-xl">
          <div className="mx-auto text-center" style={{ maxWidth: "920px" }}>
            <Reveal>
              <p
                className="font-display italic leading-[1.05] tracking-mark"
                style={{ fontSize: "clamp(40px, 6.2vw, 92px)" }}
              >
                <span className="text-ink-3">&ldquo;</span>
                {pullQuote.line1}
                <br />
                {pullQuote.line2}
                <span className="text-ink-3">&rdquo;</span>
              </p>
            </Reveal>
            <Reveal delay={140}>
              <p className="mt-8 font-mono text-mono-xs uppercase tracking-caps-lg text-ink-3">
                — from {pullQuote.attribution}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="relative" aria-labelledby="about-gallery">
        <div className="mx-auto max-w-page px-gutter md:px-gutter-md lg:px-gutter-lg pt-section md:pt-section-xl">
          <Reveal>
            <SectionLabel index="02 / gallery" label="six frames · click to expand" />
          </Reveal>
          <h2 id="about-gallery" className="sr-only">Gallery</h2>
          <LightboxGallery items={gallery} />
          <Reveal delay={200}>
            <p className="mt-6 font-mono text-mono-xs uppercase tracking-caps-md text-ink-3">
              photos: mali + collaborators. all images © 2025 akilah mali.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Closing */}
      <section className="relative">
        <div className="mx-auto max-w-page px-gutter md:px-gutter-md lg:px-gutter-lg pt-section md:pt-section-xl">
          <div className="mx-auto" style={{ maxWidth: "620px" }}>
            <Reveal>
              <div className="font-mono text-mono-sm uppercase tracking-caps-md leading-[2.1] text-ink-2">
                <div>
                  <span className="text-ink-3">say hi —</span>{" "}
                  <a href={`mailto:${generalEmail}`} className="ulink text-ink">
                    {generalEmail}
                  </a>
                </div>
                <div>
                  <span className="text-ink-3">elsewhere —</span>{" "}
                  {social.instagram ? (
                    <>
                      <a href={social.instagram} rel="noopener" className="ulink">
                        instagram
                      </a>{" "}
                      ·{" "}
                    </>
                  ) : null}
                  {social.tiktok ? (
                    <>
                      <a href={social.tiktok} rel="noopener" className="ulink">
                        tiktok
                      </a>{" "}
                      ·{" "}
                    </>
                  ) : null}
                  {social.youtube ? (
                    <>
                      <a href={social.youtube} rel="noopener" className="ulink">
                        youtube
                      </a>{" "}
                      ·{" "}
                    </>
                  ) : null}
                  {social.spotify ? (
                    <a href={social.spotify} rel="noopener" className="ulink">
                      spotify
                    </a>
                  ) : null}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
