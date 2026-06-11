"use client";

/* =========================================================================
   LEAVE YOUR NUMBER — the booth's email capture. Mali says the line reopens on
   the 17th; this is how the visitor gets the call back. Posts to the existing
   /api/subscribe (Klaviyo) with source "payphone", honeypot-guarded — same
   contract as the site's other notify forms.
   ========================================================================= */

import { useState, type FormEvent } from "react";
import { useHoneypot } from "@/components/ui/useHoneypot";
import { trackLead } from "@/lib/analytics";

type Status = "idle" | "submitting" | "ok" | "error";

export function BoothSignup({ onClose }: { onClose: () => void }) {
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
        body: JSON.stringify({ email, source: "payphone", ...honeypotValues() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "Couldn't save your number. Try again.");
      trackLead("payphone");
      setStatus("ok");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Couldn't save your number. Try again.");
    }
  }

  return (
    <div className="pointer-events-auto fixed inset-0 z-40 flex items-center justify-center bg-[#080103]/80 px-6 backdrop-blur-sm">
      <div
        className="relative w-full max-w-md rounded-2xl border border-[#ff2b3e]/40 bg-[#0a0103]/95 p-7 text-center font-mono text-[#f4e6ea]"
        style={{ boxShadow: "0 0 60px -14px #ff2b3eaa" }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-white/40 transition-colors hover:text-white"
        >
          ✕
        </button>

        {status === "ok" ? (
          <div role="status" aria-live="polite" className="py-4">
            <p className="text-3xl" style={{ fontFamily: "var(--font-display), Georgia, serif" }}>
              you're on the line.
            </p>
            <p className="mt-3 text-[10px] uppercase tracking-[0.3em] text-[#ff7d92]/80">
              we'll ring you on the 17th — ({email})
            </p>
          </div>
        ) : (
          <>
            <p className="text-[10px] uppercase tracking-[0.4em] text-[#ff7d92]">leave your number</p>
            <h2 className="mt-3 text-3xl leading-tight" style={{ fontFamily: "var(--font-display), Georgia, serif", textShadow: "0 0 24px rgba(255,40,70,0.4)" }}>
              the line reopens 10·17
            </h2>
            <p className="mx-auto mt-3 max-w-xs text-[11px] uppercase leading-relaxed tracking-[0.24em] text-white/55">
              leave your email and we'll call you back when it does.
            </p>

            <form onSubmit={onSubmit} noValidate className="mt-6">
              {honeypot}
              <input
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
                className="w-full rounded-md border border-[#ff2b3e]/30 bg-[#1a0306]/70 px-4 py-3 text-center text-[15px] text-[#ffd9df] outline-none transition-colors placeholder:text-white/30 focus:border-[#ff2b3e] disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={status === "submitting" || !email.trim()}
                className="mt-3 w-full rounded-full bg-[#ff2b3e] py-3 text-[11px] uppercase tracking-[0.3em] text-[#0a0103] transition-colors hover:bg-[#ff4d5e] disabled:opacity-60"
              >
                {status === "submitting" ? "…" : "notify me"}
              </button>
              {status === "error" && (
                <p role="alert" className="mt-3 text-[10px] uppercase tracking-[0.2em] text-[#ff5566]">
                  {errorMsg}
                </p>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  );
}
