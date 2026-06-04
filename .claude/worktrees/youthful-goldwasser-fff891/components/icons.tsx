import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function SpotifyIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.586 14.424a.622.622 0 0 1-.857.207c-2.348-1.434-5.304-1.758-8.785-.964a.622.622 0 1 1-.277-1.213c3.809-.87 7.077-.496 9.713 1.114a.622.622 0 0 1 .206.856zm1.223-2.722a.778.778 0 0 1-1.07.257c-2.687-1.652-6.785-2.13-9.964-1.166a.778.778 0 1 1-.45-1.49c3.633-1.1 8.147-.568 11.226 1.328a.778.778 0 0 1 .258 1.071zm.105-2.835c-3.223-1.914-8.54-2.09-11.617-1.156a.933.933 0 1 1-.541-1.786c3.531-1.072 9.404-.865 13.115 1.342a.933.933 0 1 1-.957 1.6z" />
    </svg>
  );
}

export function AppleIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M17.05 12.04c-.03-2.92 2.39-4.33 2.5-4.4-1.36-1.99-3.48-2.27-4.24-2.3-1.81-.18-3.53 1.06-4.44 1.06-.92 0-2.34-1.03-3.84-1-.99.01-1.91.58-2.42 1.46-1.04 1.79-.26 4.44.75 5.9.49.72 1.08 1.52 1.85 1.49.75-.03 1.03-.48 1.93-.48.91 0 1.16.48 1.96.46.81-.01 1.32-.73 1.81-1.45.57-.83.81-1.64.82-1.68-.02-.01-1.57-.6-1.58-2.36zM14.36 4.36c.41-.5.69-1.19.61-1.88-.59.02-1.31.39-1.74.88-.38.43-.72 1.14-.63 1.81.66.05 1.34-.33 1.76-.81z" />
    </svg>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="4.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.4" cy="6.6" r=".9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TikTokIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M16.6 5.82A4.28 4.28 0 0 1 14.85 3h-3.04v12.36a2.56 2.56 0 0 1-2.56 2.56 2.56 2.56 0 0 1-2.56-2.56 2.56 2.56 0 0 1 2.56-2.56c.28 0 .54.05.79.13V9.83a5.6 5.6 0 0 0-.79-.06A5.6 5.6 0 0 0 3.65 15.36 5.6 5.6 0 0 0 9.25 21a5.6 5.6 0 0 0 5.6-5.6V9.1a7.32 7.32 0 0 0 4.28 1.38V7.44a4.28 4.28 0 0 1-2.53-1.62z" />
    </svg>
  );
}

export function YouTubeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M21.6 7.2a2.5 2.5 0 0 0-1.76-1.77C18.2 5 12 5 12 5s-6.2 0-7.84.43A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.76 1.77C5.8 19 12 19 12 19s6.2 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15V9l5.2 3z" />
    </svg>
  );
}

export function ArrowIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true" {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function ArrowDiagIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1" aria-hidden="true" {...props}>
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true" {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}
