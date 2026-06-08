"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, CalendarPlus, MapPin } from "lucide-react";
import { RsvpForm } from "@/components/shows/RsvpForm";
import {
  distanceMiles,
  downloadIcs,
  googleCalendarUrl,
  type CalendarEvent,
} from "@/lib/calendar";
import type { ShowItem } from "@/lib/queries";

const DAY_NAMES = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function formatShowDate(iso: string): { compact: string; dow: string } {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { compact: iso, dow: "" };
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return { compact: `${dd}.${mm}.${yy}`, dow: DAY_NAMES[d.getDay()] };
}

const isSoldOut = (s: ShowItem) =>
  s.status === "soldOut" || s.status === "cancelled";
const isRsvp = (s: ShowItem) => !s.ticketUrl && !!s.rsvp && !isSoldOut(s);

function ticketLabel(s: ShowItem): string {
  switch (s.status) {
    case "soldOut": return "sold out";
    case "cancelled": return "cancelled";
    case "tba": return "details soon";
    default: return "tickets";
  }
}

function calendarEvent(s: ShowItem): CalendarEvent {
  const place = [s.venue, s.city, s.country].filter(Boolean).join(", ");
  return {
    title: `Akilah Mali — ${s.city}`,
    start: s.date,
    location: place,
    details: [s.billing, s.venue].filter(Boolean).join(" · "),
    url: s.ticketUrl,
  };
}

type GeoState = "idle" | "locating" | "done" | "denied" | "unsupported";
type SortMode = "date" | "distance";

