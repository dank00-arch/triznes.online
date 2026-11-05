function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const expected = Deno.env.get('TELEGRAM_WEBHOOK_SECRET');
  if (!expected) return json({ error: 'webhook_secret_not_configured' }, 503);

  const supplied = req.headers.get('x-telegram-bot-api-secret-token');
  if (!supplied || supplied !== expected) return json({ error: 'unauthorized' }, 401);

  const update = await req.json().catch(() => null);
  if (!update || typeof update !== 'object') return json({ error: 'invalid_update' }, 400);

  // Bootstrap only: this endpoint verifies Telegram and accepts the update.
  // Existing onboarding handlers must be ported/reconciled from the current bot
  // before production routing is enabled.
  return json({ ok: true, accepted: true });
});
