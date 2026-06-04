import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { ContactForm } from "@/components/ContactForm";
import {
  InstagramIcon,
  TikTokIcon,
  YouTubeIcon,
} from "@/components/icons";
import { Reveal } from "@/components/Reveal";
import { getSettings } from "@/lib/queries";
import { STATIC_SOCIAL_LINKS } from "@/lib/static-content";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Akilah Mali.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact · Akilah Mali",
    description: "Get in touch with Akilah Mali.",
    url: "/contact",
    images: ["/opengraph-image"],
  },
};

export default async function ContactPage() {
  const settings = await getSettings();
  const social = {
    instagram: settings?.socialLinks?.instagram ?? STATIC_SOCIAL_LINKS.instagram,
    tiktok: settings?.socialLinks?.tiktok ?? STATIC_SOCIAL_LINKS.tiktok,
    youtube: settings?.socialLinks?.youtube ?? STATIC_SOCIAL_LINKS.youtube,
  };

  return (
    <>
      <PageHeader title="Contact" />

      <section className="relative">
        <div className="mx-auto max-w-page px-gutter md:px-gutter-md lg:px-gutter-lg mt-10 md:mt-16">
          <div className="grid grid-cols-12 gap-6 md:gap-10">
            <Reveal as="div" className="col-span-12 md:col-span-7">
              <ContactForm />
            </Reveal>

            <Reveal as="div" delay={120} className="col-span-12 md:col-span-4 md:col-start-9 md:pt-2">
              <div className="font-mono text-mono-sm uppercase tracking-caps-md leading-[2] text-ink-2">
                <div className="flex flex-wrap gap-x-5 gap-y-2">
                  {social.instagram ? (
                    <a
                      href={social.instagram}
                      rel="noopener"
                      className="ulink inline-flex items-center gap-2"
                    >
                      <InstagramIcon width="14" height="14" /> instagram
                    </a>
                  ) : null}
                  {social.tiktok ? (
                    <a
                      href={social.tiktok}
                      rel="noopener"
                      className="ulink inline-flex items-center gap-2"
                    >
                      <TikTokIcon width="14" height="14" /> tiktok
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
