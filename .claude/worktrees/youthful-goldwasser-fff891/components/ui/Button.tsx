import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "solid" | "ghost" | "mono";
type Size = "sm" | "md";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
};

/**
 * Site button. Three registers:
 *  - solid:  inked rectangle, on-cream label (primary CTA — sparingly used)
 *  - ghost:  inked outline that swaps on hover (secondary)
 *  - mono:   uppercase tracked caption-button (used for "submit", "menu" etc.)
 */
export function Button({
  variant = "mono",
  size = "md",
  className = "",
  type = "button",
  children,
  ...rest
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:pointer-events-none";

  const variants: Record<Variant, string> = {
    solid:
      "bg-ink text-cream hover:bg-ink-2",
    ghost:
      "border border-ink text-ink hover:bg-ink hover:text-cream",
    mono:
      "text-accent hover:text-accent-2 font-mono uppercase tracking-caps-md text-mono-sm",
  };

  const sizes: Record<Size, string> = {
    sm: variant === "mono" ? "py-1" : "h-9 px-4 text-[13px]",
    md: variant === "mono" ? "py-2" : "h-11 px-6 text-[14px]",
  };

  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
}
