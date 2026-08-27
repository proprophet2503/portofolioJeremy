/**
 * TB cough figure: acoustic front end into a recurrent classifier.
 * A synthetic cough burst is framed, mapped to a log-mel surface, reduced to
 * MFCCs, then consumed left to right by an unrolled LSTM whose posterior for
 * the TB class settles as evidence accumulates. Schematic pipeline.
 */
import { createCanvas, animate, seeded, COLORS, label, bindToggle, clamp, roundRect } from './utils.js';

const W = 560;
const H = 300;
const FRAMES = 64;
const BANDS = 26;

export function initCoughLstm(host, controls, readout) {
  const { ctx } = createCanvas(host, W, H);
  const rand = seeded(9091);

  let clip = 'tb';
  bindToggle(controls, (value) => {
    clip = value;
  });

  /** Two synthetic log-mel surfaces: an explosive burst versus a broad wet cough. */
  function buildSurface(kind) {
    const grid = [];
    for (let f = 0; f < FRAMES; f += 1) {
      const col = [];
      const onset = kind === 'tb' ? 10 : 14;
      const decay = kind === 'tb' ? 0.14 : 0.06;
      const env = f < onset ? 0.05 : Math.exp(-(f - onset) * decay);
      for (let b = 0; b < BANDS; b += 1) {
        const tilt = kind === 'tb' ? Math.exp(-Math.pow((b - 7) / 7, 2)) : Math.exp(-Math.pow((b - 15) / 10, 2));
        const secondBurst = kind === 'tb' && f > 34 && f < 46 ? 0.55 * Math.exp(-(f - 34) * 0.2) : 0;
        col.push(clamp(env * tilt + secondBurst * tilt + rand() * 0.08, 0, 1));
      }
      grid.push(col);
    }
    return grid;
  }

  const surfaces = { tb: buildSurface('tb'), healthy: buildSurface('healthy') };

  animate(host, (time) => {
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, W, H);

    const grid = surfaces[clip];
    const cursor = Math.floor((time * 15) % (FRAMES + 12));
    const sx = 24;
    const sy = 48;
    const cw = 300 / FRAMES;
    const ch = 104 / BANDS;

    label(ctx, 'LOG-MEL SPECTROGRAM  (25 ms window / 10 ms hop)', sx, 38, COLORS.dim, 9);
    for (let f = 0; f < FRAMES; f += 1) {
      const seen = f <= cursor;
      for (let b = 0; b < BANDS; b += 1) {
        const m = grid[f][b];
        const a = seen ? 1 : 0.18;
        ctx.fillStyle = `rgba(${Math.round(30 + m * 90)}, ${Math.round(60 + m * 150)}, ${Math.round(90 + m * 165)}, ${a})`;
        ctx.fillRect(sx + f * cw, sy + (BANDS - 1 - b) * ch, cw + 0.6, ch + 0.6);
      }
    }
    ctx.strokeStyle = COLORS.accent;
    ctx.lineWidth = 1;
    const cxLine = sx + clamp(cursor, 0, FRAMES) * cw;
    ctx.beginPath();
    ctx.moveTo(cxLine, sy - 4);
    ctx.lineTo(cxLine, sy + 108);
    ctx.stroke();
    label(ctx, 'MFCC + delta features per frame', sx, sy + 126, COLORS.muted, 8.5);

    // Unrolled recurrent cells.
    const uy = 214;
    label(ctx, 'LSTM  (unrolled over frames)', sx, uy - 26, COLORS.dim, 9);
    const cells = 6;
    for (let i = 0; i < cells; i += 1) {
      const x = sx + i * 52;
      const active = cursor > (i / cells) * FRAMES;
      ctx.strokeStyle = active ? COLORS.accent : '#2b313b';
      ctx.fillStyle = active ? 'rgba(98,208,255,0.08)' : 'transparent';
      roundRect(ctx, x, uy, 40, 30, 4);
      ctx.fill();
      ctx.stroke();
      label(ctx, `h${i}`, x + 14, uy + 19, active ? COLORS.dim : COLORS.muted, 9);
      if (i < cells - 1) {
        ctx.strokeStyle = active ? 'rgba(98,208,255,0.5)' : '#1d2128';
        ctx.beginPath();
        ctx.moveTo(x + 40, uy + 15);
        ctx.lineTo(x + 52, uy + 15);
        ctx.stroke();
      }
    }

    // Posterior for the TB class, rising with accumulated evidence.
    const target = clip === 'tb' ? 0.93 : 0.11;
    const p = clamp(cursor / FRAMES, 0, 1) * target;
    const bx = 380;
    const by = 92;
    ctx.strokeStyle = '#2b313b';
    ctx.strokeRect(bx, by, 150, 130);
    label(ctx, 'CLASS POSTERIOR', bx, by - 10, COLORS.dim, 9);

    const drawBar = (i, name, value, color) => {
      const y = by + 30 + i * 44;
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.fillRect(bx + 12, y, 126, 12);
      ctx.fillStyle = color;
      ctx.fillRect(bx + 12, y, 126 * value, 12);
      label(ctx, name, bx + 12, y - 5, COLORS.muted, 8.5);
      label(ctx, `${(value * 100).toFixed(1)}%`, bx + 12 + 126 * value + 5, y + 10, color, 8.5);
    };
    drawBar(0, 'TB-SUGGESTIVE', p, COLORS.warm);
    drawBar(1, 'NON-TB', 1 - p, COLORS.accent);

    label(ctx, 'screening triage, not a diagnosis', bx, by + 148, COLORS.muted, 8.5);

    if (readout) {
      readout.innerHTML = clip === 'tb'
        ? 'Explosive onset plus a second burst concentrates energy in the <b>low mel bands</b>; the recurrent state accumulates that pattern across frames.'
        : 'A broad, flatter spectral envelope keeps the TB posterior low. The same front end handles both classes without a separate feature path.';
    }
  });
}
