import { PortableText, type PortableTextComponents } from "next-sanity";
import type { PortableTextBlock } from "@/lib/queries";

type PortableTextBodyProps = {
  value: PortableTextBlock[];
  /** Optional class applied to the first paragraph (used for dropcap). */
  className?: string;
  /** Body type size variant. */
  variant?: "prose" | "lyrics";
};

const PROSE_COMPONENTS: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="text-[17px] md:text-[18px] leading-[1.7] text-ink-2 first-of-type:text-ink mt-7 first-of-type:mt-0">
        {children}
      </p>
    ),
    h2: ({ children }) => (
      <h2 className="font-display italic mt-14 leading-[1.05] text-[36px] md:text-[44px]">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="font-display italic mt-10 leading-[1.1] text-[28px] md:text-[32px]">
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="font-display italic text-[24px] md:text-[28px] leading-[1.45] text-ink-2 my-10 max-w-[34ch]">
        {children}
      </blockquote>
    ),
  },
  marks: {
    em: ({ children }) => (
      <em className="font-display italic text-ink">{children}</em>
    ),
    strong: ({ children }) => <strong className="text-ink">{children}</strong>,
    link: ({ children, value }) => (
      <a
        href={value?.href ?? "#"}
        rel={value?.href?.startsWith("http") ? "noopener" : undefined}
        className="ulink text-accent"
      >
        {children}
      </a>
    ),
  },
};

const LYRICS_COMPONENTS: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="font-display leading-[1.7] text-ink-2" style={{ fontSize: "clamp(18px, 1.4vw, 22px)" }}>
        {children}
      </p>
    ),
  },
};

export function PortableTextBody({
  value,
  className = "",
  variant = "prose",
}: PortableTextBodyProps) {
  if (!value || value.length === 0) return null;
  return (
    <div className={className}>
      <PortableText
        value={value}
        components={variant === "lyrics" ? LYRICS_COMPONENTS : PROSE_COMPONENTS}
      />
    </div>
  );
}
