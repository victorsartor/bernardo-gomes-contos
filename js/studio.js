/* Escritório: painel do autor para cadastrar, editar e exportar contos.
   Tudo é gravado no localStorage deste navegador — não há servidor. */

import { state, stories, storyOrder, customStore, customCovers, saveStore, isCustom } from './state.js';
import { STUDIO_PASS } from './config.js';
import { renderMonthly } from './home.js';
import { applyLanguage } from './lang.js';

const studioModal = document.getElementById('studioModal');
const studioGate = document.getElementById('studioGate');
const studioPanel = document.getElementById('studioPanel');
const studioForm = document.getElementById('studioForm');
const studioItems = document.getElementById('studioItems');
const studioNote = document.getElementById('studioNote');
const studioPass = document.getElementById('studioPass');
const studioGateNote = document.getElementById('studioGateNote');

const F = id => document.getElementById(id);

let studioUnlocked = false;
let studioEditingKey = null;

function note(msg, isErr) {
  studioNote.textContent = msg;
  studioNote.className = 'studio-note' + (isErr ? ' err' : '');
}

function openStudio(e) {
  if (e) e.preventDefault();
  studioModal.classList.add('show');
  document.body.style.overflow = 'hidden';
  studioGate.hidden = studioUnlocked;
  studioPanel.hidden = !studioUnlocked;
  if (!studioUnlocked) setTimeout(() => studioPass.focus(), 60);
}

function closeStudio() {
  studioModal.classList.remove('show');
  document.body.style.overflow = '';
}

function renderStudioList() {
  studioItems.innerHTML = storyOrder.map(k => {
    const s = stories[k].pt;
    const badge = isCustom(k) ? '<small class="tag-custom">• novo</small>' : '<small>original</small>';
    return `<button type="button" class="studio-item${k === studioEditingKey ? ' active' : ''}" data-k="${k}"><strong>${s.title}</strong>${badge}</button>`;
  }).join('');
  studioItems.querySelectorAll('[data-k]').forEach(b => b.addEventListener('click', () => loadForm(b.dataset.k)));
}

const joinParas = arr => (arr || []).join('\n\n');

const splitParas = t => {
  const parts = t.split(/\n\s*\n/).map(s => s.trim()).filter(Boolean);
  return parts.length ? parts : t.split('\n').map(s => s.trim()).filter(Boolean);
};

function loadForm(key) {
  studioEditingKey = key;
  const pt = stories[key].pt, en = stories[key].en || {};
  F('f_key').value = key; F('f_key').disabled = true;
  F('f_title_pt').value = pt.title || ''; F('f_title_en').value = en.title || '';
  F('f_tags_pt').value = (pt.tags || []).join(', '); F('f_tags_en').value = (en.tags || []).join(', ');
  F('f_time_pt').value = pt.time || ''; F('f_time_en').value = en.time || '';
  F('f_teaser_pt').value = pt.teaser || ''; F('f_teaser_en').value = en.teaser || '';
  F('f_body_pt').value = joinParas(pt.paragraphs); F('f_body_en').value = joinParas(en.paragraphs);
  F('f_cover').value = customCovers[key] || '';
  F('studioDelete').style.display = isCustom(key) ? '' : 'none';
  note('');
  renderStudioList();
}

function clearForm() {
  studioEditingKey = null;
  studioForm.reset();
  F('f_key').disabled = false;
  F('studioDelete').style.display = 'none';
  note('');
  renderStudioList();
}

