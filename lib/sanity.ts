import { createClient, type ClientConfig, type SanityClient } from "next-sanity";
import {
  createImageUrlBuilder,
  type ImageUrlBuilder,
  type SanityImageSource,
} from "@sanity/image-url";
import {
  apiVersion,
  dataset,
  isSanityConfigured,
  projectId,
} from "@/sanity/env";

let _client: SanityClient | null = null;
let _builder: ImageUrlBuilder | null = null;

function getClient(): SanityClient | null {
  if (!isSanityConfigured) return null;
  if (_client) return _client;
  const config: ClientConfig = {
    projectId,
    dataset,
    apiVersion,
    useCdn: true,
    perspective: "published",
    stega: false,
  };
  _client = createClient(config);
  return _client;
}

function getBuilder(): ImageUrlBuilder | null {
  if (!isSanityConfigured) return null;
  if (_builder) return _builder;
  _builder = createImageUrlBuilder({ projectId, dataset });
  return _builder;
}

/** Build a CDN URL for a Sanity image. Throws if Sanity is unconfigured. */
export function urlForImage(source: SanityImageSource) {
  const b = getBuilder();
  if (!b) {
    throw new Error(
      "urlForImage called but Sanity is unconfigured — guard the call with isSanityConfigured.",
    );
  }
  return b.image(source);
}

/**
 * Typed fetch. Returns `null` when Sanity isn't configured — callers should
 * fall back to static content in that case.
 */
export async function sanityFetch<T>(
  query: string,
  params: Record<string, unknown> = {},
  options: { revalidate?: number | false } = {},
): Promise<T | null> {
  const client = getClient();
  if (!client) return null;
  try {
    return await client.fetch<T>(query, params, {
      next: { revalidate: options.revalidate ?? 60 },
    });
  } catch (err) {
    console.error("[sanityFetch]", err);
    return null;
  }
}

export { isSanityConfigured };
