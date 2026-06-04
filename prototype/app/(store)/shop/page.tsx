import type { Metadata } from "next";
import Image from "next/image";
import NextLink from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { ProductCard } from "@/components/store/ProductCard";
import { StoreEmailCapture } from "@/components/store/StoreEmailCapture";
import {
  getAllProducts,
  getFeaturedProduct,
  isShopifyConfigured,
  type ProductCard as ProductCardData,
} from "@/lib/shopify";
import { formatMoney } from "@/lib/shopify/format";
import { getLookbook, type LookbookShot } from "@/lib/queries";
import { urlForImage, isSanityConfigured } from "@/lib/sanity";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Drop 001 — six pieces. Small batch, when it's gone it's gone. From MALI.",
  alternates: { canonical: "/shop" },
  openGraph: {
    title: "Shop — MALI",
    description:
      "Drop 001 — six pieces. Small batch, when it's gone it's gone.",
    url: "/shop",
    type: "website",
  },
};

export const revalidate = 60;

const LOOKBOOK_VIBES = ["lb-1", "lb-2", "lb-3", "lb-4", "lb-5", "lb-6"];
const TILE_VIBES = [
  "ls-lastyear",
  "ls-who-ls",
  "ls-cassette",
  "ls-vinyl",
  "ls-poster",
  "ls-stickers",
];

export default async function ShopHomePage() {
  // Pull live store data in parallel. Each block degrades gracefully.
  const [allProducts, featured, lookbook] = await Promise.all([
    safeAllProducts(),
    safeFeatured(),
    getLookbook().catch(() => null),
  ]);

  // Sort: featured first, then by createdAt desc (which is the API's natural
  // order with sortKey=CREATED_AT, reverse=true).
  const sorted = allProducts.slice().sort((a, b) => {
    const af = a.tags?.includes("featured") ? -1 : 0;
    const bf = b.tags?.includes("featured") ? -1 : 0;
    return af - bf;
  });

  return (
    <>
      <Hero />
      {featured ? <FeaturedDrop product={featured} /> : null}
      <CollectionGrid products={sorted} />
      <Lookbook shots={lookbook?.shots ?? null} />
      <StoreEmailCapture />
    </>
  );
}

/* =========================================================================
   Sections
   ========================================================================= */
