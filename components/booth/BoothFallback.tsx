/* =========================================================================
   THE PAYPHONE — 2D fallback (no WebGL). Pure + presentational so it renders on
   the server (a crawlable <noscript> on /payphone) AND the client (visitors who
   prefer reduced motion get this instead of the animated booth). Same crimson
   "Dead Line · coming soon" message + notify CTA; fully keyboard-navigable.
   ========================================================================= */

export function BoothFallback() {
  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden bg-[#080103] px-6 text-center font-mono text-[#f4e6ea]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(40% 32% at 28% 22%, rgba(255,40,60,0.4), transparent 60%)," +
            "radial-gradient(46% 40% at 72% 84%, rgba(150,15,40,0.46), transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/></svg>\")",
        }}
      />
      <div className="relative">
        <p className="mb-3 text-[10px] uppercase tracking-[0.5em] text-[#ff7d92]">Akilah Mali</p>
        <h1 className="text-[16vw] leading-[0.9] sm:text-[clamp(3rem,9vw,7rem)]" style={{ fontFamily: "var(--font-display), Georgia, serif", textShadow: "0 0 28px rgba(255,40,70,0.45)" }}>
          Dead Line
        </h1>
        <p className="mx-auto mt-5 max-w-md text-[11px] uppercase leading-relaxed tracking-[0.28em] text-white/65">
          the last working payphone in a dead, neon-crimson city. the new music reaches no one yet —
          coming soon.
        </p>
        {/* "notify me" belongs to the mailing list, not the (unbuilt) shop. */}
        <a
          href="/#next"
          className="mt-10 inline-block rounded-full bg-[#ff2b3e] px-7 py-3 text-[11px] uppercase tracking-[0.3em] text-[#0a0103] transition-colors hover:bg-[#ff4d5e]"
        >
          notify me
        </a>
      </div>
    </div>
  );
}
