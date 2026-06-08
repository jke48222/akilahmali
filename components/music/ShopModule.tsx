import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { SectionLabel } from "@/components/home/SectionLabel";
import type { ShopLink } from "@/lib/queries";

const KIND_LABEL: Record<NonNullable<ShopLink["kind"]>, string> = {
  vinyl: "vinyl",
  cd: "compact disc",
  cassette: "cassette",
  apparel: "apparel",
  bundle: "bundle",
  other: "merch",
};

/**
 * "Shop this release" — physical / merch products for a release, each linking
 * out to its Shopify (or any store) product page. Driven by the release's
 * `shopLinks` field (Sanity) with a static-content fallback; renders nothing
 * when there's nothing to sell, so it's safe to mount unconditionally.
 */
export function ShopModule({
  items,
  releaseTitle,
}: {
  items: ShopLink[];
  releaseTitle: string;
}) {
  if (!items || items.length === 0) return null;

  return (
    <section className="relative" aria-labelledby="shop-heading">
      <div className="mx-auto max-w-page px-gutter md:px-gutter-md lg:px-gutter-lg pt-section md:pt-section-xl">
        <Reveal>
          <SectionLabel label="shop" />
        </Reveal>
        <Reveal delay={120}>
          <h2
            id="shop-heading"
            className="mt-8 md:mt-10 font-display italic leading-[0.95] tracking-mark"
            style={{ fontSize: "clamp(28px, 4vw, 60px)" }}
          >
            take it home.
          </h2>
        </Reveal>
        <Reveal delay={200}>
          <ul className="mt-10 md:mt-14 border-t border-rule">
            {items.map((item, i) => {
              const kindLabel = KIND_LABEL[item.kind ?? "other"];
              return (
                <li key={`${item.url}-${i}`} className="border-b border-rule">
                  <a
                    href={item.soldOut ? undefined : item.url}
                    rel="noopener"
                    target="_blank"
                    aria-disabled={item.soldOut || undefined}
                    data-cursor={item.soldOut ? undefined : "hover"}
                    className={`group grid grid-cols-12 items-baseline gap-3 py-5 md:py-6 ${
                      item.soldOut ? "cursor-default" : ""
                    }`}
                  >
                    <span className="col-span-1 font-mono text-mono-xs uppercase tracking-caps-md pt-2 text-ink-3">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="col-span-7 md:col-span-8">
                      <span
                        className={`font-display italic leading-tight ${
                          item.soldOut ? "text-ink-3" : "text-ink"
                        }`}
                        style={{ fontSize: "clamp(24px, 2.8vw, 38px)" }}
                      >
                        {item.title}
                      </span>
                      <span className="mt-1 block font-mono text-mono-xs uppercase tracking-caps-md text-ink-3">
                        {kindLabel}
                        {item.price ? ` · ${item.price}` : ""}
                      </span>
                    </span>
                    <span className="col-span-4 md:col-span-3 md:text-right font-mono text-mono-sm uppercase tracking-caps-md inline-flex items-baseline gap-2 md:justify-end">
                      {item.soldOut ? (
                        <span className="text-ink-3">sold out</span>
                      ) : (
                        <>
                          <span className="ulink text-ink">buy</span>
                          <span className="text-ink-2" aria-hidden="true">
                            <ArrowUpRight size={14} strokeWidth={1.1} />
                          </span>
                        </>
                      )}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </Reveal>
        <Reveal delay={260}>
          <p className="mt-6 font-mono text-mono-xs uppercase tracking-caps-md text-ink-3">
            ships from the {releaseTitle.toLowerCase()} store · secure checkout via shopify
          </p>
        </Reveal>
      </div>
    </section>
  );
}
