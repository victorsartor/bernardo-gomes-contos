/* Diálogos: privacidade, biblioteca ("Todos os contos") e aviso de cookies. */

import { storyOrder, tStory } from './state.js';
import { ICON, storyIcons, storyIconDefault } from './data/icons.js';
import { openReader } from './reader.js';

/* ---------- Privacidade ---------- */

const privacyModal = document.getElementById('privacyModal');

export function openPrivacy(e) {
  if (e) e.preventDefault();
  privacyModal.classList.add('show');
  document.body.style.overflow = 'hidden';
}

export function closePrivacy() {
  privacyModal.classList.remove('show');
  document.body.style.overflow = '';
}

/* ---------- Biblioteca ---------- */

const allModal = document.getElementById('allModal');
const allGrid = document.getElementById('allGrid');

export function renderAllStories() {
  if (!allGrid) return;
  allGrid.innerHTML = storyOrder.map(key => {
    const s = tStory(key);
    return `
      <button type="button" class="lib-item" data-all="${key}" aria-label="${s.title}">
        <span class="lib-ico">${storyIcons[key] || storyIconDefault}</span>
        <span class="lib-info">
          <h3>${s.title}</h3>
          <span class="lib-tags">${s.tags.join(' · ')} · ${s.time}</span>
          <span class="lib-teaser">${s.teaser}</span>
        </span>
        <span class="lib-arrow">${ICON.arrowRight}</span>
      </button>`;
  }).join('');

  allGrid.querySelectorAll('[data-all]').forEach(card => {
    card.addEventListener('click', () => {
      closeAll();
      openReader(card.dataset.all);
    });
  });
}

export function openAll(e) {
  if (e) e.preventDefault();
  renderAllStories();
  allModal.classList.add('show');
  document.body.style.overflow = 'hidden';
}

export function closeAll() {
  allModal.classList.remove('show');
  document.body.style.overflow = '';
}

/* ---------- Ligação de eventos ---------- */

export function initModals() {
  const privacyLink = document.getElementById('privacyLink');
  const privacyClose = document.getElementById('privacyClose');
  const privacyX = document.getElementById('privacyX');

  if (privacyLink) privacyLink.addEventListener('click', openPrivacy);
  if (privacyClose) privacyClose.addEventListener('click', closePrivacy);
  if (privacyX) privacyX.addEventListener('click', closePrivacy);
  if (privacyModal) privacyModal.addEventListener('click', (e) => {
    if (e.target === privacyModal) closePrivacy();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && privacyModal.classList.contains('show')) closePrivacy();
  });

  const seeAllLink = document.getElementById('seeAllLink');
  if (seeAllLink) seeAllLink.addEventListener('click', openAll);
  document.getElementById('allX').addEventListener('click', closeAll);
  document.getElementById('allClose').addEventListener('click', closeAll);
  allModal.addEventListener('click', e => { if (e.target === allModal) closeAll(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && allModal.classList.contains('show')) closeAll();
  });
}

export function initCookieBanner() {
  const cookieBanner = document.getElementById('cookieBanner');
  const cookieAccept = document.getElementById('cookieAccept');
  const cookieReject = document.getElementById('cookieReject');

  if (cookieBanner && !localStorage.getItem('bg_cookie_choice')) {
    cookieBanner.classList.add('show');
  }

  if (cookieAccept) {
    cookieAccept.addEventListener('click', () => {
      localStorage.setItem('bg_cookie_choice', 'accepted');
      cookieBanner.classList.remove('show');
    });
  }

  if (cookieReject) {
    cookieReject.addEventListener('click', () => {
      localStorage.setItem('bg_cookie_choice', 'closed');
      cookieBanner.classList.remove('show');
    });
  }
}
