import NextLink from "next/link";

const POLICIES = [
  { label: "shipping", href: "/shop/policies/shipping" },
  { label: "returns", href: "/shop/policies/returns" },
  { label: "faq", href: "/shop/policies/faq" },
  { label: "terms", href: "/shop/policies/terms" },
];

const SUPPORT_EMAIL = "shop@malicantsing.com";

export function StoreFooter() {
  return (
    <footer
      className="relative mt-section md:mt-section-lg"
      aria-label="Shop footer"
    >
      <div className="mx-auto max-w-page px-gutter md:px-gutter-md lg:px-gutter-lg">
        <div className="h-px w-full bg-rule" />
        <div className="grid grid-cols-12 gap-6 md:gap-10 py-10 md:py-14">
          <div className="col-span-12 md:col-span-4">
            <div className="font-display text-[44px] md:text-[64px] leading-[0.85] tracking-display">
              MALI
              <span className="font-mono text-mono-xs uppercase tracking-caps-md ml-3 align-middle text-ink-3">
                / shop
              </span>
            </div>
            <p className="mt-3 font-mono text-mono-xs uppercase tracking-caps-md text-ink-3">
              small batch. when it&rsquo;s gone it&rsquo;s gone.
            </p>
          </div>

          <FooterCol title="policies" className="col-span-6 md:col-span-3">
            <ul className="space-y-2 text-[14px]">
              {POLICIES.map(({ label, href }) => (
                <li key={label}>
                  <NextLink href={href} className="ulink">
                    {label}
                  </NextLink>
                </li>
              ))}
            </ul>
          </FooterCol>

          <FooterCol title="support" className="col-span-6 md:col-span-3">
            <ul className="space-y-2 text-[14px]">
              <li>
                <a className="ulink" href={`mailto:${SUPPORT_EMAIL}`}>
                  {SUPPORT_EMAIL}
                </a>
              </li>
              <li className="font-mono text-mono-xs uppercase tracking-caps text-ink-3">
                replies within 48 hours.
              </li>
            </ul>
          </FooterCol>

          <FooterCol title="back" className="col-span-12 md:col-span-2">
            <ul className="space-y-2 text-[14px]">
              <li>
                <a className="ulink" href="https://malicantsing.com">
                  ← malicantsing.com
                </a>
              </li>
            </ul>
          </FooterCol>
        </div>

        <div className="h-px w-full bg-rule" />
        <div className="py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 font-mono text-mono-xs uppercase tracking-caps-md text-ink-3">
          <div>© {new Date().getFullYear()} akilah mali — all products</div>
          <div>brooklyn, n.y. · shop v.01</div>
          <div>
            press &amp; sync &nbsp;·&nbsp;{" "}
            <a className="ulink" href="mailto:realmalimusic@gmail.com">
              realmalimusic@gmail.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <h2 className="font-mono text-mono-xs uppercase tracking-caps-md mb-3 text-ink-3">
        {title}
      </h2>
      {children}
    </div>
  );
}
