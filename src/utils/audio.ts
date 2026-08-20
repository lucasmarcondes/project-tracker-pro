/**
 * Synthesizes a warm, uplifting multi-tone chime using the Web Audio API.
 * Uses pentatonic ascending harmonics (C5 -> E5 -> G5 -> C6) with smooth exponential decay.
 * Lazily initializes AudioContext on user interaction to comply with browser autoplay policies.
 */
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch (err) {
    console.warn('Web Audio API not supported or blocked:', err);
    return null;
  }
}

export function playHappyCompletionSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [
    { freq: 523.25, time: 0.0, duration: 0.4 }, // C5
    { freq: 659.25, time: 0.08, duration: 0.45 }, // E5
    { freq: 783.99, time: 0.16, duration: 0.5 }, // G5
    { freq: 1046.5, time: 0.24, duration: 0.8 }, // C6
  ];

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.3, ctx.currentTime);
  masterGain.connect(ctx.destination);

  for (const note of notes) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle'; // Rich, warm bell-like chime
    osc.frequency.setValueAtTime(note.freq, ctx.currentTime);

    const startTime = ctx.currentTime + note.time;
    const endTime = startTime + note.duration;

    // Fast attack, smooth decay
    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.exponentialRampToValueAtTime(0.6, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, endTime);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(startTime);
    osc.stop(endTime);
  }
}
