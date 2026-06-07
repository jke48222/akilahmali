/**
 * Routes that take over the full viewport (the immersive release experiences:
 * WHO REALLY WON? + its vinyl loop, THE DRIVE, THE PAYPHONE). On these, the
 * site chrome — nav, footer, intro splash, scroll bar, custom cursor — is
 * suppressed so the experience owns the screen (and can set its own cursor).
 */
export function isImmersive(pathname?: string | null): boolean {
  if (!pathname) return false;
  return (
    pathname === "/music/who-really-won" ||
    pathname.startsWith("/music/who-really-won/") ||
    pathname === "/music/endless-cycle" ||
    pathname === "/payphone"
  );
}
