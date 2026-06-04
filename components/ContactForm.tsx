"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";

type Status = "idle" | "submitting" | "ok" | "error";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim() || status === "submitting") return;

    setStatus("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Something went wrong. Try again.",
        );
      }
      setStatus("ok");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Try again.");
    }
  }

  if (status === "ok") {
    return (
      <div role="status" aria-live="polite">
        <p className="font-display italic text-[26px] leading-tight text-ink">
          message sent.
        </p>
        <p className="mt-2 text-[15px] text-ink-2">
          thanks for reaching out.
        </p>
      </div>
    );
  }

  const inputClass =
    "w-full bg-transparent border-0 border-b border-rule text-ink placeholder:text-ink-3 py-3 px-0.5 text-[16px] outline-none transition-colors focus:border-accent disabled:opacity-60";

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <div>
        <label htmlFor="contact-name" className="sr-only">Name</label>
        <input
          id="contact-name"
          type="text"
          name="name"
          required
          placeholder="name"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={status === "submitting"}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="contact-email" className="sr-only">Email</label>
        <input
          id="contact-email"
          type="email"
          name="email"
          required
          placeholder="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "submitting"}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="contact-message" className="sr-only">Message</label>
        <textarea
          id="contact-message"
          name="message"
          required
          placeholder="message"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={status === "submitting"}
          className={`${inputClass} resize-none`}
        />
      </div>
      <div className="flex items-center justify-between gap-4">
        <button
          type="submit"
          disabled={status === "submitting" || !name.trim() || !email.trim() || !message.trim()}
          className="font-mono text-mono-sm uppercase tracking-caps-md inline-flex items-center gap-2 transition-colors text-accent hover:text-accent-2 disabled:opacity-60"
        >
          {status === "submitting" ? "sending…" : "send"}{" "}
          <ArrowRight size={14} strokeWidth={1.2} aria-hidden="true" />
        </button>
        {status === "error" ? (
          <p className="font-mono text-mono-xs uppercase tracking-caps text-accent" role="alert">
            {errorMsg}
          </p>
        ) : null}
      </div>
    </form>
  );
}
