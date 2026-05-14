const { useState, useEffect, useRef } = React;

/* ---------- Icons ---------- */
const Icon = {
  Arrow: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" {...p}><path d="M5 12h14M13 6l6 6-6 6"/></svg>
  ),
  Plus: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" {...p}><path d="M12 5v14M5 12h14"/></svg>
  ),
  Minus: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" {...p}><path d="M5 12h14"/></svg>
  ),
  Check: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><path d="M4 12l5 5L20 6"/></svg>
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
    <header className="fixed top-0 inset-x-0 z-50" style={{ background: 'linear-gradient(180deg, rgba(244,242,238,0.9) 0%, rgba(244,242,238,0) 100%)', backdropFilter: 'blur(6px)' }}>
      <div className="mx-auto max-w-[1480px] px-6 md:px-10 lg:px-14 pt-5 md:pt-7 pb-4 flex items-baseline justify-between">
        <div className="flex items-baseline gap-5 md:gap-7">
          <a href="https://malicantsing.com" className="hidden sm:inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.24em] ulink" style={{ color: 'var(--ink-3)' }}>
            ← malicantsing.com
          </a>
          <a href="shop home.html" className="font-display tracking-[-0.01em] text-[19px] md:text-[22px] leading-none">
            MALI<span className="font-mono text-[10px] uppercase tracking-[0.24em] ml-2 align-middle" style={{ color: 'var(--ink-3)' }}>/ shop</span>
          </a>
        </div>
        <nav className="flex items-baseline gap-6 md:gap-9 font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: 'var(--ink-2)' }}>
          <a href="shop home.html" className="ulink hover:text-[color:var(--ink)] transition-colors">shop</a>
          <a href="#about" className="ulink hover:text-[color:var(--ink)] transition-colors hidden sm:inline">about</a>
          <a href="#cart" className="ulink hover:text-[color:var(--ink)] transition-colors inline-flex items-baseline gap-1">
            cart <span style={{ color: 'var(--ink-3)' }}>({String(cartCount).padStart(2,'0')})</span>
          </a>
        </nav>
      </div>
    </header>
  );
}

/* ---------- Breadcrumb ---------- */
function Crumb() {
  return (
    <div className="mx-auto max-w-[1480px] px-6 md:px-10 lg:px-14 pt-24 md:pt-28">
      <div className="font-mono text-[10px] uppercase tracking-[0.28em] flex items-center gap-3" style={{ color: 'var(--ink-3)' }}>
        <a href="shop home.html" className="ulink hover:text-[color:var(--ink-2)] transition-colors">shop</a>
        <span>/</span>
        <span>drop 001</span>
        <span>/</span>
        <span style={{ color: 'var(--ink-2)' }}>who really won? longsleeve</span>
      </div>
    </div>
  );
}

/* ---------- Image placeholders (per view) ---------- */
function ImgOnBody({ label }) {
  return (
    <div className="absolute inset-0 field ls-onbody">
      <div className="absolute top-5 left-5 font-mono text-[10px] uppercase tracking-[0.28em]" style={{ color: 'rgba(239,230,214,0.6)' }}>
        [ image · on body, interior ]
      </div>
      <div className="absolute top-5 right-5 text-right font-mono text-[10px] uppercase tracking-[0.28em]" style={{ color: 'rgba(239,230,214,0.6)' }}>
        <div>fig. a</div>
        <div className="mt-1">{label || '01 / 03'}</div>
      </div>
      <div className="absolute bottom-5 left-5 font-mono text-[10px] uppercase tracking-[0.28em]" style={{ color: 'rgba(239,230,214,0.55)' }}>
        who really won? · longsleeve · bone
      </div>
    </div>
  );
}

