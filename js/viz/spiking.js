/**
 * Neuromorphic vision figure: why a spiking network needs a surrogate gradient.
 * Left panel integrates Izhikevich dynamics and emits spikes; right panel shows
 * the derivative that backprop actually receives under each choice of
 * pseudo-derivative. Schematic dynamics with published Izhikevich constants.
 */
import { createCanvas, animate, seeded, COLORS, drawGrid, label, bindToggle } from './utils.js';

const W = 560;
const H = 300;

// Regular-spiking parameter set from the Izhikevich model.
const IZ = { a: 0.02, b: 0.2, c: -65, d: 8, thresh: 30 };

export function initSpiking(host, controls, readout) {
  const { ctx } = createCanvas(host, W, H);
  const rand = seeded(7331);

  let mode = 'surrogate';
  bindToggle(controls, (value) => {
    mode = value;
  });

  // Precompute one membrane trace plus the spike times it produces.
  const STEPS = 220;
  const trace = [];
  const spikes = [];
  let v = IZ.c;
  let u = IZ.b * v;
  for (let k = 0; k < STEPS; k += 1) {
    const I = 7 + 8 * Math.max(0, Math.sin(k / 7)) + rand() * 3.4;
    v += 0.5 * (0.04 * v * v + 5 * v + 140 - u + I);
    v += 0.5 * (0.04 * v * v + 5 * v + 140 - u + I);
    u += IZ.a * (IZ.b * v - u);
    if (v >= IZ.thresh) {
      trace.push(IZ.thresh);
      spikes.push(k);
      v = IZ.c;
      u += IZ.d;
    } else {
      trace.push(v);
    }
  }

  // Input spike raster standing in for an event-camera / N-MNIST style stream.
  const raster = Array.from({ length: 14 }, (_, ch) =>
    Array.from({ length: STEPS }, (_, k) => (rand() < 0.07 + 0.05 * Math.sin(k / 11 + ch) ? k : -1))
      .filter((k) => k >= 0)
  );

  animate(host, (time) => {
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, W, H);
    drawGrid(ctx, W, H, 30);

    const cursor = Math.floor((time * 46) % STEPS);
    const px = 24;
    const pw = 300;
    const toX = (k) => px + (k / (STEPS - 1)) * pw;

    // Input raster.
    label(ctx, 'EVENT INPUT  (temporal encoding)', px, 22, COLORS.dim, 9);
    raster.forEach((chan, i) => {
      const y = 34 + i * 5.4;
      chan.forEach((k) => {
        if (k > cursor) return;
        ctx.fillStyle = k > cursor - 24 ? COLORS.accent : 'rgba(98,208,255,0.25)';
        ctx.fillRect(toX(k), y, 1.6, 3.4);
      });
    });

    // Membrane potential.
    const my = 210;
    const scale = 0.9;
    label(ctx, 'MEMBRANE POTENTIAL  v(t)   Izhikevich', px, 128, COLORS.dim, 9);
    ctx.strokeStyle = '#2b313b';
    ctx.beginPath();
    ctx.moveTo(px, my - IZ.thresh * scale + 30);
    ctx.lineTo(px + pw, my - IZ.thresh * scale + 30);
    ctx.stroke();
    label(ctx, 'threshold', px + pw + 4, my - IZ.thresh * scale + 33, COLORS.muted, 8);

    ctx.beginPath();
    ctx.strokeStyle = COLORS.accent;
    ctx.lineWidth = 1.2;
    for (let k = 0; k <= cursor; k += 1) {
      const y = my - (trace[k] + 70) * scale * 0.75;
      if (k === 0) ctx.moveTo(toX(k), y);
      else ctx.lineTo(toX(k), y);
    }
    ctx.stroke();

    spikes.filter((k) => k <= cursor).forEach((k) => {
      ctx.strokeStyle = 'rgba(245,181,68,0.75)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(toX(k), my - 62);
      ctx.lineTo(toX(k), my - 46);
      ctx.stroke();
    });
    label(ctx, `output spikes: ${spikes.filter((k) => k <= cursor).length}`, px, my + 26, COLORS.warm, 9);

    // Right panel: forward nonlinearity and the gradient backprop actually sees.
    const gx = 372;
    const gw = 164;
    const gy = 200;
    ctx.strokeStyle = '#2b313b';
    ctx.strokeRect(gx, 60, gw, 150);
    label(ctx, 'BACKWARD PASS', gx, 50, COLORS.dim, 9);

    ctx.beginPath();
    ctx.strokeStyle = COLORS.muted;
    ctx.setLineDash([3, 3]);
    for (let i = 0; i <= 100; i += 1) {
      const x = gx + (i / 100) * gw;
      const s = (i / 100) * 8 - 4;
      const y = gy - (s >= 0 ? 110 : 0);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    label(ctx, 'forward: Heaviside', gx + 6, 76, COLORS.muted, 8);

    ctx.beginPath();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = mode === 'surrogate' ? COLORS.accent : '#3a4150';
    for (let i = 0; i <= 140; i += 1) {
      const x = gx + (i / 140) * gw;
      const s = (i / 140) * 8 - 4;
      // Fast-sigmoid surrogate: 1 / (1 + alpha |s|)^2
      const g = mode === 'surrogate' ? 1 / Math.pow(1 + 2.2 * Math.abs(s), 2) : 0;
      if (i === 0) ctx.moveTo(x, gy - g * 108);
      else ctx.lineTo(x, gy - g * 108);
    }
    ctx.stroke();

    if (mode === 'heaviside') {
      label(ctx, 'd/dv = 0 everywhere', gx + 6, gy - 14, COLORS.pink, 9);
      label(ctx, 'no usable gradient path', gx + 6, 244, COLORS.muted, 8);
    } else {
      label(ctx, 'surrogate d/dv', gx + 6, gy - 94, COLORS.accent, 9);
      label(ctx, 'gradient flows through the spike', gx + 6, 244, COLORS.muted, 8);
    }
    label(ctx, 'v - threshold', gx + gw / 2 - 26, 226, COLORS.muted, 8);

    if (readout) {
      readout.innerHTML = mode === 'surrogate'
        ? 'A fast-sigmoid <b>surrogate derivative</b> replaces the Heaviside step in the backward pass, giving every spiking layer a differentiable path.'
        : 'The true derivative of the spike function is <b>zero almost everywhere</b>, so plain backprop cannot train the network at all.';
    }
  });
}
