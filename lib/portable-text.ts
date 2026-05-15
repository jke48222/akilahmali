import type { PortableTextBlock } from "./queries";

/**
 * Flatten Sanity portable-text into a plain string. Each block becomes a line.
 * Good for lyrics (one line per block), short blurbs, and tuple-shaped credits.
 */
export function portableTextToPlain(blocks?: PortableTextBlock[] | null): string {
  if (!blocks || blocks.length === 0) return "";
  return blocks
    .map((b) => {
      if (b._type !== "block") return "";
      return (b.children ?? [])
        .map((c) => c.text ?? "")
        .join("");
    })
    .join("\n")
    .trim();
}

/**
 * Extract a key-value credits list from portable text where each block is of
 * the form `"role — names"` or `"role: names"`. Falls back to a single
 * "credits" tuple if no separator is found.
 */
export function portableTextToCredits(
  blocks?: PortableTextBlock[] | null,
): Array<[string, string]> {
  if (!blocks || blocks.length === 0) return [];
  const out: Array<[string, string]> = [];
  for (const block of blocks) {
    if (block._type !== "block") continue;
    const text = (block.children ?? []).map((c) => c.text ?? "").join("").trim();
    if (!text) continue;
    const match = text.match(/^(.+?)\s*[—:–-]\s*(.+)$/);
    if (match) {
      out.push([match[1].toLowerCase(), match[2]]);
    } else {
      out.push(["credits", text]);
    }
  }
  return out;
}
