/**
 * Safe serialization for JSON-LD embedded in a <script type="application/ld+json">
 * via dangerouslySetInnerHTML.
 *
 * Plain JSON.stringify does NOT escape `<`, so any CMS- or merchant-authored
 * string containing `</script>` (e.g. a Shopify product description or a Sanity
 * track title) would break out of the tag — a stored-XSS / markup-injection
 * vector. It also leaves the raw U+2028 / U+2029 line separators that are valid
 * in JSON but break the surrounding HTML/JS parse. Escaping all of these to
 * their \uXXXX forms keeps the payload byte-for-byte valid JSON while making it
 * inert inside HTML.
 */
const LS = new RegExp(String.fromCharCode(0x2028), "g"); // U+2028 line separator
const PS = new RegExp(String.fromCharCode(0x2029), "g"); // U+2029 paragraph separator

export function jsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(LS, "\\u2028")
    .replace(PS, "\\u2029");
}
