/* Estado da aplicação: contos, idioma e conto atual.
 *
 * Os contos vêm de `content/contos.json` — é esse arquivo que o Escritório
 * (/admin, Sveltia CMS) edita e publica via commit no Git. Antes disso, os
 * contos viviam hardcoded em js/data/stories.js e as edições do autor só
 * existiam em localStorage do navegador dele (nunca chegavam ao site de
 * verdade). Ver ANALISE-DESIGN.md, seção 5, e README.md.
 */

const CONTENT_URL = 'content/contos.json';

/** Chaves dos 7 contos originais — usado só para achados do relatório que
 *  ainda mencionam "os 7 slots da gaveta" (ver js/data/drawer-layout.js). */
export const BUILTIN_KEYS = ['ultimo', 'espelho', 'menina', 'jardim', 'reis', 'samurai', 'joe'];

/** Ordem de exibição dos contos. Populado por loadContent(). */
export const storyOrder = [];

/** Contos disponíveis, por chave. Populado por loadContent(). */
export const stories = {};

/** Quais contos aparecem em "Contos do mês". Populado por loadContent(). */
export const monthlyPicks = [];

/** Estado mutável de navegação. */
export const state = {
  lang: localStorage.getItem('bg_site_lang') || 'pt',
  story: 'ultimo',
};

/**
 * Busca content/contos.json e preenche storyOrder/stories/monthlyPicks.
 * Precisa terminar ANTES do resto do app rodar — main.js faz
 * `await loadContent()` como primeira coisa no boot.
 *
 * No arquivo, `stories` é uma LISTA (é isso que deixa o Escritório
 * reordenar contos arrastando, e marcar "destaque do mês" com um campo
 * `featured` em vez de manter uma segunda lista solta pra manter em dia).
 * Aqui dentro ela vira o mesmo par storyOrder[] + stories{} de sempre, pra
 * não mexer no resto do app (home.js, reader.js, lang.js).
 */
export async function loadContent() {
  const res = await fetch(CONTENT_URL);
  if (!res.ok) throw new Error('Não consegui carregar ' + CONTENT_URL + ' (HTTP ' + res.status + ')');
  const data = await res.json();

  data.stories.forEach(entry => {
    storyOrder.push(entry.key);
    stories[entry.key] = { pt: entry.pt, en: entry.en, cover: entry.cover };
    if (entry.featured) monthlyPicks.push(entry.key);
  });

  if (!storyOrder.includes(state.story)) state.story = storyOrder[0];
}

/** true se o conto não está entre os 7 originais (tem slot físico na gaveta). */
export const isCustom = (key) => !BUILTIN_KEYS.includes(key);

/** Conto no idioma atual, com fallback para português. */
export const tStory = (key) => stories[key][state.lang] || stories[key].pt;

/** URL da capa cadastrada pelo autor para este conto, se houver. */
export const customCover = (key) => stories[key] && stories[key].cover ? stories[key].cover : null;
