/**
 * Routes that take over the full viewport (the WHO REALLY WON? release
 * experience + its vinyl loop). On these, the site chrome — nav, footer,
 * intro, scroll bar, custom cursor — is suppressed so the experience owns
 * the screen.
 */
export function isImmersive(pathname?: string | null): boolean {
  if (!pathname) return false;
  return pathname === "/music/who-really-won" || pathname.startsWith("/music/who-really-won/");
}
