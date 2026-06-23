/* eslint-disable @next/next/no-img-element */
/** Plain <img> for decorative brand PNGs (titles, logos, silhouettes) where
 *  exact height-based sizing matters more than next/image optimization. */
export default function SiteImg({
  src,
  alt = "",
  className = "",
  style,
}: {
  src: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return <img src={src} alt={alt} className={className} style={style} aria-hidden={alt === ""} />;
}
