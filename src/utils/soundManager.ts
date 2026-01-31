/**
 * Sound manager using Web Audio API — no external files needed.
 * Generates short tonal effects for UI interactions.
 */

const SOUND_KEY = 'ttt10-sound-enabled';

let audioCtx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  return audioCtx;
}

export function isSoundEnabled(): boolean {
  return localStorage.getItem(SOUND_KEY) !== 'false';
}

export function setSoundEnabled(enabled: boolean) {
  localStorage.setItem(SOUND_KEY, String(enabled));
}

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) {
  if (!isSoundEnabled()) return;
  const ctx = getContext();
  if (!ctx) return;

  // Resume context if suspended (browser autoplay policy)
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

/** Short click for UI selections */
export function playClick() {
  playTone(800, 0.08, 'sine', 0.1);
}

/** Upward sweep for starting a game */
export function playStart() {
  if (!isSoundEnabled()) return;
  const ctx = getContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume();

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(400, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.2);
  gain.gain.setValueAtTime(0.12, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.3);
}

/** Cell placement sound — soft pop */
export function playPlace() {
  playTone(600, 0.1, 'triangle', 0.1);
}

/** Win celebration — ascending chord */
export function playWin() {
  if (!isSoundEnabled()) return;
  [523, 659, 784].forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.3, 'sine', 0.12), i * 100);
  });
}

/** Error / invalid move — low buzz */
export function playError() {
  playTone(200, 0.15, 'square', 0.08);
}
