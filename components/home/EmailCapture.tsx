"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { useHoneypot } from "@/components/ui/useHoneypot";
import { resolveSignupSource, trackLead } from "@/lib/analytics";
import { SectionLabel } from "./SectionLabel";

type Status = "idle" | "submitting" | "ok" | "error";

const SOURCE = "home";

/**
 * Lead magnet delivered on signup (free demo / voice memo / lyric PDF).
 * TODO(akilah): set NEXT_PUBLIC_LEAD_MAGNET_URL to the asset link once it
 * exists — until then the success state simply omits the download line.
 */
const LEAD_MAGNET_URL = process.env.NEXT_PUBLIC_LEAD_MAGNET_URL || null;

export function EmailCapture() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const { field: honeypot, values: honeypotValues } = useHoneypot();

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim() || status === "submitting") return;

    setStatus("submitting");
    setErrorMsg("");

    // ?source= UTM (tiktok / ig / yt bio links) outranks the form's own id.
    const source = resolveSignupSource(SOURCE);

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

  return (
    <section id="next" className="relative">
      <div className="mx-auto max-w-page px-gutter md:px-gutter-md lg:px-gutter-lg pt-section md:pt-section-xl">
        <div className="grid grid-cols-12 gap-6 md:gap-10 items-end">
          <Reveal as="div" className="col-span-12 md:col-span-7">
            <SectionLabel label="mailing list" />
            <h2
              className="font-display italic mt-5 leading-[0.95] tracking-mark"
              style={{ fontSize: "var(--text-display-s)" }}
            >
              hear it first.
            </h2>
          </Reveal>

          <Reveal as="div" delay={140} className="col-span-12 md:col-span-5">
            {status !== "ok" ? (
              <form onSubmit={onSubmit} className="md:pb-3" noValidate>
                {honeypot}
                <input type="hidden" name="source" value={SOURCE} />
                <label htmlFor="email-capture" className="sr-only">
                  Email address
                </label>
                <div className="flex items-end gap-4">
                  <input
                    id="email-capture"
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                    inputMode="email"
                    placeholder="you@somewhere"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={status === "submitting"}
                    aria-describedby="email-capture-caption"
                    aria-invalid={status === "error"}
                    className="w-full bg-transparent border-0 border-b border-ink text-ink placeholder:text-ink-3 py-3 px-0.5 text-[16px] outline-none transition-colors focus:border-accent disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    disabled={status === "submitting" || !email.trim()}
                    className="shrink-0 font-mono text-mono-sm uppercase tracking-caps-md pb-3 inline-flex items-center gap-2 transition-colors text-accent hover:text-accent-2 disabled:opacity-60"
                  >
                    {status === "submitting" ? "…" : "submit"}{" "}
                    <ArrowRight size={14} strokeWidth={1.2} aria-hidden="true" />
                  </button>
                </div>
                {status === "error" ? (
                  <p
                    className="mt-3 font-mono text-mono-xs uppercase tracking-caps text-accent-2"
                    role="alert"
                  >
                    {errorMsg}
                  </p>
                ) : null}
                {/* Consent microcopy — the label-site tell (Lucky Daye, every
                    UMG footer). Always visible, quiet, honest. */}
                <p
                  id="email-capture-caption"
                  className="mt-3 font-mono text-mono-xs uppercase tracking-caps text-ink-3 max-w-[44ch]"
                >
                  by signing up, you agree to receive email updates from akilah
                  mali. unsubscribe anytime.
                </p>
              </form>
            ) : (
              <div className="md:pb-3" role="status" aria-live="polite">
                <p className="font-display italic text-[26px] leading-tight text-ink">
                  you&rsquo;re in.
                </p>
                <p className="mt-3 font-mono text-mono-xs uppercase tracking-caps text-ink-3">
                  ({email})
                </p>
                {LEAD_MAGNET_URL ? (
                  <p className="mt-4 font-mono text-mono-xs uppercase tracking-caps">
                    <a
                      href={LEAD_MAGNET_URL}
                      className="ulink text-accent hover:text-accent-2"
                    >
                      your welcome gift — download
                    </a>
                  </p>
                ) : null}
              </div>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
