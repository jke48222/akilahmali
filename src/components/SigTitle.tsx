import type { ReactNode } from "react";

/** Brittany Signature section title with subtle grain (white or plum). */
export default function SigTitle({
  children,
  tone = "white",
  as: Tag = "h2",
  className = "",
}: {
  children: ReactNode;
  tone?: "white" | "plum" | "black";
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  return (
    <Tag className={`sig-title grain-text grain-text-${tone} ${className}`}>
      {children}
    </Tag>
  );
}