function ImgFlat({ label }) {
  return (
    <div className="absolute inset-0 flat-warm">
      <div className="absolute top-5 left-5 font-mono text-[10px] uppercase tracking-[0.28em]" style={{ color: 'var(--ink-3)' }}>
        [ flat · on paper ]
      </div>
      <div className="absolute top-5 right-5 text-right font-mono text-[10px] uppercase tracking-[0.28em]" style={{ color: 'var(--ink-3)' }}>
        <div>fig. b</div>
        <div className="mt-1">{label || '02 / 03'}</div>
      </div>
      {/* longsleeve silhouette */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative" style={{ width: '78%', aspectRatio: '1.35/1' }}>
          <div className="absolute inset-x-[24%] top-[4%] bottom-0" style={{ background: 'rgba(21,22,26,0.10)' }} />
          <div className="absolute left-0 top-[8%] w-[26%] h-[70%]" style={{ background: 'rgba(21,22,26,0.10)' }} />
          <div className="absolute right-0 top-[8%] w-[26%] h-[70%]" style={{ background: 'rgba(21,22,26,0.10)' }} />
          <div className="absolute left-[18%] top-[2%] w-[14%] h-[14%]" style={{ background: 'rgba(21,22,26,0.10)' }} />
          <div className="absolute right-[18%] top-[2%] w-[14%] h-[14%]" style={{ background: 'rgba(21,22,26,0.10)' }} />
          <div className="absolute left-1/2 -translate-x-1/2 top-[2%] w-[14%] h-[6%]" style={{ background: 'var(--paper)' }} />
          {/* graphic */}
          <div className="absolute left-1/2 top-[36%] -translate-x-1/2 font-display italic text-center leading-[0.95]" style={{ color: 'rgba(21,22,26,0.55)', fontSize: 'clamp(20px, 2.6vw, 32px)' }}>
            who really<br/>won?
          </div>
        </div>
      </div>
      <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between font-mono text-[10px] uppercase tracking-[0.28em]" style={{ color: 'var(--ink-3)' }}>
        <span>front</span>
        <span>heavyweight cotton · bone</span>
      </div>
    </div>
  );
}

function ImgDetail({ label }) {
  return (
    <div className="absolute inset-0 field ls-detail">
      <div className="absolute top-5 left-5 font-mono text-[10px] uppercase tracking-[0.28em]" style={{ color: 'rgba(239,230,214,0.6)' }}>
        [ detail · close crop · back print ]
      </div>
      <div className="absolute top-5 right-5 text-right font-mono text-[10px] uppercase tracking-[0.28em]" style={{ color: 'rgba(239,230,214,0.6)' }}>
        <div>fig. c</div>
        <div className="mt-1">{label || '03 / 03'}</div>
      </div>
      {/* simulated print on fabric — italic lyric block */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="font-display italic text-center max-w-[60%] leading-[1.1]" style={{ color: 'rgba(239,230,214,0.78)', fontSize: 'clamp(18px, 2.4vw, 28px)' }}>
          &ldquo;been there once,<br/>and i can&rsquo;t go back.&rdquo;
        </div>
      </div>
      <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between font-mono text-[10px] uppercase tracking-[0.28em]" style={{ color: 'rgba(239,230,214,0.6)' }}>
        <span>back · screen print</span>
        <span>plum on bone</span>
      </div>
    </div>
  );
}

/* ---------- Gallery ---------- */
function Gallery() {
  const [active, setActive] = useState(0);
  const views = [
    { id: 'onbody', label: 'on body', Comp: ImgOnBody },
    { id: 'flat',   label: 'flat',    Comp: ImgFlat },
    { id: 'detail', label: 'detail',  Comp: ImgDetail },
  ];
  const Active = views[active].Comp;

  return (
    <div>
      <Reveal>
        <div className="relative w-full" style={{ aspectRatio: '4/5' }}>
          <Active label={`${String(active+1).padStart(2,'0')} / ${String(views.length).padStart(2,'0')}`} />
        </div>
      </Reveal>

      <div className="grid grid-cols-3 gap-3 md:gap-4 mt-3 md:mt-4">
        {views.map((v, i) => {
          const Thumb = v.Comp;
          return (
            <button key={v.id} onClick={() => setActive(i)} aria-label={v.label}
                    className={`thumb relative w-full ${active === i ? 'is-on' : ''}`}
                    style={{ aspectRatio: '4/5' }}>
              <Thumb label="" />
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.28em]" style={{ color: 'var(--ink-3)' }}>
        <span>{views[active].label}</span>
        <span>{String(active+1).padStart(2,'0')} / {String(views.length).padStart(2,'0')}</span>
      </div>
    </div>
  );
}

/* ---------- Disclosure ---------- */
function Disc({ title, children, defaultOpen = false }) {
  return (
    <details className="disc border-t" style={{ borderColor: 'var(--rule)' }} open={defaultOpen}>
      <summary className="py-5 flex items-center justify-between gap-4 font-mono text-[11px] uppercase tracking-[0.24em]" style={{ color: 'var(--ink-2)' }}>
        <span>{title}</span>
        <span className="disc-icon" style={{ display: 'inline-flex' }}>
          <Icon.Plus width="14" height="14" />
        </span>
      </summary>
      <div className="disc-body pb-6 text-[14px] leading-[1.7]" style={{ color: 'var(--ink-2)' }}>
        {children}
      </div>
    </details>
  );
}

/* ---------- Info column ---------- */
function Info() {
  const sizes = [
    { id: 'xs', label: 'xs', stock: true },
    { id: 's',  label: 's',  stock: true },
    { id: 'm',  label: 'm',  stock: true },
    { id: 'l',  label: 'l',  stock: false },
    { id: 'xl', label: 'xl', stock: true },
  ];
  const [size, setSize] = useState('m');
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const onAdd = () => {
    if (adding || added) return;
    setAdding(true);
    setTimeout(() => {
      setAdding(false);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    }, 350);
  };

  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.28em]" style={{ color: 'var(--ink-3)' }}>
        drop 001 · the hero piece
      </div>
      <h1 className="font-display italic mt-3 leading-[0.92] tracking-[-0.01em]" style={{ fontSize: 'clamp(54px, 6.2vw, 96px)' }}>
        who really<br/>won?
      </h1>
      <div className="mt-3 font-mono text-[11px] uppercase tracking-[0.24em]" style={{ color: 'var(--ink-2)' }}>
        longsleeve
      </div>

      <div className="mt-6 flex items-baseline gap-5">
        <div className="font-mono text-[22px] tabular-nums" style={{ color: 'var(--ink)' }}>$48.00</div>
        <div className="font-mono text-[10px] uppercase tracking-[0.24em]" style={{ color: 'var(--ink-3)' }}>usd · ships worldwide</div>
      </div>

      <p className="mt-6 text-[15px] leading-[1.7] max-w-[44ch]" style={{ color: 'var(--ink-2)' }}>
        100% cotton long-sleeve in bone. Front: nothing. Back: lyric print, screen-printed.
      </p>

      {/* scarcity */}
      <div className="mt-7 font-mono text-[10px] uppercase tracking-[0.24em] flex items-center gap-3" style={{ color: 'var(--ink-3)' }}>
        <span>32 of 60 remain</span>
        <span className="block flex-1 h-px relative overflow-hidden" style={{ background: 'var(--rule)' }}>
          <span className="absolute left-0 top-0 bottom-0" style={{ width: '53%', background: 'var(--accent)' }} />
        </span>
      </div>

      {/* color */}
      <div className="mt-9">
        <div className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.24em]" style={{ color: 'var(--ink-3)' }}>
          <span>color</span>
          <span style={{ color: 'var(--ink-2)' }}>bone</span>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <button aria-label="bone" className="swatch is-on" style={{ background: '#E6DFD0' }} />
        </div>
      </div>

      {/* size */}
      <div className="mt-7">
        <div className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.24em]" style={{ color: 'var(--ink-3)' }}>
          <span>size</span>
          <a href="#sizing" className="ulink hover:text-[color:var(--ink-2)] transition-colors">size guide</a>
        </div>
        <div className="mt-2 flex items-center gap-1">
          {sizes.map((s) => (
            <button key={s.id}
                    disabled={!s.stock}
                    onClick={() => s.stock && setSize(s.id)}
                    className={`size-btn ${size === s.id ? 'is-on' : ''} ${!s.stock ? 'is-out' : ''}`}>
              {s.label}
            </button>
          ))}
        </div>
        {!sizes.find(s => s.id === size)?.stock ? null : (
          <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.24em]" style={{ color: 'var(--ink-3)' }}>
            {size === 'l' ? 'sold out' : 'in stock'}
          </div>
        )}
      </div>

      {/* qty + atc */}
      <div className="mt-8 flex items-stretch gap-4">
        <div className="flex items-center justify-between border px-2" style={{ borderColor: 'var(--ink)', minWidth: 110 }}>
          <button className="qty-btn" disabled={qty <= 1} onClick={() => setQty(q => Math.max(1, q - 1))} aria-label="decrease">
            <Icon.Minus width="14" height="14" />
          </button>
          <span className="font-mono text-[14px] tabular-nums" style={{ minWidth: 24, textAlign: 'center' }}>{String(qty).padStart(2,'0')}</span>
          <button className="qty-btn" disabled={qty >= 6} onClick={() => setQty(q => Math.min(6, q + 1))} aria-label="increase">
            <Icon.Plus width="14" height="14" />
          </button>
        </div>
        <button className={`atc ${added ? 'is-added' : ''}`} onClick={onAdd}>
          {added ? (
            <>
              <span className="inline-flex items-center gap-2"><Icon.Check width="14" height="14" /> added</span>
              <span>—</span>
            </>
          ) : adding ? (
            <>
              <span>adding…</span>
              <span>—</span>
            </>
          ) : (
            <>
              <span>add to cart</span>
              <span>$48.00</span>
            </>
          )}
        </button>
      </div>

      {/* misc */}
      <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.24em]" style={{ color: 'var(--ink-3)' }}>
        ships within 5 business days · brooklyn, n.y.
      </div>

      {/* disclosures */}
      <div className="mt-10" style={{ borderBottom: '1px solid var(--rule)' }}>
        <Disc title="materials & fit">
          <p className="max-w-[58ch]">
            100% heavyweight cotton (260 gsm). Garment-dyed in a single run, so each piece reads slightly different in the light. Cut for a relaxed but not oversized fit — model is 5&rsquo;9&rdquo;, wearing M. Ribbed crew, drop shoulder, cuffed sleeve.
          </p>
        </Disc>
        <Disc title="shipping & returns">
          <p className="max-w-[58ch]">
            Ships from Brooklyn within 5 business days. Domestic $6 flat, international from $18. Exchanges within 14 days for unworn pieces — drop a note to <a className="ulink ulink-on" href="mailto:shop@malicantsing.com">shop@malicantsing.com</a>. Limited drops are final sale once they sell through.
          </p>
        </Disc>
        <Disc title="care">
          <p className="max-w-[58ch]">
            Inside out, cold water, hang dry. Iron on the reverse, skip the print. The bone gets softer the worse you treat it. Don&rsquo;t bleach. Don&rsquo;t love it less.
          </p>
        </Disc>
      </div>
    </div>
  );
}

