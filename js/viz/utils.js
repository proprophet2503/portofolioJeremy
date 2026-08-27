/**
 * Shared helpers for the project visualizations.
 * All figures are schematic: they illustrate the method, not measured results.
 */

export const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const COLORS = {
  accent: '#62d0ff',
  accentSoft: 'rgba(98, 208, 255, 0.35)',
  warm: '#f5b544',
  warmSoft: 'rgba(245, 181, 68, 0.35)',
  pink: '#ff7ab6',
  muted: '#6f7a8a',
  dim: '#a2acbb',
  grid: 'rgba(255, 255, 255, 0.06)',
  bg: '#06070a',
};

/**
 * Creates a device-pixel-ratio aware canvas inside `host`.
 * Returns the 2D context plus logical width/height in CSS pixels.
 */
export function createCanvas(host, width, height) {
  const canvas = document.createElement('canvas');
  canvas.style.width = '100%';
  canvas.style.aspectRatio = `${width} / ${height}`;
  canvas.setAttribute('role', 'img');
  host.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener('resize', resize);

  return { canvas, ctx, width, height };
}

/**
 * Runs `frame(t)` on rAF only while `host` is on screen.
 * Honours reduced-motion by rendering a single static frame.
 */
export function animate(host, frame) {
  if (REDUCED_MOTION) {
    frame(0);
    return () => {};
  }

  let raf = null;
  let start = null;
  let running = false;

  const tick = (now) => {
    if (start === null) start = now;
    frame((now - start) / 1000);
    raf = requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && !running) {
        running = true;
        raf = requestAnimationFrame(tick);
      } else if (!entry.isIntersecting && running) {
        running = false;
        cancelAnimationFrame(raf);
      }
    },
    { threshold: 0.12 }
  );
  observer.observe(host);

  return () => {
    observer.disconnect();
    cancelAnimationFrame(raf);
  };
}

/** Deterministic pseudo-random generator so figures look identical on every load. */
export function seeded(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Box-Muller transform driven by a seeded uniform source. */
export function gaussian(rand) {
  const u = Math.max(rand(), 1e-9);
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/** Wires a group of toggle buttons and reports the selected value. */
export function bindToggle(container, onChange) {
  const buttons = Array.from(container.querySelectorAll('.viz-btn'));
  const select = (value) => {
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.value === value)));
    onChange(value);
  };
  buttons.forEach((b) => b.addEventListener('click', () => select(b.dataset.value)));
  const initial = buttons.find((b) => b.getAttribute('aria-pressed') === 'true') || buttons[0];
  if (initial) select(initial.dataset.value);
  return select;
}

/** Draws a light background grid used by most of the canvas figures. */
export function drawGrid(ctx, w, h, step = 32) {
  ctx.save();
  ctx.strokeStyle = COLORS.grid;
  ctx.lineWidth = 1;
  for (let x = step; x < w; x += step) {
    ctx.beginPath();
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, h);
    ctx.stroke();
  }
  for (let y = step; y < h; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(w, y + 0.5);
    ctx.stroke();
  }
  ctx.restore();
}

export function label(ctx, text, x, y, color = COLORS.muted, size = 9) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = `${size}px "JetBrains Mono", ui-monospace, monospace`;
  ctx.fillText(text, x, y);
  ctx.restore();
}

/** Rounded rectangle path with a fallback for engines without ctx.roundRect. */
export function roundRect(ctx, x, y, w, h, r) {
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    return;
  }
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}
