"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import { useHoneypot } from "@/components/ui/useHoneypot";
import { trackLead } from "@/lib/analytics";

type Status = "idle" | "submitting" | "ok" | "error";

/**
 * Inline email notify form used on /shows empty state.
 * Posts to /api/subscribe just like the home capture (stub for Phase 2.7).
 */
export function NotifyForm({ source = "shows" }: { source?: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const { field: honeypot, values: honeypotValues } = useHoneypot();

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source, ...honeypotValues() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "We couldn’t save your email. Try again shortly.",
        );
      }
      trackLead(source);
      setStatus("ok");
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "We couldn’t save your email. Try again shortly.",
      );
    }
  }

  if (status === "ok") {
    return (
      <div className="pt-2" role="status" aria-live="polite">
        <p className="font-display italic text-[28px] leading-tight text-ink">
          you&rsquo;re in.
        </p>
        <p className="mt-3 font-mono text-mono-xs uppercase tracking-caps text-ink-3">
          ({email})
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      {honeypot}
      <input type="hidden" name="source" value={source} />
      <label htmlFor="shows-notify-email" className="sr-only">
        Email address
      </label>
      <div className="flex items-end gap-4">
        <input
          id="shows-notify-email"
          type="email"
          name="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="you@somewhere"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "submitting"}
          aria-invalid={status === "error"}
          aria-describedby={status === "error" ? "shows-notify-error" : undefined}
          className="w-full bg-transparent border-0 border-b border-ink text-ink placeholder:text-ink-3 py-3 px-0.5 text-[16px] outline-none transition-colors focus:border-accent disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={status === "submitting" || !email.trim()}
          className="shrink-0 font-mono text-mono-sm uppercase tracking-caps-md pb-3 inline-flex items-center gap-2 transition-colors text-accent hover:text-accent-2 disabled:opacity-60"
        >
          {status === "submitting" ? "…" : "notify me"}{" "}
          <ArrowRight size={14} strokeWidth={1.2} aria-hidden="true" />
        </button>
      </div>
      {status === "error" ? (
        <p
          id="shows-notify-error"
          role="alert"
          className="mt-3 font-mono text-mono-xs uppercase tracking-caps text-accent"
        >
          {errorMsg}
        </p>
      ) : null}
    </form>
  );
}
