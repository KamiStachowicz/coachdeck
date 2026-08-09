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
