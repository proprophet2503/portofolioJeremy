/**
 * PINN lung reconstruction figure: sparse-view tomography as an inverse problem.
 * A continuous attenuation field mu(x) is queried along each X-ray, integrated
 * under Beer-Lambert, and compared with the measured detector profile.
 * Schematic phantom, not patient data.
 */
import { createCanvas, animate, COLORS, label, bindToggle, clamp } from './utils.js';

const W = 560;
const H = 300;

// Phantom placement and acquisition geometry.
const BOX = { x: 205, y: 53, w: 150, h: 150 };
const CX = BOX.x + BOX.w / 2;
const CY = BOX.y + BOX.h / 2;
const RADIUS = 92;
const RAYS = 22;

const VIEWS = {
  AP: { angle: 0 },
  PA: { angle: Math.PI },
  LAT: { angle: -Math.PI / 2 },
};

/** Thorax phantom: two low-attenuation lung fields, a dense spine, one cavity. */
function mu(u, v) {
  const inBody = ((u - 0.5) / 0.46) ** 2 + ((v - 0.52) / 0.45) ** 2 < 1;
  if (!inBody) return 0;

  const lung = (cx, cy, rx, ry) => {
    const d = ((u - cx) / rx) ** 2 + ((v - cy) / ry) ** 2;
    return d < 1 ? -0.74 * (1 - d * 0.35) : 0;
  };
  const spine = Math.abs(u - 0.5) < 0.06 && Math.abs(v - 0.52) < 0.4 ? 0.15 : 0;
  const cavity = ((u - 0.31) / 0.075) ** 2 + ((v - 0.4) / 0.075) ** 2 < 1 ? -0.45 : 0;

  return clamp(
    0.9 + lung(0.31, 0.5, 0.18, 0.29) + lung(0.69, 0.5, 0.18, 0.29) + spine + cavity,
    0.04,
    1
  );
}

export function initBeerLambert(host, controls, readout) {
  const { ctx } = createCanvas(host, W, H);
  let view = 'AP';
  bindToggle(controls, (value) => {
    view = value;
  });

  // The phantom never changes, only the sampling geometry does, so bake it once.
  const RES = 200;
  const field = document.createElement('canvas');
  field.width = RES;
  field.height = RES;
  const fctx = field.getContext('2d');
  const img = fctx.createImageData(RES, RES);
  for (let j = 0; j < RES; j += 1) {
    for (let i = 0; i < RES; i += 1) {
      const m = mu(i / (RES - 1), j / (RES - 1));
      const k = (j * RES + i) * 4;
      img.data[k] = Math.round(8 + m * 150);
      img.data[k + 1] = Math.round(14 + m * 196);
      img.data[k + 2] = Math.round(22 + m * 230);
      img.data[k + 3] = 255;
    }
  }
  fctx.putImageData(img, 0, 0);

  /** Line integral of mu between two points, in phantom-normalised coordinates. */
  function rayIntegral(u0, v0, u1, v1, steps = 110) {
    let acc = 0;
    for (let s = 0; s < steps; s += 1) {
      const t = s / (steps - 1);
      acc += mu(u0 + (u1 - u0) * t, v0 + (v1 - v0) * t);
    }
    return acc / steps;
  }

  animate(host, (time) => {
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, W, H);

    label(ctx, 'mu(x) parameterised by a coordinate MLP', 20, 22, COLORS.dim, 9.5);
    label(ctx, 'no voxel grid', 20, 35, COLORS.muted, 8.5);

    // Phantom.
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(field, BOX.x, BOX.y, BOX.w, BOX.h);
    ctx.restore();
    ctx.strokeStyle = '#2b313b';
    ctx.strokeRect(BOX.x, BOX.y, BOX.w, BOX.h);
    label(ctx, 'TB CAVITY', BOX.x + 6, BOX.y + 46, COLORS.warm, 8);

    const ang = VIEWS[view].angle;
    const dirX = Math.cos(ang);
    const dirY = Math.sin(ang);
    const perpX = -dirY;
    const perpY = dirX;

    const srcX = CX - dirX * RADIUS;
    const srcY = CY - dirY * RADIUS;
    const detX = CX + dirX * RADIUS;
    const detY = CY + dirY * RADIUS;

    // Detector plane, drawn as a solid bar on the far side of the phantom.
    ctx.save();
    ctx.strokeStyle = 'rgba(245,181,68,0.55)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(detX + perpX * 78, detY + perpY * 78);
    ctx.lineTo(detX - perpX * 78, detY - perpY * 78);
    ctx.stroke();
    ctx.restore();

    // Source.
    ctx.fillStyle = COLORS.accent;
    ctx.beginPath();
    ctx.arc(srcX, srcY, 4, 0, Math.PI * 2);
    ctx.fill();
    const srcLabelX = view === 'LAT' ? srcX - 24 : srcX - (view === 'PA' ? -10 : 46);
    const srcLabelY = view === 'LAT' ? srcY - 10 : srcY - 12;
    label(ctx, `SOURCE ${view}`, clamp(srcLabelX, 4, W - 70), srcLabelY, COLORS.accent, 9);

    // Ray fan. One ray is highlighted and swept so the integration reads as a process.
    const sweep = Math.sin(time * 0.8) * 0.5 + 0.5;
    const profile = [];
    for (let i = 0; i < RAYS; i += 1) {
      const f = i / (RAYS - 1);
      const off = (f - 0.5) * 148;
      const x0 = srcX + perpX * off;
      const y0 = srcY + perpY * off;
      const x1 = detX + perpX * off;
      const y1 = detY + perpY * off;

      profile.push(
        rayIntegral(
          (x0 - BOX.x) / BOX.w,
          (y0 - BOX.y) / BOX.h,
          (x1 - BOX.x) / BOX.w,
          (y1 - BOX.y) / BOX.h
        )
      );

      const lit = Math.abs(f - sweep) < 0.055;
      ctx.strokeStyle = lit ? 'rgba(98,208,255,0.9)' : 'rgba(98,208,255,0.2)';
      ctx.lineWidth = lit ? 1.5 : 1;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    }

    // Detector profile panel: I / I0 = exp(-integral mu ds).
    const px = 24;
    const py = 262;
    const pw = 142;
    const ph = 54;
    ctx.strokeStyle = '#2b313b';
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + pw, py);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = COLORS.warm;
    ctx.lineWidth = 1.4;
    profile.forEach((m, i) => {
      const x = px + (i / (RAYS - 1)) * pw;
      const y = py - Math.exp(-m * 3.4) * ph;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    label(ctx, 'I / I0 = exp( - integral mu ds )', px, py - ph - 16, COLORS.dim, 9);
    label(ctx, 'MEASURED DETECTOR PROFILE', px, py + 14, COLORS.warm, 8.5);

    // Notes column, kept clear of the ray fan.
    label(ctx, 'THREE VIEWS ONLY', 400, 224, COLORS.dim, 9);
    label(ctx, 'AP  /  PA  /  LATERAL', 400, 238, COLORS.muted, 8.5);
    label(ctx, 'physics residual is the', 400, 258, COLORS.muted, 8.5);
    label(ctx, 'regulariser, not extra views', 400, 270, COLORS.muted, 8.5);

    if (readout) {
      readout.innerHTML = `Active view <b>${view}</b>. Three projections fall far short of a well-posed reconstruction, so the Beer-Lambert residual carries the constraint that extra views would otherwise supply.`;
    }
  });
}
