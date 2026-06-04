const { useState, useEffect, useRef } = React;

/* ---------- Icons (lucide-style) ---------- */
const Icon = {
  X: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M18 6 6 18M6 6l12 12"/>
    </svg>
  ),
  Plus: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" {...p}><path d="M12 5v14M5 12h14"/></svg>
  ),
  Minus: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" {...p}><path d="M5 12h14"/></svg>
  ),
  Arrow: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" {...p}><path d="M5 12h14M13 6l6 6-6 6"/></svg>
  ),
  Bag: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M6 8h12l-1 11.5a1.5 1.5 0 0 1-1.5 1.4h-7a1.5 1.5 0 0 1-1.5-1.4L6 8z"/>
      <path d="M9 8a3 3 0 0 1 6 0"/>
    </svg>
  ),
};

/* ---------- Thumbnail (small lifestyle field) ---------- */
function Thumb({ lsClass, label }) {
  return (
    <div className={`field ${lsClass}`} style={{ width: 64, height: 80, flexShrink: 0 }}>
      <div className="absolute inset-0 flex items-end p-1.5">
        <span className="font-mono uppercase tracking-[0.24em]" style={{ color: 'rgba(239,230,214,0.55)', fontSize: '7px' }}>{label}</span>
      </div>
    </div>
  );
}

/* ---------- Initial cart data ---------- */
const INITIAL_ITEMS = [
  { id: 'wrw-ls-m',  slug: 'who-really-won-longsleeve', title: 'Who Really Won?', kind: 'longsleeve',  variant: 'bone · m',     price: 48, qty: 1, lsClass: 'ls-who-ls' },
  { id: 'strange-7', slug: 'strange-vinyl',             title: 'Strange',         kind: '7" vinyl',     variant: 'limited press', price: 24, qty: 1, lsClass: 'ls-vinyl' },
  { id: 'stickers',  slug: 'sticker-pack',              title: 'Sticker Pack',    kind: 'set of 4',     variant: 'one size',      price: 8,  qty: 2, lsClass: 'ls-stickers' },
];

/* ---------- Cart line item ---------- */
function LineItem({ item, onQty, onRemove, removing }) {
  const lineTotal = item.price * item.qty;
  return (
    <li className={`li-row flex gap-4 py-5 ${removing ? 'is-removing' : ''}`} style={{ borderBottom: '1px solid var(--rule)', maxHeight: 240 }}>
      <Thumb lsClass={item.lsClass} label={item.kind} />
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="font-display text-[20px] leading-[1.05] tracking-[-0.005em] truncate">{item.title}</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] mt-1.5" style={{ color: 'var(--ink-3)' }}>
              {item.kind} · {item.variant}
            </div>
          </div>
          <div className="font-mono text-[13px] tabular-nums whitespace-nowrap" style={{ color: 'var(--ink)' }}>
            ${lineTotal.toFixed(2)}
          </div>
        </div>

        <div className="mt-auto pt-3 flex items-center justify-between">
          <div className="qty">
            <button className="qty-btn" onClick={() => onQty(item.id, item.qty - 1)} disabled={item.qty <= 1} aria-label="decrease">
              <Icon.Minus width="12" height="12" />
            </button>
            <span className="qty-val">{String(item.qty).padStart(2,'0')}</span>
            <button className="qty-btn" onClick={() => onQty(item.id, item.qty + 1)} disabled={item.qty >= 6} aria-label="increase">
              <Icon.Plus width="12" height="12" />
            </button>
          </div>
          <button onClick={() => onRemove(item.id)}
                  className="font-mono text-[10px] uppercase tracking-[0.24em] ulink hover:text-[color:var(--ink-2)] transition-colors"
                  style={{ color: 'var(--ink-3)' }}>
            remove
          </button>
        </div>
      </div>
    </li>
  );
}

/* ---------- Empty state ---------- */
function Empty({ onClose }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-8 fade-up">
      <div style={{ color: 'var(--ink-3)' }}>
        <Icon.Bag width="36" height="36" />
      </div>
      <p className="font-display italic mt-5 leading-[1.05] tracking-[-0.01em]" style={{ fontSize: 'clamp(38px, 5vw, 56px)' }}>
        your cart is empty.
      </p>
      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.24em] max-w-[28ch]" style={{ color: 'var(--ink-3)' }}>
        the longsleeve is a good place to start.
      </p>
      <a href="product detail.html"
         className="mt-6 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.24em] ulink ulink-on pb-1"
         style={{ color: 'var(--accent)' }}>
        who really won? longsleeve <Icon.Arrow width="14" height="14" />
      </a>
      <button onClick={onClose}
              className="mt-10 font-mono text-[10px] uppercase tracking-[0.24em] ulink"
              style={{ color: 'var(--ink-3)' }}>
        continue shopping
      </button>
    </div>
  );
}

