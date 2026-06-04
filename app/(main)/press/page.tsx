import type { Metadata } from "next";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { SectionLabel } from "@/components/home/SectionLabel";
import { CopyButton } from "@/components/CopyButton";
import {
  getAllPress,
  getPageBySlug,
  getSettings,
  type PressAsset,
} from "@/lib/queries";
import { portableTextToPlain } from "@/lib/portable-text";
import {
  STATIC_CONTACT_EMAIL,
  STATIC_PRESS_KIT,
  formatReleaseDate,
} from "@/lib/static-content";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("press");
  const description =
    page?.meta?.description ??
    "Press kit for Akilah Mali · hi-res photos, one-sheet bio, wordmark, and press contact.";
  return {
    title: page?.meta?.title ?? page?.title ?? "Press",
    description,
    alternates: { canonical: "/press" },
    openGraph: {
      title: `${page?.title ?? "Press"} · Akilah Mali`,
      description,
      url: "/press",
      images: ["/opengraph-image"],
    },
  };
}

type DisplayAsset = {
  name: string;
  description: string;
  type: string;
  size: string;
  url: string | null;
};

function toDisplayAsset(a: PressAsset): DisplayAsset {
  return {
    name: a.name,
    description: a.description ?? "",
    type: a.fileType ?? "file",
    size: a.fileSize ?? "",
    url: a.url ?? null,
  };
}

