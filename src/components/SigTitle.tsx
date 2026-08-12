import type { ReactNode } from "react";

/** Script section title (Golden Hopes) with subtle grain (white or plum).
 *  Add `sig-title-brittany` via className to keep the original Brittany
 *  Signature (the Who Really Won? page does this in SubscribeFooter). */
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
