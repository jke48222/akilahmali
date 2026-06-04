import type { MetadataRoute } from "next";
import { getAllReleases, getAllVideos } from "@/lib/queries";
import { getAllProducts, isShopifyConfigured } from "@/lib/shopify";

const SITE_URL = "https://malicantsing.com";

/**
 * Sitemap · emits every public URL. Static routes always; release/video/
 * product entries are gated on Sanity/Shopify being configured so an
 * unconfigured preview deploy still produces a valid sitemap.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`,        lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${SITE_URL}/music`,   lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
    { url: `${SITE_URL}/videos`,  lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/about`,   lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/shows`,   lastModified: now, changeFrequency: "weekly",  priority: 0.6 },
    { url: `${SITE_URL}/press`,   lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "yearly",  priority: 0.5 },
    { url: `${SITE_URL}/shop`,    lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
  ];

  const [releases, products] = await Promise.all([
    getAllReleases().catch(() => null),
    isShopifyConfigured
      ? getAllProducts(100).catch(() => [])
      : Promise.resolve([]),
  ]);
  // Videos all live on /videos in v1 · no per-video routes yet.
  // Kept the await so future per-video routes can be added without a refactor.
  await getAllVideos().catch(() => null);

  const releaseRoutes: MetadataRoute.Sitemap =
    releases?.map((r) => ({
      url: `${SITE_URL}/music/${r.slug}`,
      lastModified: r.releaseDate ? new Date(r.releaseDate) : now,
      changeFrequency: "monthly",
      priority: 0.8,
    })) ?? [];

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/shop/products/${p.handle}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...releaseRoutes, ...productRoutes];
}
