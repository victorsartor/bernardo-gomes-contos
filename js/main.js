/* Ponto de entrada. Carrega os contos, liga os eventos e sobe o site.
 *
 * O `await` no topo do arquivo é o motivo de main.js precisar ser
 * `type="module"` (index.html já está assim) — sem isso o resto do app
 * rodaria antes de storyOrder/stories existirem. */

import { state, storyOrder, loadContent } from './state.js';
import { openReader, goHome, openAdjacent } from './reader.js';
import { initModals, initCookieBanner } from './modals.js';
import { initDrawerParallax } from './drawer.js';
import { applyLanguage } from './lang.js';

await loadContent();

/* bookmark antigo do Escritório (era um modal em #escritorio) — manda
   pro painel de verdade em vez de cair numa hash morta */
if (location.hash === '#escritorio') {
  location.replace('/admin/');
}

/* ---------- Leitura ---------- */

const readBtn = document.getElementById('readBtn');
const readerBack = document.getElementById('readerBack');
const readerPrev = document.getElementById('readerPrev');
const readerNext = document.getElementById('readerNext');

if (readBtn) readBtn.addEventListener('click', () => openReader(state.story));
/* nota: goHome recebe (pushHistory=true) por padrão — não passar o listener
   direto (goHome como callback receberia o Event como 1º argumento) */
if (readerBack) readerBack.addEventListener('click', () => goHome());
if (readerPrev) readerPrev.addEventListener('click', () => openAdjacent(-1));
if (readerNext) readerNext.addEventListener('click', () => openAdjacent(1));

/* ---------- Histórico do navegador ----------
   Sem isso, o botão voltar do Android/Chrome saía do site inteiro em vez
   de voltar pra biblioteca, e um conto nunca tinha URL própria pra
   compartilhar. Ver ANALISE-DESIGN.md B5. */

const STORY_HASH = /^#conto\/(.+)$/;

window.addEventListener('popstate', (event) => {
  const s = event.state;
  if (s && s.view === 'reader' && storyOrder.includes(s.story)) {
    openReader(s.story, false, false);
  } else if (s && s.view === 'home') {
    goHome(false);
  }
  /* state nulo = entrada de histórico que não criamos (ex.: âncora nativa
     tipo #sobre) — deixa o navegador cuidar sozinho, não mexe na view */
});

/* deep link: abrir direto num conto se a URL já apontar pra um (link
   compartilhado) — e marcar a entrada inicial do histórico corretamente
   nos dois casos, pra o popstate acima reconhecer se o usuário voltar até ela */
const deepLinkMatch = location.hash.match(STORY_HASH);
const deepLinkKey = deepLinkMatch && decodeURIComponent(deepLinkMatch[1]);

if (deepLinkKey && storyOrder.includes(deepLinkKey)) {
  openReader(deepLinkKey, false, false);
  history.replaceState({ view: 'reader', story: deepLinkKey }, '', location.hash);
} else {
  /* não mexe na URL (pode ser "#sobre", "#escritorio" etc. — âncoras que
     já funcionam sozinhas), só marca esta entrada como "home" pro popstate */
  history.replaceState({ view: 'home' }, '', location.href);
}

/* ---------- Idioma ---------- */

const langPt = document.getElementById('langPt');
const langEn = document.getElementById('langEn');

if (langPt) langPt.addEventListener('click', () => applyLanguage('pt'));
if (langEn) langEn.addEventListener('click', () => applyLanguage('en'));

/* ---------- Newsletter ---------- */
/* TODO: ainda não envia para lugar nenhum. Ver ANALISE-DESIGN.md, plano item 17. */

const newsletterForm = document.getElementById('newsletterForm');
const newsletterNote = document.getElementById('newsletterNote');

if (newsletterForm) {
  newsletterForm.addEventListener('submit', (event) => {
    event.preventDefault();
    newsletterNote.textContent = state.lang === 'en'
      ? 'Subscription recorded. Connect this form to your email service.'
      : 'Inscrição registrada. Integre este formulário ao seu serviço de e-mail.';
    newsletterForm.reset();
  });
}

/* ---------- Boot ---------- */
/* renderHotspots()/renderDrawerList() rodam dentro de applyLanguage() —
   ela já é chamada mais abaixo e cobre o boot inicial. */

initDrawerParallax();
initModals();
initCookieBanner();

applyLanguage(state.lang);
