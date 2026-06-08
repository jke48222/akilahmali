/**
 * Add-to-calendar helpers for shows. Pure string builders + a client-side .ics
 * download. No deps — a Google Calendar template URL covers web/Android, and an
 * .ics blob covers Apple Calendar / Outlook.
 */

export type CalendarEvent = {
  title: string;
  /** ISO datetime (show start). */
  start: string;
  /** Event length in minutes. Defaults to 120. */
  durationMin?: number;
  location?: string;
  details?: string;
  url?: string;
};

/** ISO → `YYYYMMDDTHHMMSSZ` (UTC). Returns "" for an unparseable date. */
function toICalUTC(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function endStamp(iso: string, durationMin: number): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return toICalUTC(new Date(d.getTime() + durationMin * 60_000).toISOString());
}

/** A Google Calendar "add event" template URL. */
export function googleCalendarUrl(ev: CalendarEvent): string {
  const start = toICalUTC(ev.start);
  const end = endStamp(ev.start, ev.durationMin ?? 120);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: ev.title,
    dates: `${start}/${end}`,
  });
  if (ev.location) params.set("location", ev.location);
  const details = [ev.details, ev.url].filter(Boolean).join("\n\n");
  if (details) params.set("details", details);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Escape per RFC 5545 (commas, semicolons, newlines, backslashes). */
function icsEscape(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/[,;]/g, "\\$&").replace(/\n/g, "\\n");
}

/** Build a single-event .ics document. `uid` should be stable per show. */
export function buildIcs(ev: CalendarEvent, uid: string): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Akilah Mali//Shows//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}@akilahmali.com`,
    `DTSTAMP:${toICalUTC(ev.start)}`,
    `DTSTART:${toICalUTC(ev.start)}`,
    `DTEND:${endStamp(ev.start, ev.durationMin ?? 120)}`,
    `SUMMARY:${icsEscape(ev.title)}`,
    ev.location ? `LOCATION:${icsEscape(ev.location)}` : "",
    ev.details ? `DESCRIPTION:${icsEscape(ev.details)}` : "",
    ev.url ? `URL:${ev.url}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);
  // RFC 5545 wants CRLF line endings.
  return lines.join("\r\n");
}

/** Trigger a browser download of an .ics file for the event (client only). */
export function downloadIcs(ev: CalendarEvent, uid: string, filename: string): void {
  const blob = new Blob([buildIcs(ev, uid)], { type: "text/calendar;charset=utf-8" });
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = filename.endsWith(".ics") ? filename : `${filename}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoke on the next tick so the download has a chance to start.
  setTimeout(() => URL.revokeObjectURL(href), 0);
}

/**
 * Great-circle distance between two lat/lng points, in miles (haversine).
 */
export function distanceMiles(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 3958.8; // Earth radius, miles
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}
