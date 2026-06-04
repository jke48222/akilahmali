/**
 * Narrow result shapes mirroring the GraphQL queries in ./queries.ts.
 * Imported types are aliased from @shopify/hydrogen-react/storefront-api-types
 * so we stay in sync with the actual Storefront API schema.
 */

import type {
  Cart as ShopifyCart,
  CartLine as ShopifyCartLine,
  MoneyV2,
  Product as ShopifyProduct,
  ProductOption,
  ProductVariant as ShopifyVariant,
  SelectedOption,
  Image as ShopifyImage,
} from "@shopify/hydrogen-react/storefront-api-types";

export type Money = MoneyV2;

export type ProductImage = Pick<
  ShopifyImage,
  "url" | "altText" | "width" | "height"
>;

export type Variant = Pick<
  ShopifyVariant,
  "id" | "title" | "availableForSale" | "quantityAvailable"
> & {
  selectedOptions: SelectedOption[];
  price: Money;
  compareAtPrice?: Money | null;
  image?: ProductImage | null;
  product?: { handle: string; title: string };
};

export type ProductCard = Pick<
  ShopifyProduct,
  "id" | "handle" | "title" | "description" | "availableForSale"
> & {
  tags: string[];
  options: ProductOption[];
  priceRange: {
    minVariantPrice: Money;
    maxVariantPrice: Money;
  };
  featuredImage?: ProductImage | null;
  images: { nodes: ProductImage[] };
};

export type ProductDetail = ProductCard & {
  variants: { nodes: Variant[] };
};

export type CartLine = Pick<ShopifyCartLine, "id" | "quantity"> & {
  cost: { totalAmount: Money };
  merchandise: Variant;
};

export type Cart = Pick<
  ShopifyCart,
  "id" | "checkoutUrl" | "totalQuantity"
> & {
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
    totalTaxAmount?: Money | null;
  };
  lines: { nodes: CartLine[] };
};

export type StorefrontUserError = {
  field?: string[] | null;
  message: string;
};
