"use client";

import { useEffect, useRef } from "react";

/** Curator.io published feed script (Instagram for @akilah.mali). */
const FEED_SRC =
  "https://cdn.curator.io/published/f6e78e2a-f336-4f60-ac30-4244d95f7e2e.js";

/**
 * Embeds the Curator.io feed. The script scans the page for the
 * `#curator-feed-default-feed-layout` element and renders the feed into it.
 *
 * Curator gives the feed window a fixed, tall height (with the overflow
 * hidden), which leaves a lot of empty space when there are only a few posts.
 * We watch the feed and collapse that window to the height of its content.
 * Appearance (colors, columns) is still controlled from the Curator dashboard.
 */
export function CuratorFeed() {
  const rootRef = useRef<HTMLDivElement>(null);
  const injected = useRef(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // Collapse the fixed-height feed window to fit its posts.
    const fit = () => {
      const win = root.querySelector<HTMLElement>(".crt-feed-window");
      const feed = win?.querySelector<HTMLElement>(".crt-feed");
      if (!win || !feed) return;
      const target = feed.scrollHeight;
      // Only act when the window is meaningfully taller than its content,
      // which also prevents a feedback loop with our own style change.
      if (target > 0 && Math.abs(win.clientHeight - target) > 2) {
        win.style.setProperty("height", "auto", "important");
        win.style.setProperty("max-height", "none", "important");
        win.style.setProperty("overflow", "visible", "important");
      }
    };

    const observer = new MutationObserver(() => fit());
    observer.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class"],
    });
    // Also poll briefly while the widget loads its first posts.
    const poll = window.setInterval(fit, 400);
    const stopPoll = window.setTimeout(() => window.clearInterval(poll), 8000);

    if (!injected.current) {
      injected.current = true;
      const first = document.getElementsByTagName("script")[0];
      const script = document.createElement("script");
      script.async = true;
      script.setAttribute("charset", "UTF-8");
      script.src = FEED_SRC;
      first?.parentNode?.insertBefore(script, first);
    }

    return () => {
      observer.disconnect();
      window.clearInterval(poll);
      window.clearTimeout(stopPoll);
    };
  }, []);

  return (
    <div id="curator-feed-default-feed-layout" ref={rootRef}>
      {/* Curator's attribution placeholder, label intentionally blanked. */}
      <a
        href="https://curator.io"
        target="_blank"
        rel="noopener noreferrer"
        className="crt-logo crt-tag"
      >
        {" "}
      </a>
    </div>
  );
}
