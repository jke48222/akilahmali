"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";
import SiteImg from "./SiteImg";
import { SOCIAL_ICONS, MenuIcon, CloseIcon, CartIcon } from "./icons";

export default function Header() {
  const pathname = usePathname();
  // Routes whose top section is a dark hero/banner → white header.
  const darkTop =
    pathname === "/" ||
    pathname === "/tour" ||
    pathname?.startsWith("/music/who-really-won");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const onDark = darkTop;
  const text = onDark ? "text-white" : "text-plum";
  const isWrw = pathname?.startsWith("/music/who-really-won");
  const bar = scrolled
    ? isWrw
      ? "bg-black/20 backdrop-blur-md"
      : darkTop
      ? "bg-plum-deep/85 backdrop-blur-md"
      : "bg-lavender/90 backdrop-blur-md"
    : "bg-transparent";
  const wordmarkSrc = onDark ? site.assets.wordmarkWhite : site.assets.wordmark;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${bar} ${text}`}
    >
      {/* 3-column grid keeps the centered wordmark from overlapping nav/icons */}
      <div className="mx-auto grid h-20 max-w-[1500px] grid-cols-[1fr_auto_1fr] items-center px-5 md:px-8">
        {/* Left: desktop nav / mobile menu button */}
        <div className="flex items-center justify-start">
          <nav className="hidden items-center gap-5 md:flex lg:gap-6">
            {site.nav.map((n) => {
              const isActive = !("external" in n && n.external) && pathname === n.href;
              return "external" in n && n.external ? (
                <a
                  key={n.label}
                  href={n.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nav-label text-xs hover:opacity-70 border-b border-transparent pb-0.5"
                  style={{ marginRight: "-0.14em" }}
                >
                  {n.label}
                </a>
              ) : (
                <Link
                  key={n.label}
                  href={n.href}
                  className={`nav-label text-xs hover:opacity-70 border-b pb-0.5 transition-colors duration-200 ${
                    isActive ? "border-current" : "border-transparent"
                  }`}
                  style={{ marginRight: "-0.14em" }}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <button
            className="md:hidden"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <MenuIcon width={26} height={26} />
          </button>
        </div>

        {/* Center: wordmark logo */}
        <Link href="/" aria-label={site.artist} className="justify-self-center px-4">
          <SiteImg
            src={wordmarkSrc}
            alt={site.artist}
            className="h-5 w-auto md:h-6"
          />
        </Link>

        {/* Right: socials + cart */}
        <div className="flex items-center justify-end gap-2 md:gap-3">
          {site.socials.map((s) => {
            const Icon = SOCIAL_ICONS[s.name];
            return (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.name}
                className={`hidden h-8 w-8 place-items-center rounded-full border md:grid ${
                  onDark ? "border-white/70" : "border-plum/60"
                } transition hover:opacity-70`}
              >
                <Icon width={30} height={30} />
              </a>
            );
          })}
          <a
            href={site.cartUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Cart"
            className={`grid h-8 w-8 place-items-center rounded-full border ${
              onDark ? "border-white/70" : "border-plum/60"
            } transition hover:opacity-70`}
          >
            <CartIcon width={18} height={18} />
          </a>
        </div>
      </div>

      {/* Mobile overlay menu */}
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-plum-deep text-white md:hidden">
          <div className="flex h-20 items-center justify-between px-5">
            <SiteImg src={site.assets.wordmarkWhite} alt={site.artist} className="h-5 w-auto" />
            <div className="flex items-center gap-4">
              <a
                href={site.cartUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Cart"
                className="grid h-10 w-10 place-items-center rounded-full border border-white/70"
              >
                <CartIcon width={20} height={20} />
              </a>
              <button aria-label="Close menu" onClick={() => setOpen(false)}>
                <CloseIcon width={26} height={26} />
              </button>
            </div>
          </div>
          <nav className="flex flex-1 flex-col items-center justify-center gap-7">
            {site.nav.map((n) => {
              const isActive = !("external" in n && n.external) && pathname === n.href;
              return "external" in n && n.external ? (
                <a
                  key={n.label}
                  href={n.href}
                  className="nav-label text-2xl border-b-2 border-transparent pb-1"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ marginRight: "-0.14em" }}
                >
                  {n.label}
                </a>
              ) : (
                <Link
                  key={n.label}
                  href={n.href}
                  className={`nav-label text-2xl border-b-2 pb-1 transition-colors duration-200 ${
                    isActive ? "border-white" : "border-transparent"
                  }`}
                  style={{ marginRight: "-0.14em" }}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex justify-center gap-3 pb-12">
            {site.socials.map((s) => {
              const Icon = SOCIAL_ICONS[s.name];
              return (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/70"
                >
                  <Icon width={36} height={36} />
                </a>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
