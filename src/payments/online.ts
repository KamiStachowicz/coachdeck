import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { SUPABASE_URL, SUPABASE_ANON_KEY, isOnlinePaymentsEnabled } from '@/src/config';
import type { Payment } from '@/src/types';

export interface PaymentResult {
  ok: boolean;
  message?: string;
}

/**
 * Rozpoczyna płatność online przez Przelewy24.
 * 1. Woła funkcję brzegową `p24-register` w Supabase,
 * 2. Otwiera stronę płatności P24,
 * 3. Po powrocie użytkownika status potwierdza webhook P24 (`p24-webhook`),
 *    a aplikacja odświeża listę płatności z bazy.
 *
 * Dopóki nie ustawisz kluczy P24 w sekretach Supabase, funkcja zwróci błąd.
 */
export async function startOnlinePayment(
  payment: Payment,
  email: string,
): Promise<PaymentResult> {
  if (!isOnlinePaymentsEnabled()) {
    return { ok: false, message: 'Płatności online nie są skonfigurowane (brak backendu).' };
  }

  const returnUrl = Linking.createURL('/finances');

  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/p24-register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ paymentId: payment.id, email, returnUrl }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.redirectUrl) {
      return { ok: false, message: data?.error ?? 'Nie udało się rozpocząć płatności.' };
    }

    await WebBrowser.openBrowserAsync(data.redirectUrl as string);
    // Status faktycznie ustala webhook P24; tu tylko wracamy do aplikacji.
    return { ok: true };
  } catch (e: any) {
    return { ok: false, message: e?.message ?? 'Błąd sieci.' };
  }
}

/**
 * Uniwersalna płatność jednorazowa przez Przelewy24 – dla dowolnego miejsca
 * w aplikacji (obóz, wpisowe, rezerwacja treningu itd.), bez wiersza w tabeli
 * `payments`. Kwota i opis idą prosto do funkcji brzegowej `p24-checkout`.
 * Działa po ustawieniu kluczy P24 w sekretach Supabase; do tego czasu demo.
 */
export async function startCheckout(opts: {
  amount: number; // w złotówkach
  description: string;
  email: string;
  returnPath?: string; // np. '/camps', '/registrations'
  reference?: string; // własny identyfikator (id obozu, zgłoszenia…)
}): Promise<PaymentResult> {
  if (!isOnlinePaymentsEnabled()) {
    return { ok: false, message: 'Płatności online nie są jeszcze podłączone.' };
  }
  const returnUrl = Linking.createURL(opts.returnPath ?? '/finances');
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/p24-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        amount: opts.amount,
        description: opts.description,
        email: opts.email,
        reference: opts.reference,
        returnUrl,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.redirectUrl) {
      return { ok: false, message: data?.error ?? 'Nie udało się rozpocząć płatności.' };
    }
    await WebBrowser.openBrowserAsync(data.redirectUrl as string);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, message: e?.message ?? 'Błąd sieci.' };
  }
}

/**
 * Rozpoczyna płatność za plan subskrypcji przez Przelewy24.
 * Hak gotowy do podłączenia — działa po ustawieniu kluczy P24 w Supabase.
 * Do tego czasu wybór planu aktywuje się lokalnie (tryb demo).
 */
export async function startSubscription(
  planId: string,
  amount: number,
  email: string,
): Promise<PaymentResult> {
  if (!isOnlinePaymentsEnabled()) {
    return { ok: false, message: 'Płatności online nie są jeszcze podłączone.' };
  }
  const returnUrl = Linking.createURL('/plans');
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/p24-subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ planId, amount, email, returnUrl }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.redirectUrl) {
      return { ok: false, message: data?.error ?? 'Nie udało się rozpocząć subskrypcji.' };
    }
    await WebBrowser.openBrowserAsync(data.redirectUrl as string);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, message: e?.message ?? 'Błąd sieci.' };
  }
}
