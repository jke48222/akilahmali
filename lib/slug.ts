/** Title → URL-safe slug. Used for per-song deep links (`?song=`) + anchor ids
 *  on release tracklists. Mirrors the simple kebab-case form used elsewhere. */
export function slugify(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
