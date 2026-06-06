"use client";

/* =========================================================================
   Global audio player. Mounted once in the root layout so a single <audio>
   element and its Web Audio graph survive client-side navigation — playback
   never stops when you move between pages.

   The graph is built lazily on the first user-initiated play() (autoplay +
   AudioContext both require a gesture). MediaElementAudioSourceNode can only be
   created once per element, so we keep it in a ref and reuse it. The analyser
   is exposed via getAnalyser() so the visualizer can read live frequency data.
   ========================================================================= */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CATALOG, type PlayerTrack } from "@/lib/player/catalog";

type PlayerContextValue = {
  current: PlayerTrack | null;
  isPlaying: boolean;
  progress: number; // 0..1
  duration: number; // seconds
  play: (track: PlayerTrack) => void;
  toggle: () => void;
  pause: () => void;
  seek: (frac: number) => void;
  next: () => void;
  prev: () => void;
  getAnalyser: () => AnalyserNode | null;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within <PlayerProvider>");
  return ctx;
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  const [current, setCurrent] = useState<PlayerTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  // Mirror of `current` for use inside event handlers without stale closures.
  const currentRef = useRef<PlayerTrack | null>(null);
  currentRef.current = current;

  // Build (once) and resume the Web Audio graph. Must run inside a gesture.
  const ensureGraph = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    if (!audioCtxRef.current) {
      const AC: typeof AudioContext =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!AC) return;
      const ctx = new AC();
      const source = ctx.createMediaElementSource(el);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.82;
      source.connect(analyser);
      analyser.connect(ctx.destination);
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
      sourceRef.current = source;
    }
    if (audioCtxRef.current.state === "suspended") {
      void audioCtxRef.current.resume();
    }
  }, []);

  const play = useCallback(
    (track: PlayerTrack) => {
      const el = audioRef.current;
      if (!el) return;
      ensureGraph();
      // Only swap the source when the track actually changes. Setting `src`
      // implicitly loads — calling load() here too would abort the play()
      // below ("play() interrupted by load()"), leaving the element paused.
      if (currentRef.current?.id !== track.id) {
        el.src = track.src;
      }
      currentRef.current = track;
      setCurrent(track);
      void el.play().then(() => setIsPlaying(true)).catch(() => {});
    },
    [ensureGraph],
  );

  const toggle = useCallback(() => {
    const el = audioRef.current;
    if (!el || !current) return;
    ensureGraph();
    if (el.paused) {
      void el.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      el.pause();
      setIsPlaying(false);
    }
  }, [current, ensureGraph]);

  const pause = useCallback(() => {
    const el = audioRef.current;
    if (el && !el.paused) {
      el.pause();
      setIsPlaying(false);
    }
  }, []);

  const seek = useCallback((frac: number) => {
    const el = audioRef.current;
    if (!el || !el.duration || Number.isNaN(el.duration)) return;
    el.currentTime = Math.max(0, Math.min(1, frac)) * el.duration;
  }, []);

  const step = useCallback(
    (dir: 1 | -1) => {
      const cur = current;
      const i = cur ? CATALOG.findIndex((t) => t.id === cur.id) : -1;
      const ni = (i + dir + CATALOG.length) % CATALOG.length;
      play(CATALOG[ni]);
    },
    [current, play],
  );
  const next = useCallback(() => step(1), [step]);
  const prev = useCallback(() => step(-1), [step]);

  // Audio element lifecycle → React state.
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onTime = () =>
      setProgress(el.duration ? el.currentTime / el.duration : 0);
    const onDur = () => setDuration(el.duration || 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => step(1);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("loadedmetadata", onDur);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onEnded);
    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("loadedmetadata", onDur);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ended", onEnded);
    };
  }, [step]);

  const value = useMemo<PlayerContextValue>(
    () => ({
      current,
      isPlaying,
      progress,
      duration,
      play,
      toggle,
      pause,
      seek,
      next,
      prev,
      getAnalyser: () => analyserRef.current,
    }),
    [current, isPlaying, progress, duration, play, toggle, pause, seek, next, prev],
  );

  return (
    <PlayerContext.Provider value={value}>
      {children}
      <audio ref={audioRef} preload="none" crossOrigin="anonymous" />
    </PlayerContext.Provider>
  );
}
