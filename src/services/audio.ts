// Procedural WebAudio Synth Engine for Vooter Arcade
// Zero external audio files required - instant load, works offline!

let audioCtx: AudioContext | null = null;
let isMuted: boolean = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function setMuted(muted: boolean): void {
  isMuted = muted;
  if (typeof window !== 'undefined') {
    localStorage.setItem('vooter_muted', muted ? 'true' : 'false');
  }
}

export function getMuted(): boolean {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('vooter_muted');
    if (saved !== null) {
      isMuted = saved === 'true';
    }
  }
  return isMuted;
}

export function unlockAudio(): void {
  getAudioContext();
}

interface ToneOptions {
  f?: number;
  f2?: number | null;
  dur?: number;
  type?: OscillatorType;
  vol?: number;
  delay?: number;
}

function playTone({ f = 440, f2 = null, dur = 0.15, type = 'square', vol = 0.12, delay = 0 }: ToneOptions): void {
  const ctx = getAudioContext();
  if (!ctx || isMuted) return;
  try {
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f, t);
    if (f2) osc.frequency.exponentialRampToValueAtTime(Math.max(1, f2), t + dur);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.03);
  } catch {
    // Ignore audio context errors
  }
}

interface NoiseOptions {
  dur?: number;
  vol?: number;
  delay?: number;
  freq?: number;
  q?: number;
}

function playNoise({ dur = 0.2, vol = 0.18, delay = 0, freq = 900, q = 0.7 }: NoiseOptions): void {
  const ctx = getAudioContext();
  if (!ctx || isMuted) return;
  try {
    const t = ctx.currentTime + delay;
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = freq;
    filter.Q.value = q;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start(t);
  } catch {
    // Ignore audio context errors
  }
}

export const sfx = {
  // UI SFX
  click: () => playTone({ f: 520, f2: 760, dur: 0.07, type: 'triangle', vol: 0.08 }),
  hover: () => playTone({ f: 600, dur: 0.04, type: 'sine', vol: 0.03 }),
  navigate: () => playTone({ f: 440, f2: 660, dur: 0.08, type: 'triangle', vol: 0.06 }),
  unlock: () => {
    playTone({ f: 440, dur: 0.08, type: 'triangle', vol: 0.1 });
    playTone({ f: 660, dur: 0.08, type: 'triangle', vol: 0.1, delay: 0.07 });
    playTone({ f: 880, dur: 0.16, type: 'triangle', vol: 0.12, delay: 0.14 });
  },

  // Ballot Trap SFX
  jump: () => playTone({ f: 280, f2: 640, dur: 0.14, type: 'square', vol: 0.07 }),
  land: () => playNoise({ dur: 0.06, vol: 0.06, freq: 500 }),
  ballot: () => {
    playTone({ f: 880, dur: 0.07, type: 'triangle', vol: 0.12 });
    playTone({ f: 1320, dur: 0.14, type: 'triangle', vol: 0.12, delay: 0.07 });
  },
  die: () => {
    playTone({ f: 420, f2: 60, dur: 0.45, type: 'sawtooth', vol: 0.13 });
    playNoise({ dur: 0.3, vol: 0.12, freq: 700 });
  },
  stomp: () => {
    playTone({ f: 220, f2: 90, dur: 0.12, type: 'square', vol: 0.12 });
    playTone({ f: 520, f2: 900, dur: 0.1, type: 'triangle', vol: 0.08, delay: 0.05 });
  },
  crumble: () => playNoise({ dur: 0.35, vol: 0.14, freq: 420 }),
  pop: () => playTone({ f: 900, f2: 200, dur: 0.1, type: 'square', vol: 0.1 }),
  thud: () => {
    playNoise({ dur: 0.22, vol: 0.2, freq: 260 });
    playTone({ f: 90, f2: 40, dur: 0.2, type: 'sine', vol: 0.2 });
  },
  shoot: () => playTone({ f: 500, f2: 260, dur: 0.09, type: 'sawtooth', vol: 0.05 }),
  bump: () => playTone({ f: 160, f2: 110, dur: 0.1, type: 'square', vol: 0.1 }),
  dodge: () => {
    playTone({ f: 300, f2: 1400, dur: 0.22, type: 'sine', vol: 0.1 });
    playTone({ f: 1400, f2: 300, dur: 0.22, type: 'sine', vol: 0.07, delay: 0.1 });
  },
  flip: () => {
    playTone({ f: 330, f2: 220, dur: 0.12, type: 'triangle', vol: 0.1 });
    playTone({ f: 220, f2: 330, dur: 0.12, type: 'triangle', vol: 0.1, delay: 0.12 });
  },
  dark: () => playTone({ f: 120, f2: 40, dur: 0.3, type: 'sawtooth', vol: 0.09 }),
  light: () => playTone({ f: 200, f2: 700, dur: 0.18, type: 'square', vol: 0.06 }),

  // Snake Evolution SFX
  snakeEat: () => playTone({ f: 600, f2: 950, dur: 0.08, type: 'square', vol: 0.08 }),
  snakePower: () => {
    playTone({ f: 520, f2: 1040, dur: 0.12, type: 'sine', vol: 0.1 });
    playTone({ f: 1040, f2: 1560, dur: 0.15, type: 'sine', vol: 0.09, delay: 0.08 });
  },
  snakeTurn: () => playTone({ f: 260, dur: 0.03, type: 'triangle', vol: 0.02 }),

  // Memory Match SFX
  cardFlip: () => playTone({ f: 450, f2: 550, dur: 0.06, type: 'sine', vol: 0.05 }),
  cardMatch: () => {
    playTone({ f: 523, dur: 0.08, type: 'triangle', vol: 0.1 });
    playTone({ f: 659, dur: 0.08, type: 'triangle', vol: 0.1, delay: 0.06 });
    playTone({ f: 784, dur: 0.12, type: 'triangle', vol: 0.12, delay: 0.12 });
  },
  cardMiss: () => {
    playTone({ f: 320, f2: 240, dur: 0.15, type: 'sawtooth', vol: 0.06 });
  },

  // Win / Victory Fanfare
  win: () => {
    [523, 659, 784, 1047].forEach((f, i) =>
      playTone({ f, dur: 0.18, type: 'triangle', vol: 0.13, delay: i * 0.11 })
    );
    playTone({ f: 1319, dur: 0.45, type: 'triangle', vol: 0.14, delay: 0.5 });
  },
};
