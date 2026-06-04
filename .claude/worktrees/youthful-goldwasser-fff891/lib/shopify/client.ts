import "server-only";

import { createStorefrontApiClient } from "@shopify/storefront-api-client";
import {
  apiVersion,
  isShopifyConfigured,
  storeDomain,
  storefrontToken,
} from "./env";

let _client: ReturnType<typeof createStorefrontApiClient> | null = null;

export function getStorefrontClient() {
  if (!isShopifyConfigured) {
    throw new Error(
      "Shopify is unconfigured — set SHOPIFY_STORE_DOMAIN + SHOPIFY_STOREFRONT_API_TOKEN.",
    );
  }
  if (!_client) {
    _client = createStorefrontApiClient({
      storeDomain,
      apiVersion,
      publicAccessToken: storefrontToken,
    });
  }
  return _client;
}

export { isShopifyConfigured };
