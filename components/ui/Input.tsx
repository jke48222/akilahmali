import { forwardRef, type InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  /** Accessible label; rendered visually-hidden if `hideLabel`. */
  label: string;
  hideLabel?: boolean;
  /** Optional caption below the input (e.g. helper or terms). */
  caption?: string;
};

/**
 * Borderless underline input matching the design artifacts' `.line-input`.
 * Always has an associated label — visually hidden when `hideLabel` is set.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hideLabel = false, caption, id, className = "", ...rest },
  ref,
) {
  const inputId = id ?? `input-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div className="w-full">
      <label
        htmlFor={inputId}
        className={
          hideLabel
            ? "sr-only"
            : "block font-mono text-mono-xs uppercase tracking-caps-md text-ink-3 mb-2"
        }
      >
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        className={`w-full bg-transparent border-0 border-b border-ink text-ink placeholder:text-ink-3 py-3 px-0.5 text-[16px] outline-none transition-colors focus:border-accent ${className}`.trim()}
        {...rest}
      />
      {caption ? (
        <p className="mt-3 font-mono text-mono-xs uppercase tracking-caps text-ink-3">
          {caption}
        </p>
      ) : null}
    </div>
  );
});
