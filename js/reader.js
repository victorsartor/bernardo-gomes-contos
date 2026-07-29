/* View de leitura: abrir um conto, voltar para a home, navegar entre contos. */

import { state, storyOrder, customCovers, tStory } from './state.js';
import { defaultCovers } from './data/covers.js';

const appShell = document.getElementById('appShell');
const readerTitle = document.getElementById('readerTitle');
const readerTags = document.getElementById('readerTags');
const readerAuthor = document.getElementById('readerAuthor');
const readerTime = document.getElementById('readerTime');
const readerText = document.getElementById('readerText');
const storyHero = document.getElementById('storyHero');

/** Fundo do herói: capa do autor se existir, senão a imagem padrão do conto. */
export function storyBg(key) {
  if (customCovers[key]) {
    return `linear-gradient(90deg, rgba(40,28,22,.66), rgba(120,95,72,.28), rgba(244,235,220,.82)), url("${customCovers[key]}")`;
  }
  return defaultCovers[key];
}

/**
 * Abre um conto. `pushHistory` controla se isso vira uma entrada nova no
 * histórico do navegador — precisa ser `false` quando a chamada é uma
 * RE-renderização (troca de idioma) ou uma resposta a um evento
 * `popstate` (senão o botão voltar do Android entra num loop com ele
 * mesmo). Toda navegação iniciada pelo usuário (clicar numa ficha, no
 * botão "Ler conto", em conto anterior/próximo) deixa no padrão `true`.
 * Ver ANALISE-DESIGN.md B5.
 */
export function openReader(key, shouldScroll = true, pushHistory = true) {
  state.story = key;
  const s = tStory(key);

  readerTitle.textContent = s.title;
  readerAuthor.textContent = s.author;
  readerTime.textContent = s.time;
  readerTags.innerHTML = s.tags.map(tag => `<span class="reader-tag">${tag}</span>`).join('');
  readerText.innerHTML = s.paragraphs.map(p => `<p>${p}</p>`).join('');
  storyHero.style.setProperty('--story-bg', storyBg(key));

  appShell.classList.add('is-reading');
  if (pushHistory) {
    history.pushState({ view: 'reader', story: key }, '', '#conto/' + key);
  }
  if (shouldScroll) window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function goHome(pushHistory = true) {
  appShell.classList.remove('is-reading');
  if (pushHistory) {
    history.pushState({ view: 'home' }, '', location.pathname + location.search);
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function openAdjacent(direction) {
  const i = storyOrder.indexOf(state.story);
  const nextIndex = (i + direction + storyOrder.length) % storyOrder.length;
  openReader(storyOrder[nextIndex]);
}

export const isReading = () => appShell.classList.contains('is-reading');
