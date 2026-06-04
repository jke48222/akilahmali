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
    <svg viewBox="0 0 361 361" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M255 3H105C49 3 3 49 3 105v150c0 56 46 102 102 102h150c56 0 102-46 102-102V105C357 49 311 3 255 3z" />
      <path
        d="M234 72c2-1 5-1 6 1l1 3v131c0 2 0 5-1 7-4 17-18 30-35 33-5 1-10 1-15 0-16-4-27-19-27-35 0-16 11-29 27-33 9-2 18-1 26 3V109l-96 22v112c0 3 0 5-1 8-4 17-18 30-35 33-5 1-10 1-15-1-16-4-27-18-27-35 0-16 12-29 27-33 9-2 18 0 26 4V95c0-4 2-7 5-8l134-31z"
        fill="var(--color-bg, #EDE8F2)"
      />
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

export function LinkedInIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
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
