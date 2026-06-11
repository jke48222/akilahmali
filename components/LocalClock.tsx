"use client";

import { useEffect, useState } from "react";

/**
 * Live hometown clock — the blonded.co timestamp detail. Renders nothing on
 * the server (avoids a hydration mismatch) and fills in on mount, so the
 * footer line quietly upgrades from "atlanta, ga" to "atlanta, ga · 10:42 pm".
 */
export function LocalClock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: "America/New_York",
    });
    const tick = () => setTime(fmt.format(new Date()).toLowerCase());
    tick();
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, []);

  if (!time) return null;
  return <span className="tabular-nums"> · {time}</span>;
}
