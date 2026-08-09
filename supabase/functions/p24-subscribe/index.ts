// Funkcja brzegowa: płatność za plan subskrypcji (Przelewy24).
// Rejestruje transakcję na kwotę planu i zwraca link do płatności.
// Deploy: supabase functions deploy p24-subscribe
//
// Uwaga: pełne płatności CYKLICZNE wymagają dodatkowo obsługi
// rekurencji P24 (zapamiętanie karty / cykliczne obciążenia).
// Ta funkcja obsługuje pierwszą płatność za plan — punkt zaczepienia
// gotowy do rozbudowy o cykl po podłączeniu konta P24.
import { loadP24Config, baseUrl, authHeader, signRegister } from '../_shared/p24.ts';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const { planId, amount, email, returnUrl } = await req.json();
    if (!planId || !amount || !email) return json({ error: 'Brak planId, amount lub email.' }, 400);

    const cfg = loadP24Config();
    const grosze = Math.round(Number(amount) * 100);
    const currency = 'PLN';
    const sessionId = `sub-${planId}-${Date.now()}`;
    const urlStatus = `${Deno.env.get('SUPABASE_URL')}/functions/v1/p24-webhook`;
    const sign = await signRegister(sessionId, cfg.merchantId, grosze, currency, cfg.crc);

    const res = await fetch(`${baseUrl(cfg)}/api/v1/transaction/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: authHeader(cfg) },
      body: JSON.stringify({
        merchantId: cfg.merchantId,
        posId: cfg.posId,
        sessionId,
        amount: grosze,
        currency,
        description: `CoachDeck – plan ${planId}`,
        email,
        country: 'PL',
        language: 'pl',
        urlReturn: returnUrl ?? baseUrl(cfg),
        urlStatus,
        sign,
      }),
    });
    const data = await res.json().catch(() => ({}));
    const token = data?.data?.token;
    if (!res.ok || !token) return json({ error: 'P24 nie zarejestrował subskrypcji.', details: data }, 502);

    return json({ redirectUrl: `${baseUrl(cfg)}/trnRequest/${token}`, sessionId });
  } catch (e) {
    return json({ error: (e as Error).message ?? 'Błąd serwera.' }, 500);
  }
});
