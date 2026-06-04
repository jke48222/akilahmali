import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Akilah Mali",
    short_name: "Akilah Mali",
    description:
      "akilah mali writes songs about people she used to know, and the rooms she left them in. atlanta, ga · est. 2025.",
    start_url: "/",
    display: "standalone",
    background_color: "#EDE8F2",
    theme_color: "#1B1520",
    categories: ["music", "entertainment"],
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
