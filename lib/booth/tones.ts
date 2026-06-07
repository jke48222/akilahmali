/* =========================================================================
   THE PAYPHONE — telephone tone engine (Web Audio).

   Real telephony tones, synthesised live so the booth needs no audio files:
     • dial tone   — continuous 350 + 440 Hz (North American)
     • DTMF        — the two-frequency touch-tones per key
     • ringback    — 440 + 480 Hz, 2s on / 4s off
     • intercept   — the rising 3-tone "Special Information Tone" you hear
                     before "the number you have dialed is not in service"
   One shared AudioContext (created on the PICK UP gesture in TheBooth).
   ========================================================================= */

const DTMF: Record<string, [number, number]> = {
  "1": [697, 1209], "2": [697, 1336], "3": [697, 1477],
  "4": [770, 1209], "5": [770, 1336], "6": [770, 1477],
  "7": [852, 1209], "8": [852, 1336], "9": [852, 1477],
  "*": [941, 1209], "0": [941, 1336], "#": [941, 1477],
};

export type ToneEngine = {
  dtmf: (key: string) => void;
  dialTone: (on: boolean) => void;
  ringback: (on: boolean) => void;
  intercept: () => Promise<void>;
  stopAll: () => void;
};

export function makeToneEngine(ctx: AudioContext): ToneEngine {
  const master = ctx.createGain();
  master.gain.value = 0.5;
  master.connect(ctx.destination);

  let dial: { osc: OscillatorNode[]; g: GainNode } | null = null;
  let ringOn = false;
  let ringTimers: number[] = [];
  let ringNodes: { osc: OscillatorNode[]; g: GainNode } | null = null;

  function pair(f1: number, f2: number, gain: number) {
    const g = ctx.createGain();
    g.gain.value = gain;
    g.connect(master);
    const o1 = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    o1.frequency.value = f1;
    o2.frequency.value = f2;
    o1.connect(g);
    o2.connect(g);
    o1.start();
    o2.start();
    return { osc: [o1, o2], g };
  }

  function dtmf(key: string) {
    const f = DTMF[key];
    if (!f) return;
    const now = ctx.currentTime;
    const node = pair(f[0], f[1], 0.0001);
    node.g.gain.setValueAtTime(0.0001, now);
    node.g.gain.exponentialRampToValueAtTime(0.3, now + 0.01);
    node.g.gain.setValueAtTime(0.3, now + 0.16);
    node.g.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
    node.osc.forEach((o) => o.stop(now + 0.22));
  }

  function dialTone(on: boolean) {
    if (on) {
      if (dial) return;
      dial = pair(350, 440, 0.16);
    } else if (dial) {
      const d = dial;
      dial = null;
      const now = ctx.currentTime;
      d.g.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
      d.osc.forEach((o) => o.stop(now + 0.07));
    }
  }

  function stopRingNodes() {
    if (ringNodes) {
      ringNodes.osc.forEach((o) => {
        try {
          o.stop();
        } catch {
          /* already stopped */
        }
      });
      ringNodes = null;
    }
  }

  function ringback(on: boolean) {
    if (on) {
      if (ringOn) return;
      ringOn = true;
      // 2s on / 4s off, repeating — EVERY timer is tracked so ringback(false)
      // (and stopAll) can fully cancel it. The cycle bails if ringOn flipped.
      const cycle = () => {
        if (!ringOn) return;
        stopRingNodes();
        ringNodes = pair(440, 480, 0.18);
        ringTimers.push(window.setTimeout(stopRingNodes, 2000));
        ringTimers.push(window.setTimeout(cycle, 6000));
      };
      cycle();
    } else {
      ringOn = false;
      ringTimers.forEach((t) => clearTimeout(t));
      ringTimers = [];
      stopRingNodes();
    }
  }

  // the rising 3-tone Special Information Tone, then silence (the "recording")
  function intercept(): Promise<void> {
    dialTone(false);
    const seq: [number, number][] = [[985.2, 0.33], [1428.5, 0.33], [1776.7, 0.38]];
    let t = ctx.currentTime + 0.05;
    for (const [freq, dur] of seq) {
      const g = ctx.createGain();
      g.gain.value = 0.0001;
      g.connect(master);
      const o = ctx.createOscillator();
      o.frequency.value = freq;
      o.connect(g);
      o.start(t);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.32, t + 0.02);
      g.gain.setValueAtTime(0.32, t + dur - 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.stop(t + dur + 0.02);
      t += dur;
    }
    const totalMs = (t - ctx.currentTime) * 1000;
    return new Promise((res) => window.setTimeout(res, totalMs + 60));
  }

  function stopAll() {
    dialTone(false);
    ringback(false);
  }

  return { dtmf, dialTone, ringback, intercept, stopAll };
}