export function initStudio() {
  const studioLink = document.getElementById('studioLink');
  if (studioLink) studioLink.addEventListener('click', openStudio);
  document.getElementById('studioX').addEventListener('click', closeStudio);
  document.getElementById('studioClose').addEventListener('click', closeStudio);
  studioModal.addEventListener('click', e => { if (e.target === studioModal) closeStudio(); });
  if (location.hash === '#escritorio') openStudio();

  document.getElementById('studioGateForm').addEventListener('submit', e => {
    e.preventDefault();
    if (studioPass.value === STUDIO_PASS) {
      studioUnlocked = true;
      studioGate.hidden = true;
      studioPanel.hidden = false;
      studioGateNote.textContent = '';
      studioPass.value = '';
      renderStudioList();
      clearForm();
    } else {
      studioGateNote.textContent = 'Senha incorreta.';
      studioGateNote.className = 'studio-note err';
    }
  });

  document.getElementById('studioNew').addEventListener('click', () => { clearForm(); F('f_key').focus(); });

  studioForm.addEventListener('submit', e => {
    e.preventDefault();
    const key = (studioEditingKey || F('f_key').value).trim().toLowerCase().replace(/\s+/g, '-');
    if (!key) { note('Informe uma chave (id) para o conto.', true); return; }
    if (!F('f_title_pt').value.trim()) { note('Informe o título em português.', true); return; }

    const tagsPt = F('f_tags_pt').value.split(',').map(s => s.trim()).filter(Boolean);
    const tagsEn = F('f_tags_en').value.split(',').map(s => s.trim()).filter(Boolean);

    const pt = {
      title: F('f_title_pt').value.trim(),
      tags: tagsPt.length ? tagsPt : ['Conto'],
      time: F('f_time_pt').value.trim() || '5 min de leitura',
      author: 'Bernardo Gomes',
      teaser: F('f_teaser_pt').value.trim(),
      paragraphs: splitParas(F('f_body_pt').value)
    };
    const en = {
      title: F('f_title_en').value.trim() || pt.title,
      tags: tagsEn.length ? tagsEn : pt.tags,
      time: F('f_time_en').value.trim() || pt.time,
      author: 'Bernardo Gomes',
      teaser: F('f_teaser_en').value.trim() || pt.teaser,
      paragraphs: F('f_body_en').value.trim() ? splitParas(F('f_body_en').value) : pt.paragraphs
    };
    const cover = F('f_cover').value.trim();

    stories[key] = { pt, en };
    if (cover) customCovers[key] = cover; else delete customCovers[key];
    if (!storyOrder.includes(key)) storyOrder.push(key);

    customStore[key] = { data: stories[key], cover: cover || '' };
    saveStore();

    studioEditingKey = key;
    F('f_key').disabled = true;
    renderMonthly();
    applyLanguage(state.lang);  // atualiza preview, ficha e contos do mês
    renderStudioList();
    note('Conto salvo neste navegador. Use "Exportar" para publicar no site.');
  });

  document.getElementById('studioDelete').addEventListener('click', () => {
    const key = studioEditingKey;
    if (!key || !isCustom(key)) return;
    delete stories[key]; delete customCovers[key]; delete customStore[key];
    const i = storyOrder.indexOf(key); if (i >= 0) storyOrder.splice(i, 1);
    saveStore();
    if (state.story === key) state.story = storyOrder[0];
    clearForm();
    renderMonthly();
    applyLanguage(state.lang);
    note('Conto excluído.');
  });

  document.getElementById('studioExport').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(customStore, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'contos-bernardo.json';
    a.click();
    URL.revokeObjectURL(a.href);
    note('Arquivo exportado: contos-bernardo.json');
  });

  document.getElementById('studioImport').addEventListener('change', ev => {
    const file = ev.target.files[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const data = JSON.parse(r.result);
        Object.entries(data).forEach(([k, v]) => {
          if (!v || !v.data) return;
          stories[k] = v.data;
          if (v.cover) customCovers[k] = v.cover;
          if (!storyOrder.includes(k)) storyOrder.push(k);
          customStore[k] = v;
        });
        saveStore();
        renderMonthly();
        applyLanguage(state.lang);
        renderStudioList();
        note('Contos importados com sucesso.');
      } catch (err) {
        note('Arquivo inválido. Use um JSON exportado aqui.', true);
      }
      ev.target.value = '';
    };
    r.readAsText(file);
  });
}