/* ---------- Pairs with ---------- */
function FlatTee() {
  return (
    <div className="absolute inset-0 flat-warm">
      <div className="absolute top-4 left-4 font-mono text-[9px] uppercase tracking-[0.28em]" style={{ color: 'var(--ink-3)' }}>[ flat ]</div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative" style={{ width: '70%', aspectRatio: '1.05/1' }}>
          <div className="absolute inset-x-[12%] top-0 bottom-0" style={{ background: 'rgba(21,22,26,0.10)' }} />
          <div className="absolute left-0 top-0 w-[18%] h-[28%]" style={{ background: 'rgba(21,22,26,0.10)' }} />
          <div className="absolute right-0 top-0 w-[18%] h-[28%]" style={{ background: 'rgba(21,22,26,0.10)' }} />
          <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[18%] h-[8%]" style={{ background: 'var(--paper)' }} />
          <div className="absolute left-1/2 top-[34%] -translate-x-1/2 font-display italic text-center leading-[0.95]" style={{ color: 'rgba(21,22,26,0.55)', fontSize: 'clamp(18px, 2.4vw, 28px)' }}>
            last<br/>year
          </div>
        </div>
      </div>
    </div>
  );
}

function FlatCassette() {
  return (
    <div className="absolute inset-0 flat-warm">
      <div className="absolute top-4 left-4 font-mono text-[9px] uppercase tracking-[0.28em]" style={{ color: 'var(--ink-3)' }}>[ flat ]</div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative" style={{ width: '52%', aspectRatio: '1.6/1' }}>
          <div className="absolute inset-0" style={{ background: 'rgba(21,22,26,0.18)' }} />
          <div className="absolute inset-x-[6%] top-[14%] bottom-[14%]" style={{ background: 'var(--paper)' }} />
          <div className="absolute left-[22%] top-1/2 -translate-y-1/2 w-[14%] aspect-square rounded-full" style={{ background: 'rgba(21,22,26,0.20)' }} />
          <div className="absolute right-[22%] top-1/2 -translate-y-1/2 w-[14%] aspect-square rounded-full" style={{ background: 'rgba(21,22,26,0.20)' }} />
          <div className="absolute inset-x-0 top-[20%] font-mono text-center text-[10px] uppercase tracking-[0.24em]" style={{ color: 'rgba(21,22,26,0.55)' }}>who really won? — ep</div>
        </div>
      </div>
    </div>
  );
}

