import type { ButtonHTMLAttributes, ReactNode } from "react";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Required for screen readers · there's no visible text. */
  "aria-label": string;
  children: ReactNode;
};

/**
 * Square, label-less button that wraps an icon. Always requires `aria-label`.
 */
export function IconButton({
  className = "",
  type = "button",
  children,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center w-10 h-10 -m-2 p-2 text-ink-2 hover:text-ink transition-colors ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
}
