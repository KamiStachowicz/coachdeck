// Funkcja brzegowa: powiadomienie (webhook) z Przelewy24.
// P24 wywołuje ten adres po płatności (pole urlStatus).
// WAŻNY DEPLOY: supabase functions deploy p24-webhook --no-verify-jwt
// (P24 nie wysyła tokenu Supabase, więc weryfikacja JWT musi być wyłączona;
//  autentyczność zapewnia podpis P24 sprawdzany poniżej).
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { loadP24Config, signNotification, verifyTransaction } from '../_shared/p24.ts';

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  try {
    const n = await req.json();
    const cfg = loadP24Config();

    // 1. Zweryfikuj podpis powiadomienia.
    const expected = await signNotification(
      {
        merchantId: Number(n.merchantId),
        posId: Number(n.posId),
        sessionId: String(n.sessionId),
        amount: Number(n.amount),
        originAmount: Number(n.originAmount),
        currency: String(n.currency),
        orderId: Number(n.orderId),
        methodId: Number(n.methodId),
        statement: String(n.statement),
      },
      cfg.crc,
    );
    if (expected !== n.sign) {
      return new Response('Invalid signature', { status: 400 });
    }

    // 2. Potwierdź transakcję w P24 (verify).
    const ok = await verifyTransaction(cfg, {
      sessionId: String(n.sessionId),
      orderId: Number(n.orderId),
      amount: Number(n.amount),
      currency: String(n.currency),
    });
    if (!ok) return new Response('Verification failed', { status: 400 });

    // 3. Zaktualizuj bazę: transakcja + płatność.
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: tx } = await admin
      .from('p24_transactions')
      .update({ status: 'paid', order_id: Number(n.orderId) })
      .eq('session_id', String(n.sessionId))
      .select('payment_id')
      .single();

    if (tx?.payment_id) {
      await admin
        .from('payments')
        .update({ status: 'paid', paid_date: new Date().toISOString() })
        .eq('id', tx.payment_id);
    }

    return new Response('OK', { status: 200 });
  } catch (e) {
    return new Response((e as Error).message ?? 'Error', { status: 500 });
  }
});
