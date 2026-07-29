/* Estado da aplicação: contos em memória, idioma e conto atual.
   Os contos salvos pelo autor (localStorage) entram por cima dos originais. */

import { storyOrder as builtinOrder, stories as builtinStories } from './data/stories.js';

/** Chaves dos 7 contos que vêm no código. Serve para distinguir do que o autor criou. */
export const BUILTIN_KEYS = [...builtinOrder];

/** Ordem de exibição. Contos novos são empurrados para o fim. */
export const storyOrder = [...builtinOrder];

/** Contos disponíveis, já com as edições do autor aplicadas. */
export const stories = { ...builtinStories };

/** Capas enviadas pelo autor, por chave de conto. */
export const customCovers = {};

/** Estado mutável de navegação. */
export const state = {
  lang: localStorage.getItem('bg_site_lang') || 'pt',
  story: 'ultimo',
};

/** O que o autor salvou neste navegador. */
export let customStore = {};
try {
  customStore = JSON.parse(localStorage.getItem('bg_custom_stories') || '{}');
} catch (e) {
  customStore = {};
}

export function saveStore() {
  localStorage.setItem('bg_custom_stories', JSON.stringify(customStore));
}

/* aplica o que estava salvo */
Object.entries(customStore).forEach(([key, entry]) => {
  if (!entry || !entry.data) return;
  stories[key] = entry.data;
  if (entry.cover) customCovers[key] = entry.cover;
  if (!storyOrder.includes(key)) storyOrder.push(key);
});

/** true se o conto foi criado pelo autor (não vem do código). */
export const isCustom = (key) => !BUILTIN_KEYS.includes(key);

/** Conto no idioma atual, com fallback para português. */
export const tStory = (key) => stories[key][state.lang] || stories[key].pt;
