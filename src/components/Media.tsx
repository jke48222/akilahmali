import Image from "next/image";

type PlaceholderProps = {
  label?: string;
  className?: string;
  tone?: "dark" | "light";
  /** drop-in real asset later: if set, renders the image instead of the placeholder */
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
};

/**
 * Sized placeholder for artist photos / cover art that can't be copied
 * (likeness + copyright). Pass `src` once you supply a licensed asset.
 */
export function Placeholder({
  label = "image",
  className = "",
  tone = "dark",
  src,
  alt = "",
  width = 800,
  height = 800,
}: PlaceholderProps) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`object-cover ${className}`}
      />
    );
  }
  const base =
    tone === "dark"
      ? "from-plum-deep to-ink text-white/45"
      : "from-lavender-soft to-lavender-deep text-plum/55";
  return (
    <div
      className={`relative grid place-items-center overflow-hidden bg-gradient-to-br ${base} ${className}`}
    >
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, #fff 0, transparent 40%), radial-gradient(circle at 80% 70%, #fff 0, transparent 40%)",
        }}
      />
      <span className="nav-label relative text-[0.6rem]">{label}</span>
    </div>
  );
}

/**
 * Recreated abstract "pixie" silhouette decorations (the source uses custom
 * brand PNGs — these are approximations, not copies).
 */
export function Silhouette({
  variant = "wings",
  className = "",
}: {
  variant?: "wings" | "figure";
  className?: string;
}) {
  if (variant === "wings") {
    return (
      <svg viewBox="0 0 200 240" className={className} fill="#0c0810" aria-hidden>
        {/* winged reaching figure — abstract */}
        <path d="M100 70c6-22 24-44 52-52-14 18-18 36-14 52 16-10 34-12 50-6-20 8-34 22-44 40-8 14-22 22-44 22-4 18-2 40 6 62-18-16-30-38-32-62-22 2-44-6-60-24 20 6 38 2 52-10-10-16-12-36-6-54 14 10 26 24 34 32Z" />
        <path d="M96 96c4 0 7 3 7 7v120c0 6-14 6-14 0V103c0-4 3-7 7-7Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 200 260" className={className} fill="#0c0810" aria-hidden>
      {/* seated/reaching figure — abstract */}
      <path d="M118 26c14 6 22 22 16 36-4 10-14 16-24 16 18 8 34 22 40 42 6 18 2 40-12 56 8-20 6-40-6-54-10-12-26-18-42-16-18 2-34 14-40 32-4-22 4-44 22-58-16-4-28-18-28-36 0-10 6-20 16-24-2 12 2 24 12 32 6-20 22-36 44-40-8-6-12-16-10-26 4 8 12 12 22 12-2-8 0-16 6-20-2 8 2 16 10 20Z" />
    </svg>
  );
}
