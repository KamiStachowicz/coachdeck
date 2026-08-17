// Funkcja brzegowa: uniwersalna płatność jednorazowa w Przelewy24.
// Dla dowolnego miejsca w aplikacji (obóz, wpisowe, rezerwacja treningu),
// bez wiersza w tabeli `payments` – kwotę i opis przekazuje aplikacja.
// Deploy: supabase functions deploy p24-checkout
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
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
    const { amount, description, email, reference, returnUrl } = await req.json();
    const zl = Number(amount);
    if (!email || !Number.isFinite(zl) || zl <= 0) {
      return json({ error: 'Brak poprawnej kwoty lub adresu e-mail.' }, 400);
    }

    const cfg = loadP24Config();
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const grosze = Math.round(zl * 100);
    const currency = 'PLN';
    const sessionId = `chk-${reference ?? 'item'}-${Date.now()}`;
    const urlStatus = `${Deno.env.get('SUPABASE_URL')}/functions/v1/p24-webhook`;

    const sign = await signRegister(sessionId, cfg.merchantId, grosze, currency, cfg.crc);

    const registerRes = await fetch(`${baseUrl(cfg)}/api/v1/transaction/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: authHeader(cfg) },
      body: JSON.stringify({
        merchantId: cfg.merchantId,
        posId: cfg.posId,
        sessionId,
        amount: grosze,
        currency,
        description: (description as string) ?? 'Opłata CoachDeck',
        email,
        country: 'PL',
        language: 'pl',
        urlReturn: returnUrl ?? `${baseUrl(cfg)}`,
        urlStatus,
        sign,
      }),
    });

    const regData = await registerRes.json().catch(() => ({}));
    const token = regData?.data?.token;
    if (!registerRes.ok || !token) {
      return json({ error: 'P24 nie zarejestrował transakcji.', details: regData }, 502);
    }

    // Zapisz mapowanie transakcji (do weryfikacji w webhooku).
    await admin.from('p24_transactions').insert({
      payment_id: null,
      session_id: sessionId,
      token,
      amount: grosze,
      status: 'pending',
    });

    return json({ redirectUrl: `${baseUrl(cfg)}/trnRequest/${token}`, sessionId });
  } catch (e) {
    return json({ error: (e as Error).message ?? 'Błąd serwera.' }, 500);
  }
});
