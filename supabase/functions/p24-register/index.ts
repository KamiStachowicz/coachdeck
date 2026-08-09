// Funkcja brzegowa: rejestracja transakcji w Przelewy24.
// Wywoływana z aplikacji (przycisk "Zapłać online").
// Deploy: supabase functions deploy p24-register
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
    const { paymentId, email, returnUrl } = await req.json();
    if (!paymentId || !email) return json({ error: 'Brak paymentId lub email.' }, 400);

    const cfg = loadP24Config();
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Pobierz płatność z bazy.
    const { data: payment, error } = await admin
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();
    if (error || !payment) return json({ error: 'Nie znaleziono płatności.' }, 404);
    if (payment.status === 'paid') return json({ error: 'Płatność już opłacona.' }, 409);

    const amount = Math.round(Number(payment.amount) * 100); // grosze
    const currency = 'PLN';
    const sessionId = `${paymentId}-${Date.now()}`;
    const urlStatus = `${Deno.env.get('SUPABASE_URL')}/functions/v1/p24-webhook`;

    const sign = await signRegister(sessionId, cfg.merchantId, amount, currency, cfg.crc);

    const registerRes = await fetch(`${baseUrl(cfg)}/api/v1/transaction/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: authHeader(cfg) },
      body: JSON.stringify({
        merchantId: cfg.merchantId,
        posId: cfg.posId,
        sessionId,
        amount,
        currency,
        description: payment.title ?? 'Opłata CoachDeck',
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
      payment_id: paymentId,
      session_id: sessionId,
      token,
      amount,
      status: 'pending',
    });

    return json({ redirectUrl: `${baseUrl(cfg)}/trnRequest/${token}`, sessionId });
  } catch (e) {
    return json({ error: (e as Error).message ?? 'Błąd serwera.' }, 500);
  }
});
