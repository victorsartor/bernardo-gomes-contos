/* Volta do GitHub depois do login. Troca o `code` por um token de acesso
 * e devolve esse token pro Sveltia CMS através de postMessage — é assim
 * que o protocolo de OAuth em popup do Decap/Sveltia CMS funciona (a
 * janela de login nunca navega a aba principal, só troca uma mensagem
 * com ela e se fecha).
 */
module.exports = async (req, res) => {
  const { code, state } = req.query;
  const cookieHeader = req.headers.cookie || '';
  const savedState = (cookieHeader.match(/oauth_state=([^;]+)/) || [])[1];

  if (!code || !state || state !== savedState) {
    res.status(400).send(renderResult({ error: 'Login expirado ou inválido — feche esta janela e tente entrar de novo.' }));
    return;
  }

  const clientId = process.env.OAUTH_CLIENT_ID;
  const clientSecret = process.env.OAUTH_CLIENT_SECRET;

  let tokenData;
  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    });
    tokenData = await tokenRes.json();
  } catch (err) {
    res.status(502).send(renderResult({ error: 'Não consegui falar com o GitHub. Tente de novo em instantes.' }));
    return;
  }

  if (tokenData.error || !tokenData.access_token) {
    res.status(400).send(renderResult({ error: tokenData.error_description || 'O GitHub recusou o login.' }));
    return;
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(renderResult({ token: tokenData.access_token }));
};

/** Página mínima que fecha o handshake de postMessage com quem abriu a popup. */
function renderResult({ token, error }) {
  const payload = error
    ? `authorization:github:error:${JSON.stringify({ error })}`
    : `authorization:github:success:${JSON.stringify({ token, provider: 'github' })}`;

  return `<!doctype html>
<html><body>
<script>
(function () {
  function receiveMessage(message) {
    window.opener.postMessage(${JSON.stringify(payload)}, message.origin);
    window.removeEventListener('message', receiveMessage, false);
  }
  window.addEventListener('message', receiveMessage, false);
  window.opener.postMessage('authorizing:github', '*');
})();
</script>
</body></html>`;
}
