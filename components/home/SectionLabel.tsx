type SectionLabelProps = {
  index: string;
  label: string;
};

export function SectionLabel({ index, label }: SectionLabelProps) {
  return (
    <div className="flex items-baseline gap-4 font-mono text-mono-xs uppercase tracking-caps-lg text-ink-3">
      <span>{index}</span>
      <span className="block h-px flex-1 bg-rule" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