export default async function PressPage() {
  const [settings, press] = await Promise.all([getSettings(), getAllPress()]);

  const pressEmail =
    settings?.contactEmails?.press ??
    settings?.contactEmails?.general ??
    STATIC_CONTACT_EMAIL;

  const assets: DisplayAsset[] =
    settings?.pressKit && settings.pressKit.length > 0
      ? settings.pressKit.map(toDisplayAsset)
      : STATIC_PRESS_KIT.map((a) => ({
          name: a.name,
          description: a.description,
          type: a.type,
          size: a.size,
          url: null,
        }));

  const bundleHref = settings?.pressBundle?.url ?? null;

  return (
    <>
      <PageHeader title="Press" />

      {/* Contact block */}
      <section className="relative">
        <div className="mx-auto max-w-page px-gutter md:px-gutter-md lg:px-gutter-lg pt-20 md:pt-28">
          <Reveal>
            <SectionLabel label="contact" />
          </Reveal>
          <div className="mt-8 md:mt-12 grid grid-cols-12 gap-6 md:gap-10 items-end">
            <Reveal as="div" className="col-span-12 md:col-span-9">
              <a href={`mailto:${pressEmail}`} className="block group">
                <div
                  className="font-display italic leading-[0.95] tracking-mark break-words"
                  style={{ fontSize: "clamp(38px, 6.4vw, 96px)" }}
                >
                  <span className="ulink ulink-on">{pressEmail}</span>
                </div>
              </a>
            </Reveal>
            <Reveal as="div" delay={140} className="col-span-12 md:col-span-3 md:pb-3">
              <CopyButton value={pressEmail} />
            </Reveal>
          </div>

          <Reveal delay={200}>
            <div className="mt-10 md:mt-12 grid grid-cols-12 gap-6 md:gap-10">
              <p className="col-span-12 md:col-span-6 lg:col-span-5 text-[15px] leading-[1.65] text-ink-2">
                include outlet, deadline, and scope. akilah mali manages her own press
                at v.01 · replies typically within 48 hours.
              </p>
              <dl className="col-span-12 md:col-span-5 md:col-start-8 grid grid-cols-2 gap-y-1 gap-x-6 font-mono text-[11px] leading-[1.9] text-ink-3">
                <dt className="text-ink-2">booking</dt>
                <dd>{settings?.contactEmails?.booking ?? "not yet represented"}</dd>
                <dt className="text-ink-2">sync · licensing</dt>
                <dd>
                  <a
                    href={`mailto:${settings?.contactEmails?.sync ?? pressEmail}`}
                    className="ulink text-ink"
                  >
                    {settings?.contactEmails?.sync ?? pressEmail}
                  </a>
                </dd>
                <dt className="text-ink-2">management</dt>
                <dd>self-managed</dd>
                <dt className="text-ink-2">publishing</dt>
                <dd>akilah mali · self-released</dd>
              </dl>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Assets table */}
      <section className="relative" aria-labelledby="press-kit-heading">
        <div className="mx-auto max-w-page px-gutter md:px-gutter-md lg:px-gutter-lg pt-section md:pt-section-xl">
          <Reveal>
            <SectionLabel label="press kit" />
          </Reveal>
          <h2 id="press-kit-heading" className="sr-only">
            Press kit downloads
          </h2>
          <Reveal delay={100}>
            <div className="mt-10 md:mt-14">
              <div className="hidden md:grid grid-cols-12 gap-4 pb-3 font-mono text-mono-xs uppercase tracking-caps-lg text-ink-3">
                <div className="col-span-1">no.</div>
                <div className="col-span-5">asset</div>
                <div className="col-span-3">description</div>
                <div className="col-span-1">type</div>
                <div className="col-span-1">size</div>
                <div className="col-span-1 text-right">file</div>
              </div>
              <ul className="border-t border-ink list-none p-0">
                {assets.map((a, i) => {
                  const downloadable = Boolean(a.url);
                  const Inner = (
                    <>
                      <div className="col-span-2 md:col-span-1 font-mono text-[11px] tracking-[0.12em] text-ink-3">
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      <div className="col-span-10 md:col-span-5">
                        <div
                          className="font-display italic"
                          style={{
                            fontSize: "clamp(22px, 2.4vw, 32px)",
                            lineHeight: 1,
                          }}
                        >
                          {a.name}
                        </div>
                        <div className="md:hidden mt-2 font-mono text-mono-xs uppercase tracking-caps text-ink-3">
                          {a.description} &nbsp;·&nbsp; {a.type} · {a.size}
                        </div>
                      </div>
                      <div className="hidden md:block col-span-3 font-mono text-[11px] tracking-[0.06em] text-ink-2">
                        {a.description}
                      </div>
                      <div className="hidden md:block col-span-1 font-mono text-[11px] uppercase tracking-caps-sm text-ink-3">
                        .{a.type}
                      </div>
                      <div className="hidden md:block col-span-1 font-mono text-[11px] tabular-nums text-ink-3">
                        {a.size}
                      </div>
                      <div className="col-span-12 md:col-span-1 md:text-right">
                        <span
                          className={`inline-flex items-center gap-2 font-mono text-mono-sm uppercase tracking-caps ${downloadable ? "text-ink" : "text-ink-3"}`}
                        >
                          <Download size={14} strokeWidth={1.2} aria-hidden="true" />{" "}
                          <span className={downloadable ? "ulink" : ""}>
                            {downloadable ? "download" : "soon"}
                          </span>
                        </span>
                      </div>
                    </>
                  );
                  return (
                    <li key={a.name} className="border-b border-rule">
                      {downloadable ? (
                        <a
                          href={a.url ?? "#"}
                          download
                          rel="noopener"
                          className="grid grid-cols-12 gap-4 items-baseline py-5 md:py-6 group"
                        >
                          {Inner}
                        </a>
                      ) : (
                        <div
                          aria-disabled="true"
                          className="grid grid-cols-12 gap-4 items-baseline py-5 md:py-6 opacity-80"
                        >
                          {Inner}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>

              <div className="mt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <p className="font-mono text-mono-xs uppercase tracking-caps-md text-ink-3">
                  last updated · {new Date().toLocaleString("en-US", { month: "long", year: "numeric" }).toLowerCase()}
                </p>
                {bundleHref ? (
                  <a
                    href={bundleHref}
                    download
                    className="font-mono text-mono-sm uppercase tracking-caps-md inline-flex items-center gap-2 ulink text-accent"
                  >
                    <Download size={14} strokeWidth={1.2} aria-hidden="true" /> entire kit · zip
                  </a>
                ) : (
                  <span className="font-mono text-mono-sm uppercase tracking-caps-md inline-flex items-center gap-2 text-ink-3">
                    <Download size={14} strokeWidth={1.2} aria-hidden="true" /> entire kit · upload pending
                  </span>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Recent press / empty state */}
      <section className="relative">
        <div className="mx-auto max-w-page px-gutter md:px-gutter-md lg:px-gutter-lg pt-section md:pt-section-xl">
          <Reveal>
            <SectionLabel label="coverage"
            />
          </Reveal>
          {press && press.length > 0 ? (
            <ul className="mt-10 md:mt-14 grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 list-none p-0">
              {press.map((p, i) => {
                const quoteText = p.quote ? portableTextToPlain(p.quote) : "";
                return (
                  <Reveal as="li" delay={i * 80} key={p._id}>
                    <a
                      href={p.url}
                      rel="noopener"
                      target="_blank"
                      className="block border border-rule p-6 md:p-8 hover:border-ink transition-colors"
                    >
                      <div className="flex items-baseline justify-between font-mono text-mono-xs uppercase tracking-caps-md text-ink-3">
                        <span>
                          {String(i + 1).padStart(2, "0")} · {p.publication}
                        </span>
                        <span>{formatReleaseDate(p.date, "monthYear")}</span>
                      </div>
                      {quoteText ? (
                        <p
                          className="mt-10 md:mt-14 font-display italic leading-[1.2]"
                          style={{ fontSize: "clamp(22px, 2.6vw, 32px)" }}
                        >
                          &ldquo;{quoteText}&rdquo;
                        </p>
                      ) : (
                        <p
                          className="mt-10 md:mt-14 font-display italic leading-[1.2]"
                          style={{ fontSize: "clamp(22px, 2.6vw, 32px)" }}
                        >
                          {p.articleTitle}
                        </p>
                      )}
                      <p className="mt-6 font-mono text-mono-xs uppercase tracking-caps-md text-ink-3">
                        {p.articleTitle} · {p.publication}
                      </p>
                    </a>
                  </Reveal>
                );
              })}
            </ul>
          ) : (
            <>
              <Reveal delay={120}>
                <p
                  className="mt-8 md:mt-10 font-display italic leading-[1.35] max-w-[34ch] text-ink-2"
                  style={{ fontSize: "clamp(22px, 2.6vw, 30px)" }}
                >
                  no published features yet. when there are, they go here ·
                  verbatim, with links to the outlet.
                </p>
              </Reveal>
              <div className="mt-10 md:mt-14 grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                {[1, 2].map((i) => (
                  <Reveal key={i} delay={i * 80}>
                    <div
                      className="relative p-6 md:p-8 h-full border border-dashed border-rule"
                      style={{ minHeight: 220 }}
                      aria-hidden="true"
                    >
                      <div className="flex items-baseline justify-between font-mono text-mono-xs uppercase tracking-caps-md text-ink-3">
                        <span>slot {String(i).padStart(2, "0")} / vacant</span>
                        <span>·</span>
                      </div>
                      <p
                        className="mt-12 md:mt-16 font-display italic leading-[1.1] text-ink-3"
                        style={{ fontSize: "clamp(28px, 3.2vw, 42px)" }}
                      >
                        press coverage <br /> coming soon.
                      </p>
                      <p className="mt-6 font-mono text-mono-xs uppercase tracking-caps-md text-ink-3">
                        outlet · author · date
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
              <Reveal delay={240}>
                <p className="mt-6 font-mono text-mono-xs uppercase tracking-caps-md text-ink-3">
                  no fake quotes. no inflated claims. this page updates only when
                  something real comes in.
                </p>
              </Reveal>
            </>
          )}
        </div>
      </section>

      {/* Usage line */}
      <section className="relative">
        <div className="mx-auto max-w-page px-gutter md:px-gutter-md lg:px-gutter-lg pt-section md:pt-section-xl">
          <div className="h-px w-full bg-rule" />
          <div className="grid grid-cols-12 gap-6 md:gap-10 py-10 md:py-12 font-mono text-mono-sm uppercase tracking-caps text-ink-2">
            <div className="col-span-12 md:col-span-4">
              <div className="text-ink-3">credit</div>
              <div className="mt-2">akilah mali · @akilah.mali</div>
            </div>
            <div className="col-span-12 md:col-span-4">
              <div className="text-ink-3">permitted use</div>
              <div className="mt-2">editorial, sync pitch, A&amp;R review</div>
            </div>
            <div className="col-span-12 md:col-span-4">
              <div className="text-ink-3">not permitted</div>
              <div className="mt-2">merchandise, ads, training data</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
