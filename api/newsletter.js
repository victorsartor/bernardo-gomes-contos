/* Inscrição na newsletter. O formulário no site chama isto em vez de
 * mandar o e-mail direto pro Buttondown — assim a chave de API fica só
 * aqui no servidor, nunca exposta no navegador (mesmo padrão de
 * api/auth.js e api/callback.js).
 */
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method-not-allowed' });
    return;
  }

  const email = req.body && typeof req.body.email === 'string' ? req.body.email.trim() : '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: 'invalid-email' });
    return;
  }

  const apiKey = process.env.BUTTONDOWN_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'not-configured' });
    return;
  }

  let bdRes;
  try {
    bdRes = await fetch('https://api.buttondown.email/v1/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${apiKey}`,
      },
      body: JSON.stringify({ email }),
    });
  } catch (err) {
    res.status(502).json({ error: 'network' });
    return;
  }

  if (bdRes.ok) {
    res.status(200).json({ ok: true });
    return;
  }

  const data = await bdRes.json().catch(() => ({}));
  const alreadySubscribed = bdRes.status === 400
    && JSON.stringify(data).toLowerCase().includes('already');

  if (alreadySubscribed) {
    res.status(200).json({ ok: true, alreadySubscribed: true });
    return;
  }

  res.status(502).json({ error: 'buttondown-error' });
};