function Hero() {
  return (
    <section id="top" className="relative w-full" style={{ minHeight: "92svh" }}>
      <div className="mx-auto max-w-page px-gutter md:px-gutter-md lg:px-gutter-lg pt-24 md:pt-28">
        <Reveal>
          <div
            className="relative w-full field ls-hero overflow-hidden"
            style={{ height: "min(80svh, 880px)" }}
          >
            <div
              className="absolute top-5 md:top-7 right-5 md:right-7 text-right font-mono text-mono-xs uppercase tracking-caps-md"
              style={{ color: "rgba(239,230,214,0.6)" }}
            >
              <div>drop 001</div>
              <div className="mt-1">chapter — i</div>
              <div className="mt-1">mmxxv</div>
            </div>

            <div
              className="hidden md:block absolute left-5 lg:left-7 bottom-7 vtype font-mono text-mono-xs uppercase tracking-caps-xl"
              style={{ color: "rgba(239,230,214,0.55)" }}
            >
              small batch · when it&rsquo;s gone it&rsquo;s gone
            </div>

            <div className="absolute inset-x-0 bottom-0 px-gutter md:px-gutter-md lg:px-gutter-lg pb-10 md:pb-14">
              <h1
                className="font-display leading-[0.82] tracking-display select-none"
                style={{
                  fontSize: "clamp(120px, 22vw, 380px)",
                  color: "var(--color-cream)",
                }}
              >
                MALI
              </h1>
              <div className="mt-2 md:mt-3 flex items-end justify-between gap-6">
                <p
                  className="font-display italic leading-none"
                  style={{
                    color: "rgba(232,226,214,1)",
                    fontSize: "clamp(34px, 5vw, 78px)",
                  }}
                >
                  shop.
                </p>
                <div
                  className="hidden md:flex items-center gap-2 font-mono text-mono-xs uppercase tracking-caps-md pb-3"
                  style={{ color: "rgba(232,226,214,0.65)" }}
                >
                  <span>six pieces</span>
                  <span
                    className="block w-10 h-px"
                    style={{ background: "rgba(232,226,214,0.65)" }}
                  />
                  <span>one drop</span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function FeaturedDrop({ product }: { product: ProductCardData }) {
  const kind = product.tags?.find((t) => t !== "featured") ?? "";
  return (
    <section className="relative">
      <div className="mx-auto max-w-page px-gutter md:px-gutter-md lg:px-gutter-lg pt-section md:pt-section-md">
        <div className="flex items-baseline gap-4 font-mono text-mono-xs uppercase tracking-caps-lg text-ink-3">
          <span>01 / featured</span>
          <span className="block h-px flex-1 bg-rule" aria-hidden="true" />
          <span>hero piece — drop 001</span>
        </div>

        <div className="grid grid-cols-12 gap-6 md:gap-10 mt-10 md:mt-14 items-start">
          <Reveal as="div" className="col-span-12 md:col-span-7">
            <NextLink
              href={`/shop/products/${product.handle}`}
              className="block relative aspect-[4/5] field ls-featured group"
            >
              {product.featuredImage ? (
                <Image
                  src={product.featuredImage.url}
                  alt={product.featuredImage.altText ?? product.title}
                  fill
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  priority
                  className="object-cover"
                  style={{ filter: "saturate(0.92) contrast(1.02)" }}
                />
              ) : null}
              <div
                className="absolute top-5 right-5 inline-flex items-center gap-2 font-mono text-mono-xs uppercase tracking-caps-lg"
                style={{ color: "var(--color-cream)" }}
              >
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full shop-pulse"
                  style={{ background: "var(--color-cream)" }}
                />
                limited
              </div>
            </NextLink>
          </Reveal>

          <Reveal as="div" delay={140} className="col-span-12 md:col-span-5 md:pt-6 md:pl-2">
            <p className="font-mono text-mono-xs uppercase tracking-caps-lg text-ink-3">
              the hero piece
            </p>
            <h2
              className="font-display italic mt-3 leading-[0.92] tracking-mark"
              style={{ fontSize: "clamp(64px, 8vw, 132px)" }}
            >
              {product.title}
            </h2>
            {kind ? (
              <p className="mt-5 font-mono text-mono-sm uppercase tracking-caps-md text-ink-2">
                {kind}
              </p>
            ) : null}
            {product.description ? (
              <p className="mt-6 max-w-[44ch] text-[15px] leading-[1.7] text-ink-2">
                {product.description}
              </p>
            ) : null}

            <div className="mt-8 flex items-end justify-between gap-6 border-t border-rule pt-5">
              <div>
                <div className="font-mono text-mono-xs uppercase tracking-caps-md text-ink-3">
                  price
                </div>
                <div className="font-mono text-[20px] mt-1 text-ink">
                  {formatMoney(product.priceRange.minVariantPrice)}
                </div>
              </div>
              <NextLink
                href={`/shop/products/${product.handle}`}
                className="inline-flex items-baseline gap-2 font-mono text-mono-sm uppercase tracking-caps-md ulink ulink-on pb-1 text-accent"
              >
                shop now <ArrowRight size={14} strokeWidth={1.2} aria-hidden="true" />
              </NextLink>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function CollectionGrid({ products }: { products: ProductCardData[] }) {
  return (
    <section id="shop" className="relative">
      <div className="mx-auto max-w-page px-gutter md:px-gutter-md lg:px-gutter-lg pt-section md:pt-section-xl">
        <div className="flex items-end justify-between gap-6">
          <div className="flex items-baseline gap-4 font-mono text-mono-xs uppercase tracking-caps-lg text-ink-3">
            <span>02 / drop 001</span>
            <span className="block h-px flex-1 bg-rule" aria-hidden="true" />
            <span>{products.length || 0} pieces</span>
          </div>
          <p className="hidden md:block font-mono text-mono-xs uppercase tracking-caps-md text-ink-3">
            hover to flip
          </p>
        </div>

        {products.length > 0 ? (
          <ul className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 md:gap-x-10 md:gap-y-16 mt-10 md:mt-14 list-none p-0">
            {products.map((p, i) => (
              <li key={p.handle}>
                <ProductCard
                  product={p}
                  delay={i * 60}
                  vibeClass={TILE_VIBES[i % TILE_VIBES.length]}
                  flatClass={i % 2 === 0 ? "flat-warm" : "flat-cool"}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p
            className="mt-12 md:mt-16 font-display italic leading-[1.15] text-ink-2"
            style={{ fontSize: "clamp(28px, 3.6vw, 44px)", maxWidth: "32ch" }}
          >
            drop launching soon. one note when it lands —{" "}
            <a href="#next-drop" className="ulink text-accent">
              sign up below
            </a>
            .
          </p>
        )}

        <div className="mt-14 md:mt-20 pt-6 border-t border-rule flex items-baseline justify-between gap-6 font-mono text-mono-xs uppercase tracking-caps-md text-ink-3">
          <span>small batch. when it&rsquo;s gone it&rsquo;s gone.</span>
          {products.length > 0 ? (
            <span>
              {products.length} of {products.length} shown
            </span>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function Lookbook({
  shots,
}: {
  shots: LookbookShot[] | null | undefined;
}) {
  if (!shots || shots.length === 0) return null;
  return (
    <section className="relative pt-section md:pt-section-xl" aria-labelledby="lookbook-heading">
      <div className="mx-auto max-w-page px-gutter md:px-gutter-md lg:px-gutter-lg">
        <div className="flex items-baseline gap-4 font-mono text-mono-xs uppercase tracking-caps-lg text-ink-3">
          <span>03 / lookbook</span>
          <span className="block h-px flex-1 bg-rule" aria-hidden="true" />
          <span>chapter i — in context</span>
          <span className="block h-px w-12 md:w-24 bg-rule" aria-hidden="true" />
          <span>scroll →</span>
        </div>
        <h2 id="lookbook-heading" className="sr-only">
          Lookbook
        </h2>
      </div>

      <div className="mt-10 md:mt-14 overflow-x-auto no-bar">
        <ul
          className="flex gap-5 md:gap-7 pl-gutter md:pl-gutter-md lg:pl-gutter-lg pr-gutter md:pr-gutter-md lg:pr-gutter-lg list-none p-0"
          style={{ width: "max-content" }}
        >
          {shots.map((s, i) => {
            const hasImage =
              isSanityConfigured && s.image?.asset?._ref;
            const url = hasImage
              ? urlForImage(s.image).width(1200).height(1500).fit("crop").url()
              : null;
            return (
              <Reveal as="li" key={`${s.label ?? i}-${i}`} delay={i * 50}>
                <figure className="shrink-0">
                  <div
                    className={`relative field ${url ? "" : LOOKBOOK_VIBES[i % LOOKBOOK_VIBES.length]}`}
                    style={{
                      width: "clamp(280px, 36vw, 520px)",
                      aspectRatio: "4/5",
                    }}
                  >
                    {url ? (
                      <Image
                        src={url}
                        alt={s.image.alt ?? s.label ?? "Lookbook"}
                        fill
                        sizes="(min-width: 1024px) 36vw, 80vw"
                        placeholder={s.image.lqip ? "blur" : "empty"}
                        blurDataURL={s.image.lqip}
                        className="object-cover"
                        style={{ filter: "saturate(0.92) contrast(1.02)" }}
                      />
                    ) : null}
                    <div
                      className="absolute bottom-4 left-4 right-4 flex items-end justify-between font-mono text-mono-xs uppercase tracking-caps-lg"
                      style={{ color: "rgba(239,230,214,0.7)" }}
                    >
                      <span>{s.label ?? `0${i + 1}`}</span>
                      <span>{s.tag ?? ""}</span>
                    </div>
                  </div>
                </figure>
              </Reveal>
            );
          })}
          <li
            className="shrink-0 flex items-center"
            style={{ width: "clamp(260px, 28vw, 380px)" }}
          >
            <div>
              <p
                className="font-display italic leading-[1] tracking-mark"
                style={{ fontSize: "clamp(36px, 4vw, 56px)" }}
              >
                the rest is on you.
              </p>
              <p className="mt-4 font-mono text-mono-xs uppercase tracking-caps-md text-ink-3">
                tag #malichapteri
              </p>
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
}

/* =========================================================================
   Safe data wrappers — degrade to empty values when Shopify is unconfigured
   ========================================================================= */
async function safeAllProducts(): Promise<ProductCardData[]> {
  if (!isShopifyConfigured) return [];
  try {
    return await getAllProducts(24);
  } catch (err) {
    console.error("[shop home] getAllProducts failed", err);
    return [];
  }
}

async function safeFeatured(): Promise<ProductCardData | null> {
  if (!isShopifyConfigured) return null;
  try {
    return await getFeaturedProduct();
  } catch (err) {
    console.error("[shop home] getFeaturedProduct failed", err);
    return null;
  }
}
