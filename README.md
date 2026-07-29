# Site Bernardo Gomes — estrutura

Separado a partir do HTML único original (`../bernardo_gomes_site_hover_leitura_corrigido (2) (2).html`).
A separação em si não mudou comportamento (verificado comparando o computed style de
todos os 384 elementos nos três estados — home, leitura, biblioteca). Depois disso, a
Fase 1 do plano de correção (`../ANALISE-DESIGN.md`) foi aplicada em cima: gaveta em
AVIF/WebP, fichas viraram HTML de verdade, parallax corrigido, tipografia de leitura
mobile e navegação com `pushState`. Ver "Status — Fase 1 aplicada" no topo do relatório
para o antes/depois de cada item.

## Como abrir localmente

O JS usa módulos ES, que o browser bloqueia em `file://`. Precisa de um servidor:

    npx serve app          # ou: python -m http.server 8000 -d app

Depois abrir `http://localhost:3000`. Em produção (Netlify/Vercel) funciona direto.

## Onde mexer

| Quero... | Arquivo |
|---|---|
| adicionar ou editar um conto | `js/data/stories.js` |
| trocar quais contos vão em "Contos do mês" | `js/config.js` |
| mudar a senha do Escritório | `js/config.js` |
| mexer em textos de interface, bio ou privacidade | `js/data/i18n.js` |
| trocar a imagem de fundo de um conto | `js/data/covers.js` |
| trocar um ícone | `js/data/icons.js` |
| reposicionar uma ficha na foto da gaveta (se trocar a arte) | `js/data/drawer-layout.js` |

**Sobre o limite de 7 fichas na gaveta:** a foto (`assets/img/gaveta.png`) tem 7 slots
desenhados — é o teto físico da imagem, não do código. Um 8º conto cadastrado no
Escritório aparece normalmente em "Contos do mês", na lista mobile e em "Todos os
contos"; só não ganha uma ficha própria na ilustração da gaveta no desktop.

## CSS

Os 15 arquivos são carregados **em ordem numérica** e a ordem importa: `09-overrides.css`
contém os quatro blocos de patch sucessivos do original e precisa vir depois de `01`–`08`.
Enquanto esses patches existirem, mudar um arquivo de baixo numeração pode não ter efeito.
Consolidar isso é o item 18 do plano em `../ANALISE-DESIGN.md`.

## Pendências conhecidas

A Fase 1 (motion + mobile, os dois pedidos do briefing original) está feita. O que
ainda falta é Fase 2 (tokens de duração/easing, crossfade do preview, reveal on
scroll, `prefers-reduced-motion` completo) e Fase 3 (acabamento: `backdrop-filter`,
herói de leitura responsivo, consolidar os 122 `!important` do CSS). Lista completa
com prioridade em `../ANALISE-DESIGN.md`, seção 7.
