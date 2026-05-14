"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import NextLink from "next/link";
import { CloseIcon } from "./icons";

type NavLink = {
  label: string;
  href: string;
  external?: boolean;
};

const LINKS: NavLink[] = [
  { label: "music", href: "/music" },
  { label: "videos", href: "/videos" },
  { label: "about", href: "/about" },
  { label: "shows", href: "/shows" },
  { label: "shop", href: "https://shop.malicantsing.com", external: true },
  { label: "contact", href: "/contact" },
];

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div
        className="nav-bg absolute inset-0 -z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in oklab, var(--color-bg) 85%, transparent), color-mix(in oklab, var(--color-bg) 0%, transparent))",
          backdropFilter: "blur(6px)",
          transition: "background 500ms ease",
        }}
      />
      <div className="mx-auto max-w-page px-gutter md:px-gutter-md lg:px-gutter-lg pt-5 md:pt-7 pb-4 flex items-baseline justify-between">
        <NextLink
          href="/"
          aria-label="malicantsing — home"
          className="nav-wordmark font-display tracking-mark text-[19px] md:text-[22px] leading-none text-ink transition-colors duration-500"
        >
          mali<span className="nav-wordmark-2 text-ink-3 transition-colors duration-500">cantsing</span>
        </NextLink>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-baseline gap-7 lg:gap-9 font-mono text-mono-sm uppercase tracking-caps-sm">
            {LINKS.map((l) => {
              const active = !l.external && isActive(l.href);
              const linkClasses =
                "ulink nav-link transition-colors duration-500 text-ink-2 hover:text-ink focus-visible:text-ink";
              return (
                <li key={l.label}>
                  {l.external ? (
                    <a
                      href={l.href}
                      className={linkClasses}
                      rel="noopener"
                    >
                      {l.label}
                    </a>
                  ) : (
                    <NextLink
                      href={l.href}
                      aria-current={active ? "page" : undefined}
                      className={`${linkClasses} ${active ? "ulink-on nav-link-active text-ink" : ""}`}
                    >
                      {l.label}
                    </NextLink>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen(true)}
          className="nav-link md:hidden font-mono text-mono-sm uppercase tracking-caps-sm text-ink-2 hover:text-ink"
        >
          menu
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        hidden={!open}
        className="md:hidden fixed inset-0 z-50 bg-bg"
      >
        <div className="flex flex-col h-full px-gutter pt-5">
          <div className="flex items-baseline justify-between">
            <span className="font-display tracking-mark text-[19px] leading-none">
              mali<span className="text-ink-3">cantsing</span>
            </span>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="text-ink-2 hover:text-ink p-1 -m-1"
            >
              <CloseIcon width="22" height="22" />
            </button>
          </div>

          <nav aria-label="Primary mobile" className="mt-16">
            <ul className="flex flex-col gap-6 font-display text-[44px] leading-[1] tracking-tight">
              {LINKS.map((l) => (
                <li key={l.label}>
                  {l.external ? (
                    <a href={l.href} className="ulink" rel="noopener">
                      {l.label}
                    </a>
                  ) : (
                    <NextLink
                      href={l.href}
                      aria-current={isActive(l.href) ? "page" : undefined}
                      className="ulink"
                    >
                      {l.label}
                    </NextLink>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
