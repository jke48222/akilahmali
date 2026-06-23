type Props = {
  type: "track" | "album" | "artist" | "playlist";
  id: string;
  height?: number;
  className?: string;
};

/** Live Spotify embed (kept per user decision). theme=0 = dark player. */
export default function SpotifyEmbed({ type, id, height = 152, className = "" }: Props) {
  return (
    <iframe
      className={`spotify-embed ${className}`}
      src={`https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`}
      height={height}
      width="100%"
      loading="lazy"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      allowFullScreen
      title={`Spotify ${type}`}
    />
  );
}

