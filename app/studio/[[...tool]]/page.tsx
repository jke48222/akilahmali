"use client";

/**
 * Sanity Studio embedded at /studio. Route-segment directives like
 * `force-dynamic` live on the (server) layout above; this is a client
 * component so it can only export the default React component.
 */
import { NextStudio } from "next-sanity/studio";
import config from "@/sanity/config";

export default function StudioPage() {
  return <NextStudio config={config} />;
}
