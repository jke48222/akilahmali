import type { Metadata } from "next";
import NextLink from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main
      id="main"
      className="flex-1 flex items-center justify-center px-gutter md:px-gutter-md py-24 md:py-32"
    >
      <div className="max-w-page w-full text-center">
        <p className="font-mono text-mono-xs uppercase tracking-caps-lg text-ink-3">
          error · 404
        </p>
        <h1
          className="font-display italic mt-5 leading-[0.95] tracking-mark"
          style={{ fontSize: "var(--text-display-m)" }}
        >
          lost the thread.
        </h1>
        <p className="mt-5 mx-auto max-w-[42ch] text-[15px] md:text-[16px] leading-[1.7] text-ink-2">
          this page doesn&rsquo;t exist, or it moved. let&rsquo;s get you back to
          the music.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          <NextLink
            href="/"
            className="font-mono text-mono-sm uppercase tracking-caps-md ulink"
          >
            home
          </NextLink>
          <NextLink
            href="/music"
            className="font-mono text-mono-sm uppercase tracking-caps-md ulink"
          >
            music
          </NextLink>
        </div>
      </div>
    </main>
  );
}
