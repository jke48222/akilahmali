type SectionLabelProps = {
  /** Short eyebrow text, e.g. "latest release". */
  label: string;
};

/**
 * Quiet section eyebrow: a short crimson tick followed by a small-caps label.
 * No numbering — keeps the page reading like an artist site, not a lookbook.
 */
export function SectionLabel({ label }: SectionLabelProps) {
  return (
    <div className="flex items-center gap-3 font-mono text-mono-xs uppercase tracking-caps-lg text-ink-3">
      <span className="block h-px w-7 bg-accent" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
