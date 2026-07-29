/* Troca de idioma: reescreve toda a interface em PT ou EN. */

import { state } from './state.js';
import { ui, aboutContent, privacyContent } from './data/i18n.js';
import { ICON } from './data/icons.js';
import { selectStory, renderMonthly, renderHotspots, renderDrawerList } from './home.js';
import { openReader, isReading } from './reader.js';
import { renderAllStories } from './modals.js';

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

export function applyLanguage(lang) {
  state.lang = lang;
  localStorage.setItem('bg_site_lang', lang);

  /* leitores de tela precisam disso pra pronunciar o texto em EN
     corretamente (antes ficava travado em "pt-BR" o tempo todo) */
  document.documentElement.lang = lang === 'en' ? 'en' : 'pt-BR';

  document.getElementById('langPt').classList.toggle('active', lang === 'pt');
  document.getElementById('langEn').classList.toggle('active', lang === 'en');

  const u = ui[lang];

  setText('heroTitle', u.heroTitle);
  setText('heroSubtitle', u.heroSubtitle);
  setText('previewEyebrow', u.featured);
  setText('monthlyTitle', u.monthlyTitle);
  setText('seeAllLink', u.seeAll);
  setText('allKicker', u.allKicker);
  setText('allTitle', u.allTitle);
  renderAllStories();

  /* Sobre o autor */
  const ac = aboutContent[lang];
  setText('aboutKicker', ac.kicker);
  setText('aboutTitle', ac.title);
  const aboutBodyEl = document.getElementById('aboutBody');
  if (aboutBodyEl) aboutBodyEl.innerHTML = ac.html;

  setText('newsletterTitle', u.newsletterTitle);
  setText('newsletterText', u.newsletterText);
  setText('newsletterBtn', u.newsletterBtn);
  setText('cookieTitle', u.cookieTitle);
  setText('cookieText', u.cookieText);
  setText('cookieReject', u.cookieClose);
  setText('cookieAccept', u.cookieAccept);

  const readerBackEl = document.getElementById('readerBack');
  const readerPrev = document.getElementById('readerPrev');
  const readerNext = document.getElementById('readerNext');
  const readBtn = document.getElementById('readBtn');

  if (readerBackEl) readerBackEl.innerHTML = `${ICON.arrowLeft}<span>${u.readerBack}</span>`;
  if (readerPrev) readerPrev.innerHTML = `${ICON.arrowLeft}<span>${u.readerPrev}</span>`;
  if (readerNext) readerNext.innerHTML = `<span>${u.readerNext}</span>${ICON.arrowRight}`;
  if (readBtn) readBtn.innerHTML = `${u.read} ${ICON.arrowRight}`;

  /* mantém o modal de privacidade no idioma atual */
  const pc = privacyContent[lang];
  const pBody = document.getElementById('privacyBody');
  if (pBody) pBody.innerHTML = pc.html;
  setText('privacyKicker', pc.kicker);
  setText('privacyClose', pc.close);

  const emailInput = document.getElementById('newsletterEmail');
  if (emailInput) emailInput.placeholder = lang === 'en' ? 'youremail@example.com' : 'seuemail@exemplo.com';

  renderHotspots();
  renderDrawerList();
  renderMonthly();
  selectStory(state.story);

  /* re-render por troca de idioma: mesma página, não é navegação nova */
  if (isReading()) openReader(state.story, false, false);
}
