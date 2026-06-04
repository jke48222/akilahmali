import type { Metadata } from "next";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductGallery } from "@/components/store/ProductGallery";
import { ProductPurchaseForm } from "@/components/store/ProductPurchaseForm";
import {
  getAllProducts,
  getProductByHandle,
  getRelatedProducts,
  isShopifyConfigured,
} from "@/lib/shopify";
import { formatMoney } from "@/lib/shopify/format";

export const revalidate = 60;

/* =========================================================================
   Static params · prerender every Shopify product handle at build time.
   Returns [] when Shopify is unconfigured so the build doesn't fail.
   ========================================================================= */
export async function generateStaticParams() {
  if (!isShopifyConfigured) return [];
  try {
    const products = await getAllProducts(100);
    return products.map((p) => ({ handle: p.handle }));
  } catch {
    return [];
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ handle: string }> },
): Promise<Metadata> {
  const { handle } = await params;
  if (!isShopifyConfigured) return { title: "Shop" };
  try {
    const product = await getProductByHandle(handle);
    if (!product) return { title: "Product not found" };
    const image = product.featuredImage?.url;
    return {
      title: product.title,
      description: product.description?.slice(0, 200) ?? `${product.title} · Akilah Mali shop.`,
      alternates: { canonical: `/shop/products/${handle}` },
      openGraph: {
        title: `${product.title} · Akilah Mali`,
        description: product.description?.slice(0, 200) ?? `${product.title} · Akilah Mali shop.`,
        url: `/shop/products/${handle}`,
        type: "website",
        images: image
          ? [{ url: image, width: 1200, height: 1500, alt: product.title }]
          : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title: `${product.title} · Akilah Mali`,
        description: product.description?.slice(0, 200) ?? `${product.title} · Akilah Mali shop.`,
        images: image ? [image] : undefined,
      },
    };
  } catch {
    return { title: "Product" };
  }
}

/* =========================================================================
   Page
   ========================================================================= */
export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  if (!isShopifyConfigured) notFound();
  const product = await getProductByHandle(handle).catch(() => null);
  if (!product) notFound();

  const related = await getRelatedProducts(product, 3).catch(() => []);
  const kind = product.tags?.find((t) => t !== "featured") ?? "";

  return (
    <>
      <ProductJsonLd product={product} />

      {/* Breadcrumb */}
      <div className="mx-auto max-w-page px-gutter md:px-gutter-md lg:px-gutter-lg pt-24 md:pt-28">
        <nav
          aria-label="Breadcrumb"
          className="font-mono text-mono-xs uppercase tracking-caps-lg flex items-center gap-3 text-ink-3"
        >
          <NextLink href="/shop" className="ulink hover:text-ink-2 transition-colors">
            shop
          </NextLink>
          <span aria-hidden="true">/</span>
          <span>drop 001</span>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="text-ink-2">
            {product.title.toLowerCase()}
          </span>
        </nav>
      </div>

      {/* Gallery + info */}
      <section className="mx-auto max-w-page px-gutter md:px-gutter-md lg:px-gutter-lg pt-8 md:pt-10">
        <div className="grid grid-cols-12 gap-6 md:gap-10 lg:gap-14">
          <div className="col-span-12 md:col-span-7">
            <ProductGallery
              images={product.images.nodes}
              productTitle={product.title}
            />
          </div>
          <div className="col-span-12 md:col-span-5">
            <div className="md:sticky" style={{ top: "96px" }}>
              <p className="font-mono text-mono-xs uppercase tracking-caps-lg text-ink-3">
                {product.tags?.includes("featured")
                  ? "drop 001 · the hero piece"
                  : "drop 001"}
              </p>
              <h1
                className="font-display italic mt-3 leading-[0.92] tracking-mark"
                style={{ fontSize: "clamp(54px, 6.2vw, 96px)" }}
              >
                {product.title}
              </h1>
              {kind ? (
                <p className="mt-3 font-mono text-mono-sm uppercase tracking-caps-md text-ink-2">
                  {kind}
                </p>
              ) : null}

              <ProductPurchaseForm product={product} />

              {/* Disclosures */}
              <div className="mt-10 border-b border-rule">
                <Disc title="materials & fit" defaultOpen>
                  <p className="max-w-[58ch]">
                    {product.description ??
                      "Material, fit, and care details land in Shopify and surface here."}
                  </p>
                </Disc>
                <Disc title="shipping & returns">
                  <p className="max-w-[58ch]">
                    Ships from Atlanta within 5 business days. Domestic $6 flat,
                    international from $18. Exchanges within 14 days for unworn
                    pieces · drop a note to{" "}
                    <a
                      className="ulink ulink-on"
                      href="mailto:shop@malicantsing.com"
                    >
                      shop@malicantsing.com
                    </a>
                    . Limited drops are final sale once they sell through.
                  </p>
                </Disc>
                <Disc title="care">
                  <p className="max-w-[58ch]">
                    Inside out, cold water, hang dry. Iron on the reverse, skip
                    the print. The bone gets softer the worse you treat it.
                    Don&rsquo;t bleach. Don&rsquo;t love it less.
                  </p>
                </Disc>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pairs with */}
      {related.length > 0 ? (
        <section
          className="relative pt-section md:pt-section-xl"
          aria-labelledby="pairs-with-heading"
        >
          <div className="mx-auto max-w-page px-gutter md:px-gutter-md lg:px-gutter-lg">
            <div className="flex items-baseline gap-4 font-mono text-mono-xs uppercase tracking-caps-lg text-ink-3">
              <span>pairs with</span>
              <span className="block h-px flex-1 bg-rule" aria-hidden="true" />
              <span>three picks</span>
            </div>
            <h2 id="pairs-with-heading" className="sr-only">
              Pairs with
            </h2>
            <ul className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 md:gap-x-10 md:gap-y-16 mt-10 md:mt-14 list-none p-0">
              {related.map((p, i) => (
                <li key={p.handle}>
                  <ProductCard
                    product={p}
                    delay={i * 80}
                    vibeClass={`ls-pair-${(i % 3) + 1}`}
                    flatClass="flat-warm"
                  />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </>
  );
}

/* =========================================================================
   Small native-disclosure wrapper
   ========================================================================= */
function Disc({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details className="disc border-t border-rule" open={defaultOpen}>
      <summary className="py-5 flex items-center justify-between gap-4 font-mono text-mono-sm uppercase tracking-caps-md text-ink-2">
        <span>{title}</span>
        <span className="disc-icon" aria-hidden="true">
          <Plus size={14} strokeWidth={1.2} />
        </span>
      </summary>
      <div className="pb-6 text-[14px] leading-[1.7] text-ink-2">{children}</div>
    </details>
  );
}

/* =========================================================================
   schema.org/Product JSON-LD (PRD §9.4)
   ========================================================================= */
function ProductJsonLd({
  product,
}: {
  product: Awaited<ReturnType<typeof getProductByHandle>>;
}) {
  if (!product) return null;
  const minVar = product.variants.nodes[0];
  const payload = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.images.nodes.map((i) => i.url),
    sku: minVar?.id,
    brand: { "@type": "Brand", name: "Akilah Mali" },
    offers: product.variants.nodes.map((v) => ({
      "@type": "Offer",
      sku: v.id,
      price: v.price.amount,
      priceCurrency: v.price.currencyCode,
      availability: v.availableForSale
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `https://shop.malicantsing.com/shop/products/${product.handle}`,
    })),
  };
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}

/* =========================================================================
   Render-time formatter · exported just for ergonomic test stubs.
   Re-exports formatMoney so consumers don't need a second import.
   ========================================================================= */
export { formatMoney };
