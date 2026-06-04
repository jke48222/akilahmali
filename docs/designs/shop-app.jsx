const { useState, useEffect, useRef } = React;

/* ---------- Icons ---------- */
const Icon = {
  Arrow: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" {...p}><path d="M5 12h14M13 6l6 6-6 6"/></svg>
  ),
  ArrowL: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" {...p}><path d="M19 12H5M11 6l-6 6 6 6"/></svg>
  ),
  ArrowDiag: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1" {...p}><path d="M7 17 17 7M9 7h8v8"/></svg>
  ),
  Plus: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" {...p}><path d="M12 5v14M5 12h14"/></svg>
  ),
};

/* ---------- Reveal hook ---------- */
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add('in'); io.unobserve(el); }
    }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}
const Reveal = ({ as: As = 'div', className = '', children, delay = 0 }) => {
  const r = useReveal();
  return <As ref={r} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</As>;
};

/* ---------- Nav ---------- */
function Nav({ cartCount = 0 }) {
  return (
    <header className="fixed top-0 inset-x-0 z-50" style={{ background: 'linear-gradient(180deg, rgba(244,242,238,0.85) 0%, rgba(244,242,238,0) 100%)', backdropFilter: 'blur(6px)' }}>
      <div className="mx-auto max-w-[1480px] px-6 md:px-10 lg:px-14 pt-5 md:pt-7 pb-4 flex items-baseline justify-between">
        <div className="flex items-baseline gap-5 md:gap-7">
          <a href="https://akilahmali.com" className="hidden sm:inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.24em] ulink" style={{ color: 'var(--ink-3)' }}>
            <span style={{ display: 'inline-block', transform: 'translateY(-1px)' }}>←</span> akilahmali.com
          </a>
          <a href="#top" className="font-display tracking-[-0.01em] text-[19px] md:text-[22px] leading-none">
            MALI<span className="font-mono text-[10px] uppercase tracking-[0.24em] ml-2 align-middle" style={{ color: 'var(--ink-3)' }}>/ shop</span>
          </a>
        </div>
        <nav className="flex items-baseline gap-6 md:gap-9 font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: 'var(--ink-2)' }}>
          <a href="#shop" className="ulink hover:text-[color:var(--ink)] transition-colors">shop</a>
          <a href="#about" className="ulink hover:text-[color:var(--ink)] transition-colors hidden sm:inline">about</a>
          <a href="#cart" className="ulink hover:text-[color:var(--ink)] transition-colors inline-flex items-baseline gap-1">
            cart <span style={{ color: 'var(--ink-3)' }}>({String(cartCount).padStart(2,'0')})</span>
          </a>
        </nav>
      </div>
    </header>
  );
}