function FlatPoster() {
  return (
    <div className="absolute inset-0 flat-warm">
      <div className="absolute top-4 left-4 font-mono text-[9px] uppercase tracking-[0.28em]" style={{ color: 'var(--ink-3)' }}>[ flat ]</div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative" style={{ width: '52%', aspectRatio: '0.72/1' }}>
          <div className="absolute inset-0" style={{ background: 'rgba(21,22,26,0.08)' }} />
          <div className="absolute inset-x-0 top-[8%] font-display italic text-center" style={{ color: 'rgba(21,22,26,0.75)', fontSize: '18px', lineHeight: 1 }}>mali</div>
          <div className="absolute inset-x-0 top-[16%] font-mono text-center text-[8px] uppercase tracking-[0.28em]" style={{ color: 'rgba(21,22,26,0.55)' }}>tour mmxxvi</div>
          <div className="absolute inset-x-[12%] top-[28%] bottom-[28%]" style={{ background: 'rgba(21,22,26,0.18)' }} />
          <div className="absolute inset-x-0 bottom-[8%] font-mono text-center text-[8px] uppercase tracking-[0.28em]" style={{ color: 'rgba(21,22,26,0.55)' }}>twelve cities</div>
        </div>
      </div>
    </div>
  );
}

function PairCard({ idx, slug, title, kind, price, lsClass, FlatComp }) {
  return (
    <Reveal delay={idx * 80}>
      <a href={`#p/${slug}`} className="block group pc-swap">
        <div className="relative w-full aspect-[4/5] overflow-hidden">
          <div className={`pc-ls absolute inset-0 field ${lsClass}`}>
            <div className="absolute top-4 left-4 font-mono text-[9px] uppercase tracking-[0.28em]" style={{ color: 'rgba(239,230,214,0.55)' }}>[ lifestyle · {kind} ]</div>
            <div className="absolute bottom-4 left-4 font-mono text-[9px] uppercase tracking-[0.28em]" style={{ color: 'rgba(239,230,214,0.5)' }}>fig. {String(idx + 2).padStart(2,'0')}</div>
          </div>
          <div className="pc-flat absolute inset-0">
            <FlatComp />
          </div>
        </div>
        <div className="mt-4 flex items-baseline justify-between gap-4">
          <div>
            <div className="font-display text-[22px] md:text-[24px] leading-[1.05] tracking-[-0.005em]">{title}</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.28em] mt-1.5" style={{ color: 'var(--ink-3)' }}>{kind}</div>
          </div>
          <div className="font-mono text-[14px] tabular-nums whitespace-nowrap" style={{ color: 'var(--ink)' }}>${price.toFixed(2)}</div>
        </div>
      </a>
    </Reveal>
  );
}

