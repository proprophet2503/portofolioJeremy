/**
 * EEG figure: subband decomposition and the time-domain features extracted per
 * band and per task segment. Band power shifts with the task, which is what the
 * classifier keys on. Schematic signals generated in-browser.
 */
import { createCanvas, animate, seeded, COLORS, label, bindToggle } from './utils.js';

const W = 560;
const H = 300;
const N = 320;

const BANDS = [
  { name: 'DELTA', hz: '0.5-4', freq: 1.6, color: '#4b6cb7' },
  { name: 'THETA', hz: '4-8', freq: 3.4, color: '#5b8fd6' },
  { name: 'ALPHA', hz: '8-13', freq: 6.2, color: '#62d0ff' },
  { name: 'BETA', hz: '13-30', freq: 11, color: '#8ee6c8' },
  { name: 'GAMMA', hz: '30+', freq: 19, color: '#f5b544' },
];

// Relative band power per task segment. Illustrative profile.
const TASKS = {
  resting: [0.9, 0.6, 1.0, 0.35, 0.2],
  thinking: [0.5, 0.85, 0.55, 0.8, 0.45],
  typing: [0.42, 0.6, 0.4, 0.95, 0.7],
};

export function initEegSubbands(host, controls, readout) {
  const { ctx } = createCanvas(host, W, H);
  const rand = seeded(1357);
  const noise = Array.from({ length: N }, () => rand() - 0.5);

  let task = 'resting';
  let blend = TASKS.resting.slice();
  bindToggle(controls, (value) => {
    task = value;
  });

  /** One band's sample at index i, given its current amplitude. */
  const sample = (band, amp, i, phase) =>
    amp * Math.sin((i / N) * band.freq * Math.PI * 2 + phase) + noise[i] * amp * 0.35;

  /** Time-domain features the pipeline computes per band per segment. */
  function features(values) {
    const n = values.length;
    const mav = values.reduce((a, v) => a + Math.abs(v), 0) / n;
    const mean = values.reduce((a, v) => a + v, 0) / n;
    const variance = values.reduce((a, v) => a + (v - mean) ** 2, 0) / n;
    return { mav, variance, std: Math.sqrt(variance) };
  }

  animate(host, (time) => {
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, W, H);

    // Ease the band amplitudes toward the selected task so the switch reads clearly.
    const target = TASKS[task];
    blend = blend.map((v, i) => v + (target[i] - v) * 0.06);

    const px = 96;
    const pw = 250;
    label(ctx, 'RAW EDF CHANNEL', 16, 26, COLORS.dim, 9);

    // Composite signal is the sum of its bands, drawn first.
    ctx.beginPath();
    ctx.strokeStyle = COLORS.dim;
    ctx.lineWidth = 1;
    for (let i = 0; i < N; i += 1) {
      const y = 40 - BANDS.reduce((a, b, k) => a + sample(b, blend[k], i, time * b.freq * 0.12), 0) * 5;
      const x = px + (i / (N - 1)) * pw;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Per-band traces plus their live feature bars.
    BANDS.forEach((band, k) => {
      const y0 = 84 + k * 42;
      const amp = blend[k];
      const values = [];
      ctx.beginPath();
      ctx.strokeStyle = band.color;
      ctx.lineWidth = 1.1;
      for (let i = 0; i < N; i += 1) {
        const s = sample(band, amp, i, time * band.freq * 0.12);
        values.push(s);
        const x = px + (i / (N - 1)) * pw;
        const y = y0 - s * 11;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      label(ctx, band.name, 16, y0 + 2, band.color, 9);
      label(ctx, `${band.hz} Hz`, 16, y0 + 13, COLORS.muted, 7.5);

      const f = features(values);
      const bars = [
        ['MAV', f.mav / 0.9],
        ['VAR', f.variance / 1.1],
        ['STD', f.std / 1.05],
      ];
      bars.forEach(([name, v], bi) => {
        const bx = 372 + bi * 62;
        const width = Math.min(v, 1) * 48;
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.fillRect(bx, y0 - 6, 48, 7);
        ctx.fillStyle = band.color;
        ctx.fillRect(bx, y0 - 6, width, 7);
        if (k === 0) label(ctx, name, bx, 66, COLORS.muted, 8);
      });
    });

    label(ctx, 'FEATURE MATRIX', 372, 44, COLORS.dim, 8.5);
    label(ctx, `segment: ${task.toUpperCase()}`, 16, 292, COLORS.accent, 9);
    label(ctx, '1,809 clinical recordings, ALS vs control', 190, 292, COLORS.muted, 8.5);

    if (readout) {
      const notes = {
        resting: 'Resting segments sit in <b>alpha and delta</b>. That baseline is what the other two tasks are scored against.',
        thinking: 'Thinking shifts power up into <b>theta and beta</b> as the alpha baseline drops.',
        typing: 'Typing pushes energy into <b>beta and gamma</b>, driven by motor activity in the same channel set.',
      };
      readout.innerHTML = notes[task];
    }
  });
}
