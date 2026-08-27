/**
 * Page bootstrap: scroll reveal, nav highlighting, repository grid, and lazy
 * mounting of each project visualization once it approaches the viewport.
 */
import { REPOS } from './data/repos.js';

const GITHUB_USER = 'proprophet2503';

/* ---------- Scroll reveal ---------- */
function initReveal() {
  const targets = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  );
  targets.forEach((el) => observer.observe(el));
}

/* ---------- Nav current-section highlighting ---------- */
function initNavSpy() {
  const links = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
  const sections = links
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);
  if (!sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) =>
          link.setAttribute('aria-current', String(link.getAttribute('href') === `#${entry.target.id}`))
        );
      });
    },
    { rootMargin: '-45% 0px -50% 0px' }
  );
  sections.forEach((s) => observer.observe(s));
}

/* ---------- Secondary project grid ---------- */
function renderRepos() {
  const grid = document.getElementById('repo-grid');
  if (!grid) return;

  grid.innerHTML = REPOS.map(
    (item) => `
    <a class="repo-card" href="https://github.com/${GITHUB_USER}/${item.repo}" target="_blank" rel="noopener noreferrer">
      <div class="repo-foot"><span class="repo-dot"></span><span>repository</span></div>
      <h3>${item.name}</h3>
      <p>${item.blurb}</p>
      <div class="tech-row">${item.tags.map((t) => `<span class="tech">${t}</span>`).join('')}</div>
    </a>`
  ).join('');
}

/* ---------- Visualizations ---------- */
const VIZ_MODULES = {
  'flow-matching': () => import('./viz/flow-matching.js').then((m) => m.initFlowMatching),
  'modality-fusion': () => import('./viz/modality-fusion.js').then((m) => m.initModalityFusion),
  'beer-lambert': () => import('./viz/beer-lambert.js').then((m) => m.initBeerLambert),
  spiking: () => import('./viz/spiking.js').then((m) => m.initSpiking),
  'cough-lstm': () => import('./viz/cough-lstm.js').then((m) => m.initCoughLstm),
  'eeg-subbands': () => import('./viz/eeg-subbands.js').then((m) => m.initEegSubbands),
};

async function mountViz(stage) {
  const key = stage.dataset.viz;
  const loader = VIZ_MODULES[key];
  if (!loader) return;

  const frame = stage.closest('.viz-frame');
  const controls = frame ? frame.querySelector('.viz-controls') : null;
  const readout = frame ? frame.querySelector('.viz-readout') : null;

  try {
    const init = await loader();
    init(stage, controls, readout);
    stage.dataset.state = 'ready';
  } catch (error) {
    // A failed figure must not take the rest of the page down with it.
    stage.dataset.state = 'error';
    stage.innerHTML =
      '<p class="viz-readout" style="padding:1rem">Figure could not be loaded in this browser.</p>';
    console.error(`Visualization "${key}" failed to mount`, error);
  }
}

function initViz() {
  const stages = Array.from(document.querySelectorAll('[data-viz]'));
  if (!stages.length) return;

  if (!('IntersectionObserver' in window)) {
    stages.forEach(mountViz);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        mountViz(entry.target);
      });
    },
    { rootMargin: '300px 0px' }
  );
  stages.forEach((stage) => observer.observe(stage));
}

/* ---------- Footer year ---------- */
function initYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = String(new Date().getFullYear());
}

initReveal();
initNavSpy();
renderRepos();
initViz();
initYear();
