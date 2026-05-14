import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import {
  InstagramIcon,
  TikTokIcon,
  YouTubeIcon,
} from "@/components/icons";
import { getPageBySlug, getSettings } from "@/lib/queries";
import {
  STATIC_BUCKETS,
  STATIC_CONTACT_EMAIL,
  STATIC_SOCIAL_LINKS,
  type ContactBucket,
} from "@/lib/static-content";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("contact");
  const description =
    page?.meta?.description ??
    "Direct contact for MALI — general, booking, sync, and press.";
  return {
    title: page?.meta?.title ?? page?.title ?? "Contact",
    description,
    alternates: { canonical: "/contact" },
    openGraph: {
      title: `${page?.title ?? "Contact"} — MALI`,
      description,
      url: "/contact",
    },
  };
}

function bucketsFromSettings(
  settings: Awaited<ReturnType<typeof getSettings>>,
): ContactBucket[] {
  if (!settings?.contactEmails) return STATIC_BUCKETS;
  const fallback =
    settings.contactEmails.general ??
    settings.contactEmails.press ??
    STATIC_CONTACT_EMAIL;
  return [
    {
      label: "general",
      sub: "fan mail · everything else",
      email: settings.contactEmails.general ?? STATIC_CONTACT_EMAIL,
    },
    {
      label: "booking",
      sub: "shows, festivals, support slots",
      email: settings.contactEmails.booking ?? null,
      tbd: "not yet represented",
      fallback,
    },
    {
      label: "sync / licensing",
      sub: "film, tv, ad placement",
      email: settings.contactEmails.sync ?? null,
      tbd: "roles tbd",
      fallback,
    },
    {
      label: "press",
      sub: "features, interviews, reviews",
      email: settings.contactEmails.press ?? STATIC_CONTACT_EMAIL,
    },
  ];
}

export default async function ContactPage() {
  const [page, settings] = await Promise.all([
    getPageBySlug("contact"),
    getSettings(),
  ]);
  const buckets = bucketsFromSettings(settings);
  const social = {
    instagram: settings?.socialLinks?.instagram ?? STATIC_SOCIAL_LINKS.instagram,
    tiktok: settings?.socialLinks?.tiktok ?? STATIC_SOCIAL_LINKS.tiktok,
    youtube: settings?.socialLinks?.youtube ?? STATIC_SOCIAL_LINKS.youtube,
  };

  return (
    <>
      <PageHeader
        index="00 / index"
        meta="four channels · one inbox, for now"
        title="Contact"
        subhead={
          <>
            pick the right line.
            <br />
            email only — replies within 48 hours.
          </>
        }
      />

      {/* Buckets */}
      <section className="relative">
        <div className="mx-auto max-w-page px-gutter md:px-gutter-md lg:px-gutter-lg mt-16 md:mt-24 lg:mt-28">
          <ul className="list-none p-0">
            {buckets.map((b, i) => (
              <Reveal as="li" key={b.label}>
                <div className="border-t border-rule">
                  <div className="grid grid-cols-12 gap-4 md:gap-8 py-10 md:py-14 lg:py-16 items-start">
                    <div className="col-span-12 md:col-span-3 lg:col-span-3">
                      <div className="font-mono text-mono-xs uppercase tracking-caps-lg text-ink-3">
                        <span>{String(i + 1).padStart(2, "0")}</span>{" "}
                        &nbsp;·&nbsp;{" "}
                        <span className="text-ink-2">{b.label}</span>
                      </div>
                      <div className="mt-2 font-mono text-mono-xs uppercase tracking-caps text-ink-3">
                        {b.sub}
                      </div>
                    </div>
                    <div className="col-span-12 md:col-span-9">
                      {b.email ? (
                        <a href={`mailto:${b.email}`} className="group block">
                          <div
                            className="font-display italic leading-[0.92] tracking-mark break-words flex items-baseline gap-4 flex-wrap"
                            style={{ fontSize: "clamp(38px, 6vw, 96px)" }}
                          >
                            <span className="ulink ulink-on">{b.email}</span>
                            <span
                              className="arrow inline-flex items-baseline text-ink-2"
                              aria-hidden="true"
                            >
                              <ArrowRight size={36} strokeWidth={1.2} />
                            </span>
                          </div>
                        </a>
                      ) : (
                        <div>
                          <div
                            className="font-display italic leading-[0.92] tracking-mark text-ink-3"
                            style={{ fontSize: "clamp(38px, 6vw, 96px)" }}
                          >
                            [ {b.tbd} ]
                          </div>
                          <div className="mt-4 font-mono text-mono-sm uppercase tracking-caps flex items-baseline gap-3 text-ink-2">
                            <span className="text-ink-3">for now —</span>
                            <a
                              href={`mailto:${b.fallback ?? STATIC_CONTACT_EMAIL}`}
                              className="ulink text-ink"
                            >
                              {b.fallback ?? STATIC_CONTACT_EMAIL}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </ul>
          <div className="border-t border-rule" aria-hidden="true" />
        </div>
      </section>

      {/* End note */}
      <section className="relative">
        <div className="mx-auto max-w-page px-gutter md:px-gutter-md lg:px-gutter-lg pt-20 md:pt-28">
          <div className="grid grid-cols-12 gap-6 md:gap-10">
            <Reveal as="div" className="col-span-12 md:col-span-7">
              <p
                className="font-display italic leading-[1.35] max-w-[36ch] text-ink-2"
                style={{ fontSize: "clamp(22px, 2.6vw, 30px)" }}
              >
                no contact form. no agent yet. roles fill in as they do — this
                page updates when they do.
              </p>
            </Reveal>
            <Reveal as="div" delay={120} className="col-span-12 md:col-span-4 md:col-start-9 md:pt-2">
              <div className="font-mono text-mono-sm uppercase tracking-caps-md leading-[2] text-ink-2">
                <div>
                  <span className="text-ink-3">elsewhere —</span>
                </div>
                <div className="mt-1 flex flex-wrap gap-x-5 gap-y-2">
                  {social.instagram ? (
                    <a
                      href={social.instagram}
                      rel="noopener"
                      className="ulink inline-flex items-center gap-2"
                    >
                      <InstagramIcon width="14" height="14" /> @malicantsing
                    </a>
                  ) : null}
                  {social.tiktok ? (
                    <a
                      href={social.tiktok}
                      rel="noopener"
                      className="ulink inline-flex items-center gap-2"
                    >
                      <TikTokIcon width="14" height="14" /> @malicantsing
                    </a>
                  ) : null}
                  {social.youtube ? (
                    <a
                      href={social.youtube}
                      rel="noopener"
                      className="ulink inline-flex items-center gap-2"
                    >
                      <YouTubeIcon width="14" height="14" /> youtube
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
