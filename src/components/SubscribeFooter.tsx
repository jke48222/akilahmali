"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";
import SigTitle from "./SigTitle";
import Reveal from "./Reveal";

type Status = "idle" | "loading" | "done" | "error";

/**
 * Shared newsletter footer. Submits to /api/subscribe, which adds the email to
 * Akilah's Laylo list (see that route for the LAYLO_API_KEY setup).
 */
export default function SubscribeFooter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [msg, setMsg] = useState("");
  const pathname = usePathname();

  // On the immersive "Who Really Won?" page the footer sits under the dark
  // control room — drop the maroon grain and match its near-black backdrop.
  const onWrw = pathname?.startsWith("/music/who-really-won");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || status === "loading") return;
    setStatus("loading");
    setMsg("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (res.ok) {
        setStatus("done");
      } else {
        setStatus("error");
        setMsg(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMsg("Network error. Please try again.");
    }
  }

  return (
    <footer
      className={`py-20 text-center md:py-28 ${
        onWrw ? "text-black" : "text-white bg-plum-deep bg-repeat"
      }`}
      style={
        onWrw
          ? { backgroundColor: "#e9e3d6" }
          : { backgroundImage: `url(${site.assets.bgPlum})` }
      }
    >
      <div className="mx-auto max-w-xl px-6">
        <Reveal>
          <SigTitle tone={onWrw ? "black" : "white"} className="text-7xl md:text-8xl">
            Subscribe
          </SigTitle>
        </Reveal>
        <Reveal>
          <p className={`mx-auto mt-6 max-w-md text-sm ${onWrw ? "text-black/85" : "text-white/80"}`}>
            {site.subscribeBlurb}
          </p>
        </Reveal>
        <Reveal>
          {status === "done" ? (
            <p className={`mt-8 text-sm ${onWrw ? "text-black font-semibold" : "text-lavender"}`}>Thanks for subscribing!</p>
          ) : (
            <form
              className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
              onSubmit={onSubmit}
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className={`flex-1 border px-4 py-3 text-sm focus:outline-none ${
                  onWrw
                    ? "border-black/30 bg-transparent text-black placeholder:text-black/50 focus:border-black"
                    : "border-white/40 bg-transparent text-white placeholder:text-white/50 focus:border-white"
                }`}
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className={`nav-label border px-7 py-3 text-xs transition disabled:opacity-60 ${
                  onWrw
                    ? "border-black/70 text-black hover:bg-black hover:text-[#e9e3d6]"
                    : "border-white/70 text-white hover:bg-white hover:text-plum-deep"
                }`}
              >
                {status === "loading" ? "Signing up…" : "Sign Up"}
              </button>
            </form>
          )}
          {status === "error" && (
            <p className={`mt-4 text-xs ${onWrw ? "text-black/75" : "text-white/70"}`}>{msg}</p>
          )}
        </Reveal>
        <a
          href={`mailto:${site.contactEmail}`}
          className={`mt-12 inline-block text-xs transition ${
            onWrw ? "text-black/60 hover:text-black" : "text-white/55 hover:text-white"
          }`}
        >
          {site.contactEmail}
        </a>
        <p className={`mt-4 text-[0.65rem] uppercase tracking-[0.2em] ${
          onWrw ? "text-black/40" : "text-white/35"
        }`}>
          © 2026 AKILAH MALI
        </p>
      </div>
    </footer>
  );
}