/* ---------- Hero ---------- */
function Hero() {
  return (
    <section id="top" className="relative w-full" style={{ minHeight: '92svh' }}>
      <div className="mx-auto max-w-[1480px] px-6 md:px-10 lg:px-14 pt-24 md:pt-28">
        <Reveal>
          <div className="relative w-full field ls-hero overflow-hidden" style={{ height: 'min(80svh, 880px)' }}>
            {/* placeholder annotation, top-left */}
            <div className="absolute top-5 md:top-7 left-5 md:left-7 font-mono text-[10px] uppercase tracking-[0.24em]" style={{ color: 'rgba(239,230,214,0.6)' }}>
              [ image — hero tee, on body, interior light ]
            </div>

            {/* right-edge meta */}
            <div className="absolute top-5 md:top-7 right-5 md:right-7 text-right font-mono text-[10px] uppercase tracking-[0.24em]" style={{ color: 'rgba(239,230,214,0.6)' }}>
              <div>drop 001</div>
              <div className="mt-1">chapter — i</div>
              <div className="mt-1">mmxxv</div>
            </div>

            {/* vertical caption */}
            <div className="hidden md:block absolute left-5 lg:left-7 bottom-7 vtype font-mono text-[10px] uppercase tracking-[0.32em]" style={{ color: 'rgba(239,230,214,0.55)' }}>
              small batch · when it&rsquo;s gone it&rsquo;s gone
            </div>

            {/* overlaid wordmark + "shop" */}
            <div className="absolute inset-x-0 bottom-0 px-6 md:px-10 lg:px-14 pb-10 md:pb-14">
              <h1 className="font-display leading-[0.82] tracking-[-0.02em] select-none"
                  style={{ fontSize: 'clamp(120px, 22vw, 380px)', color: '#EFE6D6' }}>
                MALI
              </h1>
              <div className="mt-2 md:mt-3 flex items-end justify-between gap-6">
                <p className="font-display italic leading-none" style={{ color: '#E8E2D6', fontSize: 'clamp(34px, 5vw, 78px)' }}>
                  shop.
                </p>
                <div className="hidden md:flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] pb-3" style={{ color: 'rgba(232,226,214,0.65)' }}>
                  <span>six pieces</span>
                  <span className="block w-10 h-px" style={{ background: 'rgba(232,226,214,0.65)' }} />
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

/* ---------- Section label ---------- */
function SectionLabel({ index, label, right }) {
  return (
    <div className="flex items-baseline gap-4 font-mono text-[10px] uppercase tracking-[0.28em]" style={{ color: 'var(--ink-3)' }}>
      <span>{index}</span>
      <span className="block h-px flex-1" style={{ background: 'var(--rule)' }} />
      <span>{label}</span>
      {right && (<><span className="block h-px w-12 md:w-24" style={{ background: 'var(--rule)' }} /><span>{right}</span></>)}
    </div>
  );
}

/* ---------- Featured drop ---------- */
function Featured() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-[1480px] px-6 md:px-10 lg:px-14 pt-24 md:pt-32">
        <SectionLabel index="01 / featured" label="hero piece — drop 001" right="who really won?" />

        <div className="grid grid-cols-12 gap-6 md:gap-10 mt-10 md:mt-14 items-start">
          <Reveal className="col-span-12 md:col-span-7">
            <div className="relative aspect-[4/5] field ls-featured">
              <div className="absolute top-5 left-5 font-mono text-[10px] uppercase tracking-[0.24em]" style={{ color: 'rgba(239,230,214,0.6)' }}>
                [ image — longsleeve, styled in room ]
              </div>
              {/* limited tag */}
              <div className="absolute top-5 right-5 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em]" style={{ color: '#EFE6D6' }}>
                <span className="inline-block w-1.5 h-1.5 rounded-full pulse" style={{ background: '#EFE6D6' }} />
                limited — 60 made
              </div>
              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between font-mono text-[10px] uppercase tracking-[0.24em]" style={{ color: 'rgba(239,230,214,0.6)' }}>
                <span>fig. a</span>
                <span>worn · interior</span>
              </div>
            </div>
          </Reveal>

          <Reveal delay={140} className="col-span-12 md:col-span-5 md:pt-6 md:pl-2">
            <div className="font-mono text-[10px] uppercase tracking-[0.28em]" style={{ color: 'var(--ink-3)' }}>
              the hero piece
            </div>
            <h2 className="font-display italic mt-3 leading-[0.92] tracking-[-0.01em]" style={{ fontSize: 'clamp(64px, 8vw, 132px)' }}>
              who really<br/>won?
            </h2>
            <div className="mt-5 font-mono text-[11px] uppercase tracking-[0.24em]" style={{ color: 'var(--ink-2)' }}>
              longsleeve · heavyweight cotton
            </div>
            <p className="mt-6 max-w-[44ch] text-[15px] leading-[1.7]" style={{ color: 'var(--ink-2)' }}>
              cover-art type set across the chest, lyric on the back, sleeve hits at the wrist.
              dyed in a single run. 60 pieces. no restock.
            </p>

            <div className="mt-8 flex items-end justify-between gap-6 border-t pt-5" style={{ borderColor: 'var(--rule)' }}>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.24em]" style={{ color: 'var(--ink-3)' }}>price</div>
                <div className="font-mono text-[20px] mt-1" style={{ color: 'var(--ink)' }}>$48.00</div>
              </div>
              <a href="#p/who-really-won-longsleeve" className="inline-flex items-baseline gap-2 font-mono text-[11px] uppercase tracking-[0.24em] ulink ulink-on pb-1" style={{ color: 'var(--accent)' }}>
                shop now <Icon.Arrow width="14" height="14" />
              </a>
            </div>

            <div className="mt-6 font-mono text-[10px] uppercase tracking-[0.24em] flex items-center gap-3" style={{ color: 'var(--ink-3)' }}>
              <span>32 of 60 remain</span>
              <span className="block flex-1 h-px relative overflow-hidden" style={{ background: 'var(--rule)' }}>
                <span className="absolute left-0 top-0 bottom-0" style={{ width: '53%', background: 'var(--accent)' }} />
              </span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------- Product card ---------- */
function ProductCard({ idx, slug, title, price, kind, lsClass, flatClass, graphic, shape }) {
  return (
    <Reveal delay={idx * 60}>
      <a href={`#p/${slug}`} className="block group pc-swap">
        <div className="relative w-full aspect-[4/5] overflow-hidden">
          {/* Lifestyle layer */}
          <div className={`pc-ls absolute inset-0 field ${lsClass}`}>
            <div className="absolute top-4 left-4 font-mono text-[9px] uppercase tracking-[0.28em]" style={{ color: 'rgba(239,230,214,0.55)' }}>
              [ lifestyle · {kind} ]
            </div>
            <div className="absolute bottom-4 left-4 font-mono text-[9px] uppercase tracking-[0.28em]" style={{ color: 'rgba(239,230,214,0.5)' }}>
              fig. {String(idx + 2).padStart(2,'0')}
            </div>
          </div>
          {/* Flat product layer (revealed on hover) */}
          <div className={`pc-flat absolute inset-0 ${flatClass}`}>
            <FlatPlaceholder shape={shape} graphic={graphic} kind={kind} />
          </div>
        </div>

        <div className="mt-4 flex items-baseline justify-between gap-4">
          <div>
            <div className="font-display text-[22px] md:text-[24px] leading-[1.05] tracking-[-0.005em]">{title}</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.28em] mt-1.5" style={{ color: 'var(--ink-3)' }}>{kind}</div>
          </div>
          <div className="font-mono text-[14px] tabular-nums whitespace-nowrap" style={{ color: 'var(--ink)' }}>
            ${price.toFixed(2)}
          </div>
        </div>
      </a>
    </Reveal>
  );
}

