import NextLink from "next/link";
import { CartButton } from "./CartButton";

const SITE_URL = "https://akilahmali.com";

/**
 * Fixed nav for the store. Wordmark + ← akilahmali.com on the left,
 * shop / about / cart on the right. Cart button is a tiny client component
 * that reads the cart context for the live count badge.
 */
export function StoreNav() {
  return (
    <header className="fixed top-0 inset-x-0 z-40">
      <div
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in oklab, var(--color-bg) 90%, transparent) 0%, color-mix(in oklab, var(--color-bg) 0%, transparent) 100%)",
          backdropFilter: "blur(6px)",
        }}
        aria-hidden="true"
      />
      <div className="mx-auto max-w-page px-gutter md:px-gutter-md lg:px-gutter-lg pt-5 md:pt-7 pb-4 flex items-baseline justify-between">
        <div className="flex items-baseline gap-5 md:gap-7">
          <a
            href={SITE_URL}
            className="hidden sm:inline-flex items-center gap-1.5 font-mono text-mono-xs uppercase tracking-caps-md ulink text-ink-3"
          >
            ← akilahmali.com
          </a>
          <NextLink
            href="/shop"
            aria-label="Akilah Mali shop · home"
            className="font-display tracking-mark text-[19px] md:text-[22px] leading-none text-ink"
          >
            Akilah Mali
            <span className="font-mono text-mono-xs uppercase tracking-caps-md ml-2 align-middle text-ink-3">
              / shop
            </span>
          </NextLink>
        </div>
        <nav aria-label="Store" className="flex items-baseline gap-6 md:gap-9 font-mono text-mono-sm uppercase tracking-caps-sm text-ink-2">
          <NextLink
            href="/shop"
            className="ulink hover:text-ink focus-visible:text-ink"
          >
            shop
          </NextLink>
          <NextLink
            href="/shop/about"
            className="ulink hover:text-ink focus-visible:text-ink hidden sm:inline"
          >
            about
          </NextLink>
          <CartButton />
        </nav>
      </div>
    </header>
  );
}