/* ---------- Drawer ---------- */
function Drawer({ open, onClose, items, setItems }) {
  const panelRef = useRef(null);

  // Esc closes
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && open) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Track items removing so we can animate
  const [removingId, setRemovingId] = useState(null);

  const onQty = (id, qty) => {
    if (qty < 1) return;
    setItems((arr) => arr.map(it => it.id === id ? { ...it, qty } : it));
  };
  const onRemove = (id) => {
    setRemovingId(id);
    setTimeout(() => {
      setItems((arr) => arr.filter(it => it.id !== id));
      setRemovingId(null);
    }, 380);
  };

  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  const totalCount = items.reduce((s, it) => s + it.qty, 0);
  const isEmpty = items.length === 0;

  return (
    <div className={`drawer-root ${open ? 'is-open' : ''}`} aria-hidden={!open}>
      <div className="drawer-backdrop" onClick={onClose} />
      <aside className="drawer-panel" ref={panelRef} role="dialog" aria-label="cart">
        {/* top bar */}
        <header className="flex items-baseline justify-between px-6 md:px-7 pt-6 pb-5" style={{ borderBottom: '1px solid var(--rule)' }}>
          <div className="flex items-baseline gap-3">
            <h2 className="font-display text-[32px] md:text-[36px] leading-none tracking-[-0.01em]">Cart</h2>
            {!isEmpty && (
              <span className="font-mono text-[10px] uppercase tracking-[0.24em]" style={{ color: 'var(--ink-3)' }}>
                ({String(totalCount).padStart(2,'0')})
              </span>
            )}
          </div>
          <button onClick={onClose} aria-label="close cart"
                  className="font-mono text-[10px] uppercase tracking-[0.24em] inline-flex items-center gap-2 hover:text-[color:var(--ink)] transition-colors"
                  style={{ color: 'var(--ink-2)' }}>
            close <Icon.X width="16" height="16" />
          </button>
        </header>

        {isEmpty ? (
          <Empty onClose={onClose} />
        ) : (
          <>
            {/* items */}
            <div className="flex-1 overflow-y-auto px-6 md:px-7">
              <ul className="divide-rule">
                {items.map((it) => (
                  <LineItem key={it.id} item={it} onQty={onQty} onRemove={onRemove} removing={removingId === it.id} />
                ))}
              </ul>

              <div className="py-5 font-mono text-[10px] uppercase tracking-[0.24em] flex items-center gap-3" style={{ color: 'var(--ink-3)' }}>
                <span>small batch</span>
                <span className="block flex-1 h-px" style={{ background: 'var(--rule)' }} />
                <span>when it&rsquo;s gone it&rsquo;s gone</span>
              </div>
            </div>

            {/* totals + checkout */}
            <footer className="px-6 md:px-7 pt-5 pb-7" style={{ borderTop: '1px solid var(--rule)', background: 'var(--bg)' }}>
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.24em]" style={{ color: 'var(--ink-3)' }}>subtotal</span>
                <span className="font-display text-[32px] leading-none tabular-nums tracking-[-0.01em]">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.24em]" style={{ color: 'var(--ink-3)' }}>
                shipping calculated at checkout.
              </p>

              <button className="ck mt-5">
                <span>checkout</span>
                <span className="inline-flex items-center gap-2">— <Icon.Arrow width="14" height="14" /></span>
              </button>

              <div className="mt-4 text-center">
                <button onClick={onClose}
                        className="font-mono text-[10px] uppercase tracking-[0.24em] ulink"
                        style={{ color: 'var(--ink-3)' }}>
                  continue shopping
                </button>
              </div>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}

/* ---------- Background page (minimal context behind drawer) ---------- */
function BgPage({ cartCount, onOpenCart }) {
  return (
    <div className="bg-page w-full min-h-[100svh]">
      {/* nav */}
      <header className="fixed top-0 inset-x-0 z-40" style={{ background: 'linear-gradient(180deg, rgba(244,242,238,0.9) 0%, rgba(244,242,238,0) 100%)', backdropFilter: 'blur(6px)' }}>
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
            <button onClick={onOpenCart} className="ulink hover:text-[color:var(--ink)] transition-colors inline-flex items-baseline gap-1">
              cart <span style={{ color: 'var(--ink-3)' }}>({String(cartCount).padStart(2,'0')})</span>
            </button>
          </nav>
        </div>
      </header>

      {/* faint context */}
      <section className="mx-auto max-w-[1480px] px-6 md:px-10 lg:px-14 pt-32 md:pt-44 pb-24">
        <div className="font-mono text-[10px] uppercase tracking-[0.28em]" style={{ color: 'var(--ink-3)' }}>
          drop 001 — chapter i
        </div>
        <h1 className="font-display italic mt-4 leading-[0.92] tracking-[-0.02em]" style={{ fontSize: 'clamp(80px, 14vw, 220px)' }}>
          shop.
        </h1>
        <p className="mt-6 max-w-[44ch] text-[15px] leading-[1.7]" style={{ color: 'var(--ink-2)' }}>
          six pieces, one drop. small batch &mdash; when it&rsquo;s gone it&rsquo;s gone.
        </p>
      </section>
    </div>
  );
}

/* ---------- App ---------- */
function App() {
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [open, setOpen] = useState(true); // start open so drawer is visible on load

  // toggle body class for bg-blur effect
  useEffect(() => {
    document.body.classList.toggle('drawer-open', open);
  }, [open]);

  const cartCount = items.reduce((s, it) => s + it.qty, 0);

  return (
    <main className="w-full overflow-x-clip">
      <BgPage cartCount={cartCount} onOpenCart={() => setOpen(true)} />
      <Drawer open={open} onClose={() => setOpen(false)} items={items} setItems={setItems} />

      {/* tiny demo affordance — reset to seeded state, persistent across drawer open/close */}
      <button onClick={() => setItems(INITIAL_ITEMS)}
              className="fixed bottom-4 left-4 z-[120] font-mono text-[10px] uppercase tracking-[0.24em] ulink hidden sm:inline-flex"
              style={{ color: 'var(--ink-3)' }}>
        [ demo · refill cart ]
      </button>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
