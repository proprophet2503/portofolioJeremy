/**
 * Page bootstrap: nav highlighting, mobile menu, the grouped further-projects
 * list, and the footer year.
 */
import { AREAS, REPOS } from './data/repos.js';

const GITHUB_USER = 'proprophet2503';

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/**
 * @param {string} value
 * @returns {string}
 */
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch]);
}

/* ---------- Nav current-section highlighting ---------- */
function initNavSpy() {
  if (!('IntersectionObserver' in window)) return;
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

/* ---------- Mobile menu: close after picking a section ---------- */
function initMobileNav() {
  const toggle = document.getElementById('nav-toggle');
  if (!toggle) return;
  document.querySelectorAll('.nav-links a').forEach((link) =>
    link.addEventListener('click', () => {
      toggle.checked = false;
    })
  );
}

/* ---------- Further projects, grouped by area ---------- */
/**
 * @param {{ name: string, repo?: string, status?: string, blurb: string, tags: string[] }} item
 * @returns {string}
 */
function projectItem(item) {
  const link = item.repo
    ? ` <a href="https://github.com/${GITHUB_USER}/${encodeURIComponent(item.repo)}" target="_blank" rel="noopener noreferrer">[code]</a>`
    : '';
  const status = !item.repo && item.status ? ` <em class="tags">(${escapeHtml(item.status)})</em>` : '';
  return `
    <div class="mini">
      <h4>${escapeHtml(item.name)}${link}${status}</h4>
      <p>${escapeHtml(item.blurb)}</p>
      <p class="tags"><b>Tags:</b> ${item.tags.map(escapeHtml).join(', ')}</p>
    </div>`;
}

function renderFurtherProjects() {
  const host = document.getElementById('repo-grid');
  if (!host) return;

  host.innerHTML = AREAS.map((area) => {
    const items = REPOS.filter((item) => item.area === area);
    if (!items.length) return '';
    return `
    <div class="area">
      <h3 class="area-title">${escapeHtml(area)}</h3>
      <div class="mini-list">${items.map(projectItem).join('')}</div>
    </div>`;
  }).join('');
}

/* ---------- Footer year ---------- */
function initYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = String(new Date().getFullYear());
}

initNavSpy();
initMobileNav();
renderFurtherProjects();
initYear();
