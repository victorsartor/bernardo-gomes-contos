# Site Bernardo Gomes — estrutura

Repositório: [github.com/victorsartor/bernardo-gomes-contos](https://github.com/victorsartor/bernardo-gomes-contos)

Separado a partir do HTML único original (`../bernardo_gomes_site_hover_leitura_corrigido (2) (2).html`).
A separação em si não mudou comportamento (verificado comparando o computed style de
todos os 384 elementos nos três estados — home, leitura, biblioteca). Depois disso, a
Fase 1 do plano de correção (`../ANALISE-DESIGN.md`) foi aplicada: gaveta em AVIF/WebP,
fichas viraram HTML de verdade, parallax corrigido, tipografia de leitura mobile e
navegação com `pushState`. Ver "Status — Fase 1 aplicada" no topo do relatório.

## Como abrir localmente

O JS usa módulos ES, que o browser bloqueia em `file://`. Precisa de um servidor:

    npx serve app          # ou: python -m http.server 8000 -d app

Depois abrir `http://localhost:3000`.

## Onde mexer

| Quero... | Onde |
|---|---|
| adicionar, editar ou reordenar um conto | `/admin` no site publicado (Escritório) — ou editar `content/contos.json` direto |
| trocar quais contos vão em "Contos do mês" | campo "Destacar" de cada conto, em `/admin` |
| mexer em textos de interface, bio ou privacidade | `js/data/i18n.js` |
| trocar a imagem de fundo padrão de um conto | `js/data/covers.js` |
| trocar um ícone | `js/data/icons.js` |
| reposicionar uma ficha na foto da gaveta (se trocar a arte) | `js/data/drawer-layout.js` |

**Sobre o limite de 7 fichas na gaveta:** a foto (`assets/img/gaveta.png`) tem 7 slots
desenhados — é o teto físico da imagem, não do código. Um 8º conto aparece normalmente
em "Contos do mês", na lista mobile e em "Todos os contos"; só não ganha uma ficha
própria na ilustração da gaveta no desktop.

**Cuidado ao editar pelo `/admin`:** dá pra apagar ou renomear a chave (`key`) de um
dos 7 contos originais — nada impede isso tecnicamente, porque agora é conteúdo de
verdade, não um formulário travado. Se isso acontecer sem querer, o histórico do
Git tem a versão anterior (`git log content/contos.json`); é reversível.

## O Escritório agora é `/admin` (Sveltia CMS + login com GitHub)

O antigo modal com senha fixa (`bernardo`) salvando em `localStorage` do navegador
foi removido — ele nunca publicava nada de verdade, só guardava no aparelho de quem
editou (ver `ANALISE-DESIGN.md`, seção 5). No lugar: `/admin` é um painel de verdade
que **escreve direto em `content/contos.json` e commita no GitHub**; o Vercel
redeploya sozinho a cada publicação (leva 1–3 minutos, sem precisar de mim ou de um
desenvolvedor no meio).

Site no ar: **https://bernardo-gomes-contos.vercel.app** (projeto Vercel
`victor-sartors-projects/bernardo-gomes-contos`, já conectado ao repositório —
todo push em `master` reimplanta sozinho).

### Configuração (feita uma única vez, ainda pendente)

Os dois passos abaixo só podem ser feitos por quem tem acesso às contas do
GitHub/Vercel — não dá pra automatizar de fora. Até fazer isso, `/admin` carrega
mas o login falha (é esperado: `/api/auth` responde com a própria mensagem
explicando o que falta).

**1. Criar um GitHub OAuth App**
[github.com/settings/developers](https://github.com/settings/developers) → **OAuth Apps** → **New OAuth App**:

| Campo | Valor |
|---|---|
| Application name | Bernardo Gomes — Escritório (ou o nome que preferir) |
| Homepage URL | `https://bernardo-gomes-contos.vercel.app` |
| Authorization callback URL | `https://bernardo-gomes-contos.vercel.app/api/callback` |

Depois de criar, clique em **Generate a new client secret**. Guarde os dois valores
(**Client ID** e **Client Secret**) — o secret só aparece uma vez.

**2. Colar as duas chaves no Vercel**
Em [vercel.com/victor-sartors-projects/bernardo-gomes-contos/settings/environment-variables](https://vercel.com/victor-sartors-projects/bernardo-gomes-contos/settings/environment-variables),
adicionar:

- `OAUTH_CLIENT_ID` = o Client ID do passo 1
- `OAUTH_CLIENT_SECRET` = o Client Secret do passo 1

Redeploy depois de salvar (env var nova só entra em vigor num deploy novo — um
`git push` qualquer, ou o botão "Redeploy" no painel).

`admin/config.yml` já está apontando pro domínio certo (`base_url` preenchido) —
não precisa mexer nisso.

**3. Criar o acesso do Bernardo — sem ele precisar entender GitHub**

Login só funciona de verdade se a conta tiver permissão de escrita no repositório;
sem isso ele entra no `/admin` mas o "Publicar" falha ao tentar commitar. Para um
cliente não-técnico, a forma mais simples é você (Victor) fazer o cadastro por ele,
não pedir que ele mesmo crie a conta:

1. Em [github.com/signup](https://github.com/signup), criar uma conta usando o
   **e-mail de verdade do Bernardo** (importante: o e-mail dele, não um seu — é
   assim que ele consegue recuperar a senha sozinho no futuro, se precisar).
   Nome de usuário pode ser qualquer coisa, ex.: `bernardogomes-contos`.
2. Me avisar o username criado — eu adiciono ele como colaborador do repositório
   (`gh api repos/victorsartor/bernardo-gomes-contos/collaborators/<username> -X PUT`),
   sem precisar abrir o GitHub na mão.
3. Duas formas de entregar o acesso, dependendo de quanto contato ele vai ter com a
   conta:
   - **Ele nunca precisa saber que é GitHub:** você loga uma vez no aparelho dele
     (celular ou notebook), marca "lembrar por 30 dias"/deixa o navegador salvar a
     sessão, e deixa o link `bernardo-gomes-contos.vercel.app/admin` salvo na tela
     inicial. Ele só toca no ícone e já cai direto no painel.
   - **Ele pode precisar entrar em outro aparelho algum dia:** depois do cadastro,
     clique em "Esqueci minha senha" pra ele definir a própria senha pelo e-mail
     dele — assim ele consegue entrar sozinho de qualquer lugar sem depender de
     você guardar a senha.

### Uso do dia a dia (depois de configurado)

`bernardo-gomes-contos.vercel.app/admin` → entrar com GitHub → editar/adicionar
conto → **Publicar**. Isso vira um commit em `content/contos.json`, o Vercel
redeploya, e em 1–3 minutos está no ar — sem precisar de mim.

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
