/**
 * GraphQL queries + mutations for the Shopify Storefront API.
 * Plain strings (not codegen'd) so we keep this dependency-light. Result
 * shapes are typed manually in ./types.ts.
 */

const PRODUCT_CARD_FRAGMENT = /* GraphQL */ `
  fragment ProductCard on Product {
    id
    handle
    title
    description
    availableForSale
    tags
    options { name values }
    priceRange {
      minVariantPrice { amount currencyCode }
      maxVariantPrice { amount currencyCode }
    }
    featuredImage {
      url(transform: { maxWidth: 1200 })
      altText
      width
      height
    }
    images(first: 6) {
      nodes {
        url(transform: { maxWidth: 1600 })
        altText
        width
        height
      }
    }
  }
`;

const VARIANT_FRAGMENT = /* GraphQL */ `
  fragment VariantBase on ProductVariant {
    id
    title
    availableForSale
    quantityAvailable
    selectedOptions { name value }
    price { amount currencyCode }
    compareAtPrice { amount currencyCode }
    image {
      url(transform: { maxWidth: 1200 })
      altText
      width
      height
    }
    product { handle title }
  }
`;

const CART_FRAGMENT = /* GraphQL */ `
  fragment CartBase on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount { amount currencyCode }
      totalAmount { amount currencyCode }
      totalTaxAmount { amount currencyCode }
    }
    lines(first: 50) {
      nodes {
        id
        quantity
        cost {
          totalAmount { amount currencyCode }
        }
        merchandise {
          ... on ProductVariant { ...VariantBase }
        }
      }
    }
  }
  ${VARIANT_FRAGMENT}
`;

export const ALL_PRODUCTS_QUERY = /* GraphQL */ `
  query AllProducts($first: Int = 24) {
    products(first: $first, sortKey: CREATED_AT, reverse: true) {
      nodes { ...ProductCard }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;

export const PRODUCTS_BY_QUERY = /* GraphQL */ `
  query ProductsByQuery($first: Int = 12, $query: String) {
    products(first: $first, query: $query, sortKey: CREATED_AT, reverse: true) {
      nodes { ...ProductCard }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;

export const PRODUCT_BY_HANDLE_QUERY = /* GraphQL */ `
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      ...ProductCard
      variants(first: 32) { nodes { ...VariantBase } }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
  ${VARIANT_FRAGMENT}
`;

export const CART_QUERY = /* GraphQL */ `
  query GetCart($id: ID!) {
    cart(id: $id) { ...CartBase }
  }
  ${CART_FRAGMENT}
`;

export const CART_CREATE_MUTATION = /* GraphQL */ `
  mutation CreateCart($lines: [CartLineInput!]) {
    cartCreate(input: { lines: $lines }) {
      cart { ...CartBase }
      userErrors { field message }
    }
  }
  ${CART_FRAGMENT}
`;

export const CART_LINES_ADD_MUTATION = /* GraphQL */ `
  mutation AddLines($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { ...CartBase }
      userErrors { field message }
    }
  }
  ${CART_FRAGMENT}
`;

export const CART_LINES_UPDATE_MUTATION = /* GraphQL */ `
  mutation UpdateLines($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { ...CartBase }
      userErrors { field message }
    }
  }
  ${CART_FRAGMENT}
`;

export const CART_LINES_REMOVE_MUTATION = /* GraphQL */ `
  mutation RemoveLines($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { ...CartBase }
      userErrors { field message }
    }
  }
  ${CART_FRAGMENT}
`;
