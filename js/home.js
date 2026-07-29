/* Home: fichas da gaveta (desktop/mouse), lista tocável (mobile) e
 * "Contos do mês". As fichas e a lista são geradas a partir dos dados —
 * nunca hardcoded — para que um conto editado ou criado no Escritório
 * apareça em todo lugar sem precisar editar HTML. Ver ANALISE-DESIGN.md B3.
 */

import { state, storyOrder, monthlyPicks, BUILTIN_KEYS, tStory } from './state.js';
import { ICON, storyIcons, storyIconDefault } from './data/icons.js';
import { DRAWER_SLOTS } from './data/drawer-layout.js';
import { openReader } from './reader.js';

const hotspotLayer = document.getElementById('hotspotLayer');
const drawerListEl = document.getElementById('drawerList');
const realDrawer = document.querySelector('.real-drawer');
const previewTitle = document.getElementById('previewTitle');
const previewText = document.getElementById('previewText');
const previewMeta = document.getElementById('previewMeta');
const fichaPaper = document.getElementById('fichaPaper');
const fichaTitle = document.getElementById('fichaTitle');
const monthlyGrid = document.getElementById('monthlyGrid');

/** Posiciona a ficha de papel sobre o slot escolhido e redispara a animação.
 *  Não faz nada se o conto atual não tiver slot físico na gaveta (além do 7º). */
export function liftFicha(key) {
  if (!fichaPaper) return;
  const active = hotspotLayer && hotspotLayer.querySelector('.hotspot[data-story="' + key + '"]');
  if (!active) return;

  fichaPaper.style.top = active.offsetTop + 'px';
  if (fichaTitle) fichaTitle.textContent = tStory(key).title;

  fichaPaper.classList.remove('rise');
  void fichaPaper.offsetWidth; // força reflow para a animação rodar de novo
  fichaPaper.classList.add('rise');
}

export function selectStory(key) {
  state.story = key;
  const s = tStory(key);

  if (hotspotLayer) {
    hotspotLayer.querySelectorAll('.hotspot').forEach(h =>
      h.classList.toggle('active', h.dataset.story === key));
  }
  if (drawerListEl) {
    drawerListEl.querySelectorAll('.drawer-list-item').forEach(item =>
      item.classList.toggle('active', item.dataset.story === key));
  }

  previewTitle.textContent = s.title;
  previewText.textContent = s.teaser;
  previewMeta.innerHTML = s.tags.map(tag => `<span class="pill">${tag}</span>`).join('');

  liftFicha(key);

  if (realDrawer) {
    realDrawer.classList.add('drawer-touch');
    clearTimeout(realDrawer._touchTimer);
    realDrawer._touchTimer = setTimeout(() => realDrawer.classList.remove('drawer-touch'), 260);
  }
}

/** Fichas desenhadas sobre a foto da gaveta — só os contos que ocupam um
 *  dos 7 slots físicos da imagem entram aqui. Refeito a cada troca de
 *  idioma (os títulos/tags mudam) e sempre que a lista de contos muda. */
export function renderHotspots() {
  if (!hotspotLayer) return;

  hotspotLayer.innerHTML = DRAWER_SLOTS
    .filter(slot => storyOrder.includes(slot.key))
    .map(slot => {
      const s = tStory(slot.key);
      return `
        <button type="button" class="hotspot" data-story="${slot.key}" style="--row-top:${slot.rowTop}%"
                aria-label="${s.title} — ${s.tags.join(', ')}">
          <span class="hotspot-title">${s.title}</span>
          <span class="hotspot-tags">${s.tags.join(' · ')}</span>
        </button>`;
    }).join('');

  hotspotLayer.querySelectorAll('.hotspot').forEach(h => {
    h.classList.toggle('active', h.dataset.story === state.story);
    h.addEventListener('mouseenter', () => selectStory(h.dataset.story));
    h.addEventListener('focus', () => selectStory(h.dataset.story));
    h.addEventListener('click', () => openReader(h.dataset.story));
  });
}

/** Lista tocável abaixo da gaveta (visível só ≤820px via CSS). Mostra
 *  TODOS os contos, sem o limite de 7 fichas da foto — é a navegação
 *  primária no mobile, ver ANALISE-DESIGN.md B1/B2/B3. */
export function renderDrawerList() {
  if (!drawerListEl) return;

  drawerListEl.innerHTML = storyOrder.map((key, i) => {
    const s = tStory(key);
    return `
      <button type="button" class="drawer-list-item${key === state.story ? ' active' : ''}" data-story="${key}"
              aria-label="Ler: ${s.title} — ${s.tags.join(', ')}">
        <span class="drawer-list-index" aria-hidden="true">${i + 1}</span>
        <span class="drawer-list-info">
          <span class="drawer-list-title">${s.title}</span>
          <span class="drawer-list-tags">${s.tags.join(' · ')} · ${s.time}</span>
        </span>
        <span class="drawer-list-arrow" aria-hidden="true">${ICON.arrowRight}</span>
      </button>`;
  }).join('');

  drawerListEl.querySelectorAll('.drawer-list-item').forEach(item => {
    item.addEventListener('click', () => openReader(item.dataset.story));
  });
}

/** Grade "Contos do mês": os escolhidos no Escritório + tudo que o autor cadastrou depois. */
export function renderMonthly() {
  if (!monthlyGrid) return;
  const customKeys = storyOrder.filter(k => !BUILTIN_KEYS.includes(k));
  const keys = [...monthlyPicks, ...customKeys.filter(k => !monthlyPicks.includes(k))];

  monthlyGrid.innerHTML = keys.map(key => {
    const s = tStory(key);
    return `
      <article class="feature-card" data-card="${key}">
        <div class="iconbox">${storyIcons[key] || storyIconDefault}</div>
        <div>
          <h3>${s.title}</h3>
          <small>${s.tags.join(' · ')}</small>
          <p>${s.teaser}</p>
        </div>
        <div class="arrow">${ICON.arrowRight}</div>
      </article>`;
  }).join('');

  monthlyGrid.querySelectorAll('[data-card]').forEach(card => {
    card.addEventListener('mouseenter', () => selectStory(card.dataset.card));
    card.addEventListener('click', () => openReader(card.dataset.card));
  });
}
