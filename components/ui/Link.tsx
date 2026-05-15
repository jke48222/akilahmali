import NextLink from "next/link";
import type { ComponentPropsWithoutRef } from "react";

type LinkProps = ComponentPropsWithoutRef<typeof NextLink> & {
  /** Show a persistent underline (e.g. when the link represents the current page). */
  underline?: "hover" | "always";
};

/**
 * Internal site link with the design system's underline-reveal behavior.
 * For external links use a plain <a>; for buttons use <Button>.
 */
export function Link({
  underline = "hover",
  className = "",
  ...props
}: LinkProps) {
  const base =
    underline === "always" ? "ulink ulink-on" : "ulink";
  return (
    <NextLink
      {...props}
      className={`${base} ${className}`.trim()}
    />
  );
}