export function ShowsList({ shows }: { shows: ShowItem[] }) {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoState, setGeoState] = useState<GeoState>("idle");
  const [sortMode, setSortMode] = useState<SortMode>("date");
  const [openRsvp, setOpenRsvp] = useState<string | null>(null);

  // Distance (miles) per show id, only when we have the visitor's location.
  const distances = useMemo(() => {
    const m = new Map<string, number>();
    if (!coords) return m;
    for (const s of shows) {
      if (s.geo) m.set(s._id, distanceMiles(coords, s.geo));
    }
    return m;
  }, [coords, shows]);

  const ordered = useMemo(() => {
    if (sortMode === "date" || !coords) return shows;
    // Distance sort: located shows nearest-first, un-pinned shows keep date order
    // at the end (they're already date-sorted from the query).
    const withGeo = shows.filter((s) => distances.has(s._id));
    const without = shows.filter((s) => !distances.has(s._id));
    withGeo.sort(
      (a, b) => (distances.get(a._id) ?? 0) - (distances.get(b._id) ?? 0),
    );
    return [...withGeo, ...without];
  }, [shows, sortMode, coords, distances]);

  const anyGeo = shows.some((s) => s.geo);

  function locate() {
    if (coords) {
      // Already located — toggle the sort.
      setSortMode((m) => (m === "distance" ? "date" : "distance"));
      return;
    }
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoState("unsupported");
      return;
    }
    setGeoState("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoState("done");
        setSortMode("distance");
      },
      () => setGeoState("denied"),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 600_000 },
    );
  }

  function nearMeLabel(): string {
    if (geoState === "locating") return "locating…";
    if (coords) return sortMode === "distance" ? "by date" : "shows near me";
    return "shows near me";
  }

  return (
    <section className="relative" aria-labelledby="shows-list-heading">
      <div className="mx-auto max-w-page px-gutter md:px-gutter-md lg:px-gutter-lg mt-10 md:mt-16">
        <div className="flex items-center justify-between gap-4">
          <h2 id="shows-list-heading" className="sr-only">
            Upcoming shows
          </h2>
          {anyGeo ? (
            <div className="ml-auto flex flex-col items-end gap-1">
              <button
                type="button"
                onClick={locate}
                disabled={geoState === "locating"}
                data-cursor="hover"
                aria-pressed={sortMode === "distance"}
                className="font-mono text-mono-xs uppercase tracking-caps-md inline-flex items-center gap-2 text-ink-2 hover:text-ink transition-colors disabled:opacity-60"
              >
                <MapPin size={13} strokeWidth={1.3} aria-hidden="true" />
                {nearMeLabel()}
              </button>
              {geoState === "denied" ? (
                <span className="font-mono text-[10px] uppercase tracking-caps text-ink-3">
                  location off — showing by date
                </span>
              ) : null}
              {geoState === "unsupported" ? (
                <span className="font-mono text-[10px] uppercase tracking-caps text-ink-3">
                  location unavailable here
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        <ul className="mt-5 border-t border-ink list-none p-0">
          {ordered.map((s) => {
            const { compact, dow } = formatShowDate(s.date);
            const sold = isSoldOut(s);
            const rsvp = isRsvp(s);
            const hasUrl = Boolean(s.ticketUrl) && !sold;
            const label = ticketLabel(s);
            const miles = distances.get(s._id);
            const showMiles = coords && typeof miles === "number";
            const isOpen = openRsvp === s._id;

            return (
              <li key={s._id} className="border-b border-rule">
                <div className="grid grid-cols-12 gap-4 md:gap-6 items-baseline py-5 md:py-7">
                  <div className="col-span-4 md:col-span-3 font-mono uppercase tracking-[0.06em] tabular-nums text-ink">
                    <span className="text-[18px] md:text-[22px]">{compact}</span>
                    <span className="ml-2 text-mono-xs tracking-caps-md text-ink-3">
                      · {dow}
                    </span>
                  </div>
                  <div className="col-span-8 md:col-span-5">
                    <div
                      className="font-display italic leading-[0.95]"
                      style={{ fontSize: "clamp(24px, 2.6vw, 36px)" }}
                    >
                      {s.city}
                      {s.country && s.country !== "USA" ? `, ${s.country}` : ""}
                    </div>
                    <div className="mt-1 font-mono text-mono-xs uppercase tracking-caps text-ink-2">
                      {s.venue}
                      {s.billing ? (
                        <> &nbsp;·&nbsp; <span className="text-ink-3">{s.billing}</span></>
                      ) : null}
                      {showMiles ? (
                        <> &nbsp;·&nbsp; <span className="text-accent">~{Math.round(miles!)} mi</span></>
                      ) : null}
                    </div>
                  </div>
                  <div className="col-span-12 md:col-span-4 md:text-right font-mono text-mono-sm uppercase tracking-caps-md flex flex-wrap items-baseline gap-x-5 gap-y-1 md:justify-end">
                    {hasUrl ? (
                      <a
                        href={s.ticketUrl!}
                        rel="noopener"
                        target="_blank"
                        data-cursor="hover"
                        className="text-ink inline-flex items-baseline gap-2"
                      >
                        <span className="ulink">{label}</span>
                        <span className="text-ink-2" aria-hidden="true">
                          <ArrowUpRight size={14} strokeWidth={1.1} />
                        </span>
                      </a>
                    ) : rsvp ? (
                      <button
                        type="button"
                        onClick={() => setOpenRsvp(isOpen ? null : s._id)}
                        aria-expanded={isOpen}
                        data-cursor="hover"
                        className="text-ink inline-flex items-baseline gap-2"
                      >
                        <span className="ulink">{isOpen ? "close" : "rsvp"}</span>
                      </button>
                    ) : (
                      <span className="text-ink-3">{label}</span>
                    )}

                    {!sold ? (
                      <a
                        href={googleCalendarUrl(calendarEvent(s))}
                        rel="noopener"
                        target="_blank"
                        data-cursor="hover"
                        className="text-ink-2 hover:text-ink inline-flex items-baseline gap-1.5 transition-colors"
                        title="Add to Google Calendar"
                      >
                        <CalendarPlus size={13} strokeWidth={1.2} aria-hidden="true" />
                        <span>cal</span>
                      </a>
                    ) : null}
                    {!sold ? (
                      <button
                        type="button"
                        onClick={() =>
                          downloadIcs(calendarEvent(s), s._id, `akilah-mali-${s.city.toLowerCase().replace(/\s+/g, "-")}`)
                        }
                        data-cursor="hover"
                        className="text-ink-3 hover:text-ink-2 transition-colors"
                        title="Download .ics (Apple Calendar / Outlook)"
                      >
                        .ics
                      </button>
                    ) : null}
                  </div>
                </div>

                {rsvp && isOpen ? (
                  <div className="grid grid-cols-12 gap-4 md:gap-6 pb-6 md:pb-7">
                    <div className="col-span-12 md:col-span-8 md:col-start-4">
                      <p className="mb-3 font-mono text-mono-xs uppercase tracking-caps text-ink-3">
                        free entry · rsvp to hold your spot + get a reminder
                      </p>
                      <RsvpForm
                        showId={s._id}
                        city={s.city}
                        dateIso={s.date}
                        onDone={() => undefined}
                      />
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
