import { z } from "zod";

/**
 * Lightweight bot mitigation for public forms — no CAPTCHA, zero UX cost.
 *
 *  • `hp`  — a hidden "website" field a human never sees or fills. Any value
 *            means an automated form-filler walked the DOM.
 *  • `t`   — the millisecond timestamp when the form mounted. A submission that
 *            arrives faster than a human could plausibly type is a script.
 *
 * Both signals are advisory: when tripped we return a *fake success* to the
 * caller (see routes) so bots get no feedback to tune against.
 */
export const honeypotFields = {
  hp: z.string().max(2000).optional(),
  t: z.number().int().optional(),
};

const MIN_FILL_MS = 1200;

export function isBotSubmission(v: { hp?: string; t?: number }): boolean {
  if (typeof v.hp === "string" && v.hp.trim() !== "") return true;
  if (typeof v.t === "number" && Number.isFinite(v.t)) {
    const elapsed = Date.now() - v.t;
    if (elapsed >= 0 && elapsed < MIN_FILL_MS) return true;
  }
  return false;
}
