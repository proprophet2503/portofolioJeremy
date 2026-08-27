/**
 * SwaraTTS figure: generative trajectory from prior noise to the latent speech
 * manifold, comparing a conditional flow-matching path against a diffusion path.
 * Schematic, drawn from the method definition rather than from run artefacts.
 */
import {
  createCanvas, animate, seeded, gaussian, lerp, clamp,
  COLORS, drawGrid, label, bindToggle,
} from './utils.js';

const W = 560;
const H = 300;
const N = 260;

/** Target latent: three formant-like clusters standing in for the speech manifold. */
function targetPoint(rand) {
  const modes = [
    { x: 430, y: 90, sx: 22, sy: 26 },
    { x: 470, y: 168, sx: 18, sy: 20 },
    { x: 415, y: 236, sx: 26, sy: 18 },
  ];
  const m = modes[Math.floor(rand() * modes.length)];
  return { x: m.x + gaussian(rand) * m.sx, y: m.y + gaussian(rand) * m.sy };
}

export function initFlowMatching(host, controls, readout) {
  const { ctx } = createCanvas(host, W, H);
  const rand = seeded(20260827);

  const particles = Array.from({ length: N }, () => {
    const src = { x: 110 + gaussian(rand) * 26, y: 150 + gaussian(rand) * 46 };
    const dst = targetPoint(rand);
    return { src, dst, bend: (rand() - 0.5) * 120, jitter: seeded(Math.floor(rand() * 1e9)) };
  });

  let mode = 'flow';

  bindToggle(controls, (value) => {
    mode = value;
  });

  /** Position along the transport path at time t for one particle. */
  function pathAt(p, t) {
    // Conditional flow matching regresses a straight probability path:
    // x_t = (1 - t) * x_0 + t * x_1, so the ODE trajectory is near-linear.
    const x = lerp(p.src.x, p.dst.x, t);
    const y = lerp(p.src.y, p.dst.y, t);
    if (mode === 'flow') return { x, y };

    // Reverse-time diffusion follows a curved, noise-dominated trajectory and
    // needs far more function evaluations to land on the same distribution.
    const arc = Math.sin(Math.PI * t) * p.bend;
    const noise = (1 - t) * 26;
    const r = p.jitter();
    return {
      x: x + arc * 0.28 + (r - 0.5) * noise,
      y: y + arc + (p.jitter() - 0.5) * noise,
    };
  }

  function drawEndpoints() {
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(70, 78, 82, 146);
    ctx.strokeRect(370, 56, 140, 200);
    ctx.restore();
    label(ctx, 'PRIOR  z ~ N(0, I)', 70, 70, COLORS.muted);
    label(ctx, 'LATENT SPEECH MANIFOLD', 370, 48, COLORS.accent);
  }

  animate(host, (time) => {
    const cycle = 3.4;
    const t = clamp(((time % cycle) / cycle) * 1.18, 0, 1);
    const eased = 1 - Math.pow(1 - t, 2.2);

    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, W, H);
    drawGrid(ctx, W, H, 28);
    drawEndpoints();

    const color = mode === 'flow' ? COLORS.accent : COLORS.pink;
    const trailSteps = mode === 'flow' ? 10 : 18;

    ctx.lineWidth = 1;
    particles.forEach((p, i) => {
      if (i % 3 === 0) {
        ctx.beginPath();
        ctx.strokeStyle = mode === 'flow'
          ? 'rgba(98,208,255,0.16)'
          : 'rgba(255,122,182,0.13)';
        for (let s = 0; s <= trailSteps; s += 1) {
          const ts = (s / trailSteps) * eased;
          const q = pathAt(p, ts);
          if (s === 0) ctx.moveTo(q.x, q.y);
          else ctx.lineTo(q.x, q.y);
        }
        ctx.stroke();
      }
      const q = pathAt(p, eased);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.55 + 0.45 * eased;
      ctx.fillRect(q.x - 1, q.y - 1, 2.2, 2.2);
      ctx.globalAlpha = 1;
    });

    // Integration-step budget: the point of the comparison.
    const nfe = mode === 'flow' ? Math.max(1, Math.round(eased * 8)) : Math.round(eased * 120);
    label(ctx, `t = ${eased.toFixed(2)}`, 16, 22, COLORS.dim, 10);
    label(ctx, `solver steps (NFE) = ${nfe}`, 16, 38, color, 10);
    label(
      ctx,
      mode === 'flow' ? 'dx/dt = v(x, t)  |  straight probability path' : 'dx = f dt + g dW  |  stochastic reverse path',
      16,
      H - 14,
      COLORS.muted
    );

    if (readout) {
      readout.innerHTML = mode === 'flow'
        ? 'Flow matching regresses a straight conditional path, so sampling stays stable at <b>single-digit solver steps</b>.'
        : 'Reverse diffusion integrates a curved stochastic path and needs <b>roughly an order of magnitude more steps</b> for the same sample quality.';
    }
  });
}
