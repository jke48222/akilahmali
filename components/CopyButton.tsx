"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

type CopyButtonProps = {
  value: string;
  className?: string;
  /** Visible idle / copied labels. */
  idleLabel?: string;
  copiedLabel?: string;
};

/** Inline button — copies `value` to clipboard, swaps icon + label briefly. */
export function CopyButton({
  value,
  className = "",
  idleLabel = "copy address",
  copiedLabel = "copied",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function onClick() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API not available; silent no-op.
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-live="polite"
      className={`inline-flex items-center gap-2 font-mono text-mono-sm uppercase tracking-caps-md ulink transition-colors ${copied ? "text-accent" : "text-ink-2"} ${className}`.trim()}
    >
      {copied ? (
        <>
          <Check size={14} strokeWidth={1.2} aria-hidden="true" /> {copiedLabel}
        </>
      ) : (
        <>
          <Copy size={14} strokeWidth={1.2} aria-hidden="true" /> {idleLabel}
        </>
      )}
    </button>
  );
}
