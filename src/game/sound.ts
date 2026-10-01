let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

export function unlockAudio(): void {
  const c = audio();
  if (c && c.state === "suspended") void c.resume();
}

function tone(freq: number, dur: number, type: OscillatorType, gain: number, delay = 0): void {
  const c = audio();
  if (!c) return;
  const osc = c.createOscillator();
  const amp = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  amp.gain.value = 0.0001;
  osc.connect(amp);
  amp.connect(c.destination);
  const t = c.currentTime + delay;
  amp.gain.exponentialRampToValueAtTime(gain, t + 0.015);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

export function playSnap(): void {
  tone(540, 0.06, "triangle", 0.04);
  tone(160, 0.04, "square", 0.015);
}

export function playChime(): void {
  tone(523, 0.16, "sine", 0.04, 0);
  tone(659, 0.2, "sine", 0.035, 0.07);
  tone(784, 0.26, "sine", 0.03, 0.14);
}
