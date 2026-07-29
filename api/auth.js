/* Início do login do Escritório. O Sveltia CMS abre isto numa popup;
 * daqui a gente manda o navegador pra tela de autorização do GitHub.
 *
 * Só funciona com OAUTH_CLIENT_ID configurado nas env vars do projeto no
 * Vercel — vem de um GitHub OAuth App que só você pode criar (ver
 * README.md). Sem isso, ninguém consegue entrar no /admin — é o
 * comportamento esperado, não um bug.
 */
module.exports = (req, res) => {
  const clientId = process.env.OAUTH_CLIENT_ID;
  if (!clientId) {
    res.status(500).send('OAUTH_CLIENT_ID não configurado nas variáveis de ambiente do Vercel. Ver README.md.');
    return;
  }

  const state = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  const redirectUri = `https://${req.headers.host}/api/callback`;

  const authorizeUrl = new URL('https://github.com/login/oauth/authorize');
  authorizeUrl.searchParams.set('client_id', clientId);
  authorizeUrl.searchParams.set('redirect_uri', redirectUri);
  authorizeUrl.searchParams.set('scope', 'repo,user');
  authorizeUrl.searchParams.set('state', state);

  /* cookie de curta duração só pra conferir, no callback, que a resposta
     do GitHub corresponde a um login que a gente mesmo iniciou (CSRF) */
  res.setHeader('Set-Cookie', `oauth_state=${state}; HttpOnly; Path=/; Max-Age=600; SameSite=Lax`);
  res.writeHead(302, { Location: authorizeUrl.toString() });
  res.end();
};
