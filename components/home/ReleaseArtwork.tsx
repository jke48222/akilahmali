import Image from "next/image";
import { urlForImage } from "@/lib/sanity";
import type { SanityImage } from "@/lib/queries";

type Vibe = "strange" | "who" | "lastyear";

type ReleaseArtworkProps = {
  /** Sanity image, when one exists. Slot-in: a single prop swaps the visual. */
  image?: SanityImage | null;
  /** Local cover under /public, used when no Sanity image is present. */
  coverSrc?: string;
  /** Alt text fallback if the Sanity image doesn't carry its own. */
  alt: string;
  /** Vibe placeholder gradient used when no image is present. */
  vibe?: Vibe;
  /** "latest" gets a higher fetch priority + higher resolution. */
  variant?: "tile" | "latest";
  className?: string;
};

const VIBE_CLASS: Record<Vibe, string> = {
  strange: "art-strange",
  who: "art-who",
  lastyear: "art-lastyear",
};

/**
 * Square release artwork. In order of preference:
 *   - Renders a next/image of the Sanity asset (with LQIP blur), OR
 *   - Renders a local cover image (`coverSrc` under /public), OR
 *   - Renders a designed CSS gradient stand-in matching the artifact.
 *
 * Every path keeps the same .field grain overlay so the visual register is
 * consistent.
 */
export function ReleaseArtwork({
  image,
  coverSrc,
  alt,
  vibe = "strange",
  variant = "tile",
  className = "",
}: ReleaseArtworkProps) {
  const hasImage = Boolean(image?.asset?._ref);
  const hasCover = !hasImage && Boolean(coverSrc);
  const size = variant === "latest" ? 1200 : 800;
  const sizes =
    variant === "latest"
      ? "(min-width: 1024px) 56vw, (min-width: 768px) 58vw, 100vw"
      : "(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw";

  return (
    <div
      className={`relative aspect-square overflow-hidden field ${hasImage || hasCover ? "" : VIBE_CLASS[vibe]} ${className}`.trim()}
    >
      {hasImage && image ? (
        <Image
          src={urlForImage(image).width(size).height(size).fit("crop").url()}
          alt={image.alt || alt}
          fill
          sizes={sizes}
          priority={variant === "latest"}
          placeholder={image.lqip ? "blur" : "empty"}
          blurDataURL={image.lqip}
          className="object-cover"
          style={{ filter: "saturate(0.92) contrast(1.02)" }}
        />
      ) : hasCover && coverSrc ? (
        <Image
          src={coverSrc}
          alt={alt}
          fill
          sizes={sizes}
          priority={variant === "latest"}
          className="object-cover"
          style={{ filter: "saturate(0.92) contrast(1.02)" }}
        />
      ) : null}
    </div>
  );
}