/* ---------- Flat placeholder — suggests product silhouette without drawing it ---------- */
function FlatPlaceholder({ shape, graphic, kind }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="absolute top-4 left-4 font-mono text-[9px] uppercase tracking-[0.28em]" style={{ color: 'var(--ink-3)' }}>
        [ flat · on paper ]
      </div>
      <div className="absolute top-4 right-4 font-mono text-[9px] uppercase tracking-[0.28em]" style={{ color: 'var(--ink-3) ' }}>
        {kind}
      </div>

      {/* Silhouette block — varies by shape */}
      {shape === 'tee' && (
        <div className="relative" style={{ width: '70%', aspectRatio: '1.05/1' }}>
          <div className="absolute inset-x-[12%] top-0 bottom-0" style={{ background: 'rgba(21,22,26,0.10)' }} />
          {/* shoulders */}
          <div className="absolute left-0 top-0 w-[18%] h-[28%]" style={{ background: 'rgba(21,22,26,0.10)' }} />
          <div className="absolute right-0 top-0 w-[18%] h-[28%]" style={{ background: 'rgba(21,22,26,0.10)' }} />
          {/* neck */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[18%] h-[8%]" style={{ background: 'var(--paper)' }} />
          {/* graphic */}
          <div className="absolute left-1/2 top-[34%] -translate-x-1/2 font-display italic text-center" style={{ color: 'rgba(21,22,26,0.55)', fontSize: 'clamp(18px, 2.6vw, 30px)', lineHeight: 0.95 }}>
            {graphic}
          </div>
        </div>
      )}
      {shape === 'longsleeve' && (
        <div className="relative" style={{ width: '88%', aspectRatio: '1.35/1' }}>
          <div className="absolute inset-x-[24%] top-0 bottom-0" style={{ background: 'rgba(21,22,26,0.10)' }} />
          {/* sleeves */}
          <div className="absolute left-0 top-[6%] w-[26%] h-[70%]" style={{ background: 'rgba(21,22,26,0.10)' }} />
          <div className="absolute right-0 top-[6%] w-[26%] h-[70%]" style={{ background: 'rgba(21,22,26,0.10)' }} />
          {/* shoulders */}
          <div className="absolute left-[18%] top-0 w-[14%] h-[14%]" style={{ background: 'rgba(21,22,26,0.10)' }} />
          <div className="absolute right-[18%] top-0 w-[14%] h-[14%]" style={{ background: 'rgba(21,22,26,0.10)' }} />
          <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[14%] h-[6%]" style={{ background: 'var(--paper)' }} />
          <div className="absolute left-1/2 top-[34%] -translate-x-1/2 font-display italic text-center" style={{ color: 'rgba(21,22,26,0.55)', fontSize: 'clamp(16px, 2.4vw, 28px)', lineHeight: 0.95 }}>
            {graphic}
          </div>
        </div>
      )}
      {shape === 'cassette' && (
        <div className="relative" style={{ width: '52%', aspectRatio: '1.6/1' }}>
          <div className="absolute inset-0" style={{ background: 'rgba(21,22,26,0.18)' }} />
          <div className="absolute inset-x-[6%] top-[14%] bottom-[14%]" style={{ background: 'var(--paper)' }} />
          {/* reels */}
          <div className="absolute left-[22%] top-1/2 -translate-y-1/2 w-[14%] aspect-square rounded-full" style={{ background: 'rgba(21,22,26,0.20)' }} />
          <div className="absolute right-[22%] top-1/2 -translate-y-1/2 w-[14%] aspect-square rounded-full" style={{ background: 'rgba(21,22,26,0.20)' }} />
          <div className="absolute inset-x-0 top-[20%] font-mono text-center text-[10px] uppercase tracking-[0.24em]" style={{ color: 'rgba(21,22,26,0.55)' }}>
            {graphic}
          </div>
          <div className="absolute inset-x-0 bottom-[20%] font-mono text-center text-[9px] uppercase tracking-[0.28em]" style={{ color: 'rgba(21,22,26,0.45)' }}>
            side a · 22:14
          </div>
        </div>
      )}
      {shape === 'vinyl' && (
        <div className="relative" style={{ width: '64%', aspectRatio: '1/1' }}>
          {/* sleeve */}
          <div className="absolute inset-0" style={{ background: 'rgba(21,22,26,0.10)' }} />
          {/* record peeking out */}
          <div className="absolute left-[8%] top-1/2 -translate-y-1/2 w-[92%] aspect-square rounded-full" style={{ background: 'radial-gradient(circle at center, rgba(21,22,26,0.85) 0%, rgba(21,22,26,0.85) 22%, rgba(21,22,26,0.7) 23%, rgba(21,22,26,0.7) 24%, rgba(21,22,26,0.85) 25%)' }} />
          <div className="absolute left-[8%] top-1/2 -translate-y-1/2 w-[92%] aspect-square rounded-full flex items-center justify-center pointer-events-none">
            <div className="rounded-full" style={{ width: '34%', aspectRatio: '1/1', background: 'var(--accent)' }} />
          </div>
          <div className="absolute left-[8%] top-1/2 -translate-y-1/2 w-[92%] aspect-square rounded-full flex items-center justify-center">
            <div className="font-display italic" style={{ color: '#EFE6D6', fontSize: '14px' }}>{graphic}</div>
          </div>
        </div>
      )}
      {shape === 'poster' && (
        <div className="relative" style={{ width: '52%', aspectRatio: '0.72/1' }}>
          <div className="absolute inset-0" style={{ background: 'rgba(21,22,26,0.08)' }} />
          <div className="absolute inset-x-0 top-[8%] font-display italic text-center" style={{ color: 'rgba(21,22,26,0.75)', fontSize: '18px', lineHeight: 1 }}>
            mali
          </div>
          <div className="absolute inset-x-0 top-[16%] font-mono text-center text-[8px] uppercase tracking-[0.28em]" style={{ color: 'rgba(21,22,26,0.55)' }}>
            tour mmxxvi
          </div>
          <div className="absolute inset-x-[12%] top-[28%] bottom-[28%]" style={{ background: 'rgba(21,22,26,0.18)' }} />
          <div className="absolute inset-x-0 bottom-[8%] font-mono text-center text-[8px] uppercase tracking-[0.28em]" style={{ color: 'rgba(21,22,26,0.55)' }}>
            {graphic}
          </div>
        </div>
      )}
      {shape === 'stickers' && (
        <div className="relative grid grid-cols-2 gap-3" style={{ width: '58%' }}>
          <div className="aspect-square rounded-full flex items-center justify-center" style={{ background: 'rgba(21,22,26,0.10)' }}>
            <span className="font-display italic" style={{ color: 'rgba(21,22,26,0.65)', fontSize: '20px' }}>m</span>
          </div>
          <div className="aspect-square rounded-sm flex items-center justify-center" style={{ background: 'rgba(122,78,94,0.45)' }}>
            <span className="font-mono uppercase tracking-[0.28em] text-[9px]" style={{ color: '#EFE6D6' }}>mali</span>
          </div>
          <div className="aspect-square rounded-sm flex items-center justify-center" style={{ background: 'rgba(21,22,26,0.08)', transform: 'rotate(-4deg)' }}>
            <span className="font-display italic" style={{ color: 'rgba(21,22,26,0.55)', fontSize: '12px' }}>{graphic}</span>
          </div>
          <div className="aspect-square rounded-full flex items-center justify-center" style={{ background: 'rgba(21,22,26,0.14)' }}>
            <span className="font-mono uppercase tracking-[0.24em] text-[8px]" style={{ color: 'rgba(21,22,26,0.65)' }}>chapter i</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Collection grid ---------- */
function Collection() {
  const products = [
    { slug: 'last-year-tee', title: 'Last Year', kind: 'tee', price: 35, lsClass: 'ls-lastyear', flatClass: 'flat-warm', shape: 'tee', graphic: 'last\nyear' },
    { slug: 'who-really-won-longsleeve', title: 'Who Really Won?', kind: 'longsleeve', price: 48, lsClass: 'ls-who-ls', flatClass: 'flat-warm', shape: 'longsleeve', graphic: 'who really\nwon?' },
    { slug: 'who-really-won-cassette', title: 'Who Really Won?', kind: 'cassette', price: 18, lsClass: 'ls-cassette', flatClass: 'flat-warm', shape: 'cassette', graphic: 'who really won? — ep' },
    { slug: 'strange-vinyl', title: 'Strange', kind: '7" vinyl', price: 24, lsClass: 'ls-vinyl', flatClass: 'flat-cool', shape: 'vinyl', graphic: 'strange' },
    { slug: 'tour-poster', title: 'Tour Poster', kind: '18 × 24 in', price: 20, lsClass: 'ls-poster', flatClass: 'flat-warm', shape: 'poster', graphic: 'twelve cities' },
    { slug: 'sticker-pack', title: 'Sticker Pack', kind: 'set of 4', price: 8, lsClass: 'ls-stickers', flatClass: 'flat-warm', shape: 'stickers', graphic: 'mali' },
  ];

  return (
    <section id="shop" className="relative">
      <div className="mx-auto max-w-[1480px] px-6 md:px-10 lg:px-14 pt-24 md:pt-36">
        <div className="flex items-end justify-between gap-6">
          <SectionLabel index="02 / drop 001" label="six pieces" />
          <div className="hidden md:block font-mono text-[10px] uppercase tracking-[0.24em]" style={{ color: 'var(--ink-3)' }}>
            hover to flip
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 md:gap-x-10 md:gap-y-16 mt-10 md:mt-14">
          {products.map((p, i) => (
            <ProductCard key={p.slug} idx={i} {...p} />
          ))}
        </div>

        <div className="mt-14 md:mt-20 pt-6 border-t flex items-baseline justify-between gap-6 font-mono text-[10px] uppercase tracking-[0.24em]" style={{ borderColor: 'var(--rule)', color: 'var(--ink-3)' }}>
          <span>small batch. when it&rsquo;s gone it&rsquo;s gone.</span>
          <span>six of six shown</span>
        </div>
      </div>
    </section>
  );
}

/* ---------- Lookbook strip ---------- */
function Lookbook() {
  const shots = [
    { cls: 'lb-1', label: '01 — early light', tag: 'tee · worn' },
    { cls: 'lb-2', label: '02 — late room', tag: 'longsleeve · still' },
    { cls: 'lb-3', label: '03 — passage', tag: 'vinyl · hand' },
    { cls: 'lb-4', label: '04 — interior, no.2', tag: 'tee · close crop' },
    { cls: 'lb-5', label: '05 — window', tag: 'poster · pinned' },
    { cls: 'lb-6', label: '06 — after', tag: 'cassette · table' },
  ];

  return (
    <section className="relative pt-24 md:pt-36">
      <div className="mx-auto max-w-[1480px] px-6 md:px-10 lg:px-14">
        <SectionLabel index="03 / lookbook" label="chapter i — in context" right="scroll →" />
      </div>

      <div className="mt-10 md:mt-14 overflow-x-auto no-bar">
        <div className="flex gap-5 md:gap-7 pl-6 md:pl-10 lg:pl-14 pr-6 md:pr-10 lg:pr-14" style={{ width: 'max-content' }}>
          {shots.map((s, i) => (
            <Reveal key={s.label} delay={i * 50}>
              <figure className="shrink-0">
                <div className={`field ${s.cls}`} style={{ width: 'clamp(280px, 36vw, 520px)', aspectRatio: '4/5' }}>
                  <div className="absolute top-4 left-4 font-mono text-[9px] uppercase tracking-[0.28em]" style={{ color: 'rgba(239,230,214,0.55)' }}>
                    [ lifestyle image ]
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between font-mono text-[9px] uppercase tracking-[0.28em]" style={{ color: 'rgba(239,230,214,0.65)' }}>
                    <span>{s.label}</span>
                    <span>{s.tag}</span>
                  </div>
                </div>
              </figure>
            </Reveal>
          ))}
          {/* end card */}
          <div className="shrink-0 flex items-center" style={{ width: 'clamp(260px, 28vw, 380px)' }}>
            <div>
              <p className="font-display italic leading-[1] tracking-[-0.01em]" style={{ fontSize: 'clamp(36px, 4vw, 56px)' }}>
                the rest is on you.
              </p>
              <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.24em]" style={{ color: 'var(--ink-3)' }}>
                tag #malichapteri
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Email capture ---------- */
function Capture() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const onSubmit = (e) => { e.preventDefault(); if (email.trim()) setSubmitted(true); };

  return (
    <section id="next-drop" className="relative">
      <div className="mx-auto max-w-[1480px] px-6 md:px-10 lg:px-14 pt-28 md:pt-44">
        <div className="grid grid-cols-12 gap-6 md:gap-10 items-end">
          <Reveal className="col-span-12 md:col-span-7">
            <SectionLabel index="04 / list" label="next drop · sparingly" />
            <h3 className="font-display italic mt-5 leading-[0.95] tracking-[-0.01em]" style={{ fontSize: 'clamp(52px, 7vw, 108px)' }}>
              for the next one.
            </h3>
            <p className="mt-4 max-w-[42ch] text-[15px] leading-[1.65]" style={{ color: 'var(--ink-2)' }}>
              one note when chapter ii lands. nothing else.
            </p>
          </Reveal>

          <Reveal delay={140} className="col-span-12 md:col-span-5">
            {!submitted ? (
              <form onSubmit={onSubmit} className="md:pb-3">
                <label htmlFor="email" className="sr-only">email</label>
                <div className="flex items-end gap-4">
                  <input
                    id="email" type="email" required
                    placeholder="you@somewhere"
                    value={email}
                    onChange={(e)=>setEmail(e.target.value)}
                    className="line-input"
                  />
                  <button type="submit"
                          className="shrink-0 font-mono text-[11px] uppercase tracking-[0.24em] pb-3 inline-flex items-center gap-2 transition-colors"
                          style={{ color: 'var(--accent)' }}>
                    submit <Icon.Arrow width="14" height="14" />
                  </button>
                </div>
                <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em]" style={{ color: 'var(--ink-3)' }}>
                  no marketing. no weekly anything.
                </p>
              </form>
            ) : (
              <div className="md:pb-3">
                <p className="font-display italic text-[26px] leading-tight">noted. you&rsquo;ll be the first.</p>
                <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em]" style={{ color: 'var(--ink-3)' }}>
                  ({email})
                </p>
              </div>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------- Footer ---------- */
function Footer() {
  return (
    <footer className="relative mt-24 md:mt-36">
      <div className="mx-auto max-w-[1480px] px-6 md:px-10 lg:px-14">
        <div className="h-px w-full" style={{ background: 'var(--rule)' }} />
        <div className="grid grid-cols-12 gap-6 md:gap-10 py-10 md:py-14">
          <div className="col-span-12 md:col-span-5">
            <div className="font-display text-[44px] md:text-[64px] leading-[0.85] tracking-[-0.02em]">
              MALI<span className="font-mono text-[12px] uppercase tracking-[0.24em] ml-3 align-middle" style={{ color: 'var(--ink-3)' }}>/ shop</span>
            </div>
            <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.24em]" style={{ color: 'var(--ink-3)' }}>
              small batch. when it&rsquo;s gone it&rsquo;s gone.
            </div>
            <a href="https://akilahmali.com" className="mt-6 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.24em] ulink" style={{ color: 'var(--ink-2)' }}>
              ← back to akilahmali.com
            </a>
          </div>

          <div className="col-span-6 md:col-span-2 md:col-start-7">
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] mb-3" style={{ color: 'var(--ink-3)' }}>shop</div>
            <ul className="space-y-2 text-[14px]">
              <li><a className="ulink" href="#shop">drop 001</a></li>
              <li><a className="ulink" href="#next-drop">next drop</a></li>
              <li><a className="ulink" href="#cart">cart</a></li>
            </ul>
          </div>

          <div className="col-span-6 md:col-span-2">
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] mb-3" style={{ color: 'var(--ink-3)' }}>help</div>
            <ul className="space-y-2 text-[14px]">
              <li><a className="ulink" href="#shipping">shipping</a></li>
              <li><a className="ulink" href="#returns">returns</a></li>
              <li><a className="ulink" href="#sizing">sizing</a></li>
              <li><a className="ulink" href="#faq">faq</a></li>
            </ul>
          </div>

          <div className="col-span-12 md:col-span-2">
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] mb-3" style={{ color: 'var(--ink-3)' }}>contact</div>
            <ul className="space-y-2 text-[14px]">
              <li><a className="ulink" href="mailto:shop@akilahmali.com">shop@akilahmali.com</a></li>
              <li className="font-mono text-[10px] uppercase tracking-[0.22em]" style={{ color: 'var(--ink-3)' }}>orders ship mon · thu</li>
            </ul>
          </div>
        </div>

        <div className="h-px w-full" style={{ background: 'var(--rule)' }} />
        <div className="py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.24em]" style={{ color: 'var(--ink-3)' }}>
          <div>© 2025 akilah mali</div>
          <div>brooklyn, n.y. · shop v.01</div>
          <div>usd · ships worldwide</div>
        </div>
      </div>
    </footer>
  );
}

/* ---------- App ---------- */
function App() {
  return (
    <main className="w-full overflow-x-clip">
      <Nav cartCount={0} />
      <Hero />
      <Featured />
      <Collection />
      <Lookbook />
      <Capture />
      <Footer />
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