function PairsWith() {
  return (
    <section className="relative pt-28 md:pt-40">
      <div className="mx-auto max-w-[1480px] px-6 md:px-10 lg:px-14">
        <div className="flex items-baseline gap-4 font-mono text-[10px] uppercase tracking-[0.28em]" style={{ color: 'var(--ink-3)' }}>
          <span>pairs with</span>
          <span className="block h-px flex-1" style={{ background: 'var(--rule)' }} />
          <span>three picks</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 md:gap-x-10 md:gap-y-16 mt-10 md:mt-14">
          <PairCard idx={0} slug="last-year-tee" title="Last Year" kind="tee" price={35} lsClass="ls-pair-1" FlatComp={FlatTee} />
          <PairCard idx={1} slug="who-really-won-cassette" title="Who Really Won?" kind="cassette" price={18} lsClass="ls-pair-2" FlatComp={FlatCassette} />
          <PairCard idx={2} slug="tour-poster" title="Tour Poster" kind="18 × 24 in" price={20} lsClass="ls-pair-3" FlatComp={FlatPoster} />
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
            <a href="https://malicantsing.com" className="mt-6 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.24em] ulink" style={{ color: 'var(--ink-2)' }}>
              ← back to malicantsing.com
            </a>
          </div>
          <div className="col-span-6 md:col-span-2 md:col-start-7">
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] mb-3" style={{ color: 'var(--ink-3)' }}>shop</div>
            <ul className="space-y-2 text-[14px]">
              <li><a className="ulink" href="shop home.html">drop 001</a></li>
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
              <li><a className="ulink" href="mailto:shop@malicantsing.com">shop@malicantsing.com</a></li>
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
      <Crumb />
      <section className="mx-auto max-w-[1480px] px-6 md:px-10 lg:px-14 pt-8 md:pt-10">
        <div className="grid grid-cols-12 gap-6 md:gap-10 lg:gap-14">
          <div className="col-span-12 md:col-span-7">
            <Gallery />
          </div>
          <div className="col-span-12 md:col-span-5">
            <div className="md:sticky" style={{ top: '96px' }}>
              <Info />
            </div>
          </div>
        </div>
      </section>
      <PairsWith />
      <Footer />
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
