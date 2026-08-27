/**
 * AVID-MM figure: cross-modal speaker identity pipeline under missing modality.
 * Shows which branch carries the forward pass when one stream is dropped, and
 * how modality-dropout training keeps both branches pointing at one shared
 * identity space. Schematic diagram of the architecture, not a results plot.
 */
import { createCanvas, animate, seeded, gaussian, COLORS, label, bindToggle, roundRect } from './utils.js';

const W = 560;
const H = 300;

const BRANCHES = {
  audio: { y: 82, name: 'AUDIO', encoder: 'ECAPA-TDNN', feature: 'x-vector 192-d' },
  visual: { y: 218, name: 'VISUAL', encoder: 'FACE BACKBONE', feature: 'embedding 512-d' },
};

export function initModalityFusion(host, controls, readout) {
  const { ctx } = createCanvas(host, W, H);
  const rand = seeded(4242);

  // Two speaker identities in the shared space, drawn once and reused.
  const identities = [
    { cx: 470, cy: 118, color: COLORS.accent },
    { cx: 496, cy: 200, color: COLORS.warm },
  ].map((id) => ({
    ...id,
    pts: Array.from({ length: 34 }, () => ({ dx: gaussian(rand), dy: gaussian(rand) })),
  }));

  let mode = 'both';
  bindToggle(controls, (value) => {
    mode = value;
  });

  const isActive = (key) =>
    mode === 'both' || (mode === 'audio' && key === 'audio') || (mode === 'visual' && key === 'visual');

  function drawBox(x, y, w, h, active, title, sub) {
    ctx.save();
    ctx.strokeStyle = active ? COLORS.accent : '#2b313b';
    ctx.fillStyle = active ? 'rgba(98,208,255,0.07)' : 'rgba(255,255,255,0.02)';
    ctx.lineWidth = 1;
    roundRect(ctx, x, y, w, h, 5);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    label(ctx, title, x + 9, y + 18, active ? COLORS.dim : COLORS.muted, 9.5);
    if (sub) label(ctx, sub, x + 9, y + 32, COLORS.muted, 8);
  }

  function drawFlow(x1, y1, x2, y2, active, phase) {
    ctx.save();
    ctx.strokeStyle = active ? 'rgba(98,208,255,0.5)' : '#1d2128';
    ctx.setLineDash(active ? [] : [3, 3]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.bezierCurveTo((x1 + x2) / 2, y1, (x1 + x2) / 2, y2, x2, y2);
    ctx.stroke();
    ctx.restore();

    if (!active) return;
    // Packet travelling the active path makes the data flow legible.
    const t = (phase % 1);
    const mx = (x1 + x2) / 2;
    const bx = Math.pow(1 - t, 3) * x1 + 3 * Math.pow(1 - t, 2) * t * mx
      + 3 * (1 - t) * t * t * mx + t * t * t * x2;
    const by = Math.pow(1 - t, 3) * y1 + 3 * Math.pow(1 - t, 2) * t * y1
      + 3 * (1 - t) * t * t * y2 + t * t * t * y2;
    ctx.fillStyle = COLORS.accent;
    ctx.beginPath();
    ctx.arc(bx, by, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  animate(host, (time) => {
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, W, H);

    Object.entries(BRANCHES).forEach(([key, b], i) => {
      const active = isActive(key);
      const phase = time * 0.55 + i * 0.4;
      drawBox(20, b.y - 22, 84, 44, active, b.name, active ? 'present' : 'dropped');
      drawFlow(104, b.y, 132, b.y, active, phase);
      drawBox(132, b.y - 22, 108, 44, active, b.encoder, b.feature);
      drawFlow(240, b.y, 286, 150, active, phase + 0.3);
    });

    // Shared projection head trained with modality dropout.
    drawBox(286, 118, 96, 64, true, 'FUSION HEAD', 'dual AAM-Softmax');
    label(ctx, 'modality dropout', 286, 196, COLORS.warm, 8);
    label(ctx, 'during training', 286, 207, COLORS.muted, 8);
    drawFlow(382, 150, 420, 150, true, time * 0.55 + 0.7);

    // Shared identity space.
    ctx.save();
    ctx.strokeStyle = '#2b313b';
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(420, 70, 122, 168);
    ctx.restore();
    label(ctx, 'SHARED IDENTITY SPACE', 420, 62, COLORS.dim, 9);

    // Missing a modality widens the cluster but does not move its centre:
    // that invariance is what the dropout objective buys.
    const spread = mode === 'both' ? 7 : 12.5;
    const wobble = mode === 'both' ? 0 : Math.sin(time * 2) * 0.8;
    identities.forEach((id) => {
      id.pts.forEach((p) => {
        ctx.fillStyle = id.color;
        ctx.globalAlpha = mode === 'both' ? 0.85 : 0.55;
        ctx.fillRect(
          id.cx + p.dx * (spread + wobble) - 1,
          id.cy + p.dy * (spread + wobble) - 1,
          2,
          2
        );
      });
      ctx.globalAlpha = 1;
      ctx.strokeStyle = id.color;
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.arc(id.cx, id.cy, spread * 2.1, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    });

    label(ctx, `input state: ${mode === 'both' ? 'audio + visual' : `${mode} only`}`, 20, 274, COLORS.dim, 9.5);
    label(ctx, 'inference path stays valid under either dropout', 20, 288, COLORS.muted, 8.5);

    if (readout) {
      readout.innerHTML = mode === 'both'
        ? 'Both encoders contribute. The fusion head sees the full <b>audio-visual</b> pair and clusters stay tight.'
        : `Only the <b>${mode}</b> stream reaches the head. Clusters widen but keep their centre, so identity decisions survive the missing modality.`;
    }
  });
}
