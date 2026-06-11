"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import { useHoneypot } from "@/components/ui/useHoneypot";
import { trackLead } from "@/lib/analytics";

type Status = "idle" | "submitting" | "ok" | "error";

/**
 * Per-show RSVP capture for free dates. Posts to /api/subscribe with
 * source "show-rsvp" plus show context as `meta` (rsvp_show_id / _city / _date)
 * so Klaviyo's see-you-there flow can personalize + remind. See
 * docs/klaviyo-journeys.md.
 */
export function RsvpForm({
  showId,
  city,
  dateIso,
  onDone,
}: {
  showId: string;
  city: string;
  dateIso: string;
  onDone?: () => void;
}) {
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
        body: JSON.stringify({
          email,
          source: "show-rsvp",
          meta: {
            rsvp_show_id: showId,
            rsvp_show_city: city,
            rsvp_show_date: dateIso.slice(0, 10),
          },
          ...honeypotValues(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "We couldn’t save your RSVP. Try again shortly.",
        );
      }
      trackLead("show-rsvp");
      setStatus("ok");
      onDone?.();
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "We couldn’t save your RSVP. Try again shortly.",
      );
    }
  }

  if (status === "ok") {
    return (
      <p
        className="font-mono text-mono-xs uppercase tracking-caps text-ink-2"
        role="status"
        aria-live="polite"
      >
        you&rsquo;re on the list for {city.toLowerCase()}. see you there.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="w-full">
      {honeypot}
      <label htmlFor={`rsvp-${showId}`} className="sr-only">
        Email address to RSVP for {city}
      </label>
      <div className="flex items-end gap-3">
        <input
          id={`rsvp-${showId}`}
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
          className="w-full bg-transparent border-0 border-b border-ink text-ink placeholder:text-ink-3 py-2 px-0.5 text-[15px] outline-none transition-colors focus:border-accent disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={status === "submitting" || !email.trim()}
          className="shrink-0 font-mono text-mono-xs uppercase tracking-caps-md pb-2 inline-flex items-center gap-2 transition-colors text-accent hover:text-accent-2 disabled:opacity-60"
        >
          {status === "submitting" ? "…" : "rsvp"}{" "}
          <ArrowRight size={13} strokeWidth={1.2} aria-hidden="true" />
        </button>
      </div>
      {status === "error" ? (
        <p role="alert" className="mt-2 font-mono text-mono-xs uppercase tracking-caps text-accent">
          {errorMsg}
        </p>
      ) : null}
    </form>
  );
}
