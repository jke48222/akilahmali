import Image from "next/image";
import NextLink from "next/link";
import type { ProductCard as ProductCardData } from "@/lib/shopify";
import { formatMoney } from "@/lib/shopify/format";
import { Reveal } from "@/components/Reveal";

type ProductCardProps = {
  product: ProductCardData;
  /** Stagger delay in ms (used by collection grids). */
  delay?: number;
  /** Lifestyle gradient stand-in when the product has no images. */
  vibeClass?: string;
  /** Stand-in flat backdrop. */
  flatClass?: string;
};

/**
 * Server-side product card. Renders the lifestyle image (or gradient
 * fallback) with a flat hover swap when a second image exists.
 */
export function ProductCard({
  product,
  delay = 0,
  vibeClass = "ls-featured",
  flatClass = "flat-warm",
}: ProductCardProps) {
  const featured = product.featuredImage;
  const flat = product.images.nodes[1] ?? null;
  const kindTag = product.tags?.find((t) => t !== "featured") ?? "";

  return (
    <Reveal delay={delay}>
      <NextLink
        href={`/shop/products/${product.handle}`}
        className="block group pc-swap"
      >
        <div className="relative w-full aspect-[4/5] overflow-hidden">
          {/* Lifestyle layer */}
          <div className={`pc-ls absolute inset-0 field ${featured ? "" : vibeClass}`}>
            {featured ? (
              <Image
                src={featured.url}
                alt={featured.altText ?? product.title}
                fill
                sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                className="object-cover"
                style={{ filter: "saturate(0.92) contrast(1.02)" }}
              />
            ) : null}
            {kindTag ? (
              <div
                className="absolute top-4 left-4 font-mono text-[9px] uppercase tracking-caps-lg"
                style={{ color: "rgba(239,230,214,0.55)" }}
              >
                [ lifestyle · {kindTag} ]
              </div>
            ) : null}
          </div>
          {/* Flat layer — only rendered when a second image exists. */}
          {flat ? (
            <div className={`pc-flat absolute inset-0 ${flatClass}`}>
              <Image
                src={flat.url}
                alt={flat.altText ?? `${product.title} — flat`}
                fill
                sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                className="object-cover"
                style={{ filter: "saturate(0.92) contrast(1.02)" }}
              />
            </div>
          ) : null}
        </div>
        <div className="mt-4 flex items-baseline justify-between gap-4">
          <div>
            <div className="font-display text-[22px] md:text-[24px] leading-[1.05] tracking-mark">
              {product.title}
            </div>
            {kindTag ? (
              <div className="font-mono text-mono-xs uppercase tracking-caps-lg mt-1.5 text-ink-3">
                {kindTag}
              </div>
            ) : null}
          </div>
          <div className="font-mono text-[14px] tabular-nums whitespace-nowrap text-ink">
            {formatMoney(product.priceRange.minVariantPrice)}
          </div>
        </div>
      </NextLink>
    </Reveal>
  );
}
