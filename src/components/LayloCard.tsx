"use client";

import Script from "next/script";
import { site } from "@/lib/site";

/** Live Laylo "text chain" signup drop (theme matches the red palette). */
export default function LayloCard({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <Script src="https://embed.laylo.com/laylo-sdk.js" strategy="afterInteractive" />
      <iframe
        id={`laylo-drop-${site.laylo.dropId}`}
        src={site.laylo.embedSrc}
        title="Sign up for the text chain"
        frameBorder={0}
        scrolling="no"
        allow="web-share"
        style={{ width: "1px", minWidth: "100%", maxWidth: "1000px", border: 0 }}
      />
    </div>
  );
}

