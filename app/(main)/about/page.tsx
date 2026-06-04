import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { PortableTextBody } from "@/components/PortableTextBody";
import { LightboxGallery, type GalleryItem } from "@/components/LightboxGallery";
import { NavThemeSentinel } from "@/components/NavThemeSentinel";
import { getPageBySlug, getSettings } from "@/lib/queries";
import {
  STATIC_BIO_PARAGRAPHS,
  STATIC_GALLERY,
  STATIC_PULL_QUOTE,
  STATIC_SOCIAL_LINKS,
  STATIC_LISTEN_LINKS,
  STATIC_CONTACT_EMAIL,
} from "@/lib/static-content";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("about");
  const description =
    page?.meta?.description ?? "Akilah Mali · singer and songwriter from Atlanta, GA.";
  return {
    title: page?.meta?.title ?? page?.title ?? "About",
    description,
    alternates: { canonical: "/about" },
    openGraph: {
      title: `${page?.title ?? "About"} · Akilah Mali`,
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
    spotify: settings?.listenLinks?.spotify ?? STATIC_LISTEN_LINKS.spotify,
  };
  const generalEmail = settings?.contactEmails?.general ?? STATIC_CONTACT_EMAIL;

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
      {/* Lead photo */}
      <section className="relative w-full">
        <NavThemeSentinel height="70svh" />
        <div className="relative lead-ar w-full field">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/mali-portrait.jpg"
            alt="akilah mali · portrait"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: "50% 28%", filter: "saturate(0.95) contrast(1.02)" }}
            decoding="async"
          />
          <div className="absolute inset-0 lead-scrim pointer-events-none" />
        </div>
      </section>

      {/* Title */}
      <section className="relative">
        <div className="mx-auto max-w-page px-gutter md:px-gutter-md lg:px-gutter-lg pt-16 md:pt-20">
          <Reveal>
            <div className="mx-auto" style={{ maxWidth: "620px" }}>
              <h1
                className="font-display leading-[0.86] tracking-display"
                style={{ fontSize: "clamp(64px, 9vw, 140px)" }}
              >
                Singer <br />
                <span className="italic text-ink-2">and songwriter</span>
                <span className="text-ink-3">.</span>
              </h1>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Bio */}
      <section className="relative">
        <div className="mx-auto max-w-page px-gutter md:px-gutter-md lg:px-gutter-lg pt-10 md:pt-14">
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
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="relative" aria-labelledby="about-gallery">
        <div className="mx-auto max-w-page px-gutter md:px-gutter-md lg:px-gutter-lg pt-section md:pt-section-xl">
          <h2 id="about-gallery" className="sr-only">Gallery</h2>
          <LightboxGallery items={gallery} />
        </div>
      </section>

      {/* Closing */}
      <section className="relative">
        <div className="mx-auto max-w-page px-gutter md:px-gutter-md lg:px-gutter-lg pt-section md:pt-section-xl">
          <div className="mx-auto" style={{ maxWidth: "620px" }}>
            <Reveal>
              <div className="font-mono text-mono-sm uppercase tracking-caps-md leading-[2.1] text-ink-2">
                <div>
                  <a href={`mailto:${generalEmail}`} className="ulink text-ink">
                    {generalEmail}
                  </a>
                </div>
                <div className="mt-1">
                  {social.instagram ? (
                    <>
                      <a href={social.instagram} rel="noopener" className="ulink">
                        instagram
                      </a>{" · "}
                    </>
                  ) : null}
                  {social.tiktok ? (
                    <>
                      <a href={social.tiktok} rel="noopener" className="ulink">
                        tiktok
                      </a>{" · "}
                    </>
                  ) : null}
                  {social.youtube ? (
                    <>
                      <a href={social.youtube} rel="noopener" className="ulink">
                        youtube
                      </a>{" · "}
                    </>
                  ) : null}
                  {social.spotify ? (
                    <>
                      <a href={social.spotify} rel="noopener" className="ulink">
                        spotify
                      </a>{" · "}
                    </>
                  ) : null}
                  <a href="https://www.linkedin.com/in/akilah-brown-069b24341/" rel="noopener" className="ulink">
                    linkedin
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
