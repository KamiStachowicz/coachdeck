// Wspólne narzędzia integracji Przelewy24 (REST API v1) dla funkcji brzegowych (Deno).
// Dokumentacja: https://developers.przelewy24.pl/

export interface P24Config {
  merchantId: number;
  posId: number;
  crc: string;
  apiKey: string; // "klucz do raportów" / sekret do REST Basic Auth
  sandbox: boolean;
}

export function loadP24Config(): P24Config {
  const merchantId = Number(Deno.env.get('P24_MERCHANT_ID'));
  const posId = Number(Deno.env.get('P24_POS_ID') || Deno.env.get('P24_MERCHANT_ID'));
  const crc = Deno.env.get('P24_CRC') ?? '';
  const apiKey = Deno.env.get('P24_API_KEY') ?? '';
  const sandbox = (Deno.env.get('P24_SANDBOX') ?? 'true').toLowerCase() !== 'false';
  if (!merchantId || !posId || !crc || !apiKey) {
    throw new Error('Brak konfiguracji P24 (P24_MERCHANT_ID / P24_POS_ID / P24_CRC / P24_API_KEY).');
  }
  return { merchantId, posId, crc, apiKey, sandbox };
}

export function baseUrl(cfg: P24Config): string {
  return cfg.sandbox ? 'https://sandbox.przelewy24.pl' : 'https://secure.przelewy24.pl';
}

/** Nagłówek Basic Auth: posId:apiKey (klucz do raportów). */
export function authHeader(cfg: P24Config): string {
  return 'Basic ' + btoa(`${cfg.posId}:${cfg.apiKey}`);
}

/**
 * Podpis P24 = SHA-384 z kompaktowego JSON-a o ściśle określonej kolejności kluczy.
 * Budujemy string ręcznie, aby zagwarantować kolejność i brak spacji.
 */
async function sha384Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-384', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function jsonNum(n: number): string {
  return String(n);
}
function jsonStr(s: string): string {
  return JSON.stringify(s);
}

/** Podpis do rejestracji transakcji. */
export async function signRegister(
  sessionId: string,
  merchantId: number,
  amount: number,
  currency: string,
  crc: string,
): Promise<string> {
  const s = `{"sessionId":${jsonStr(sessionId)},"merchantId":${jsonNum(merchantId)},"amount":${jsonNum(
    amount,
  )},"currency":${jsonStr(currency)},"crc":${jsonStr(crc)}}`;
  return sha384Hex(s);
}

/** Podpis do weryfikacji transakcji. */
export async function signVerify(
  sessionId: string,
  orderId: number,
  amount: number,
  currency: string,
  crc: string,
): Promise<string> {
  const s = `{"sessionId":${jsonStr(sessionId)},"orderId":${jsonNum(orderId)},"amount":${jsonNum(
    amount,
  )},"currency":${jsonStr(currency)},"crc":${jsonStr(crc)}}`;
  return sha384Hex(s);
}

/** Podpis powiadomienia (webhook) — do zweryfikowania autentyczności notyfikacji. */
export async function signNotification(
  n: {
    merchantId: number;
    posId: number;
    sessionId: string;
    amount: number;
    originAmount: number;
    currency: string;
    orderId: number;
    methodId: number;
    statement: string;
  },
  crc: string,
): Promise<string> {
  const s =
    `{"merchantId":${jsonNum(n.merchantId)},"posId":${jsonNum(n.posId)},"sessionId":${jsonStr(
      n.sessionId,
    )},"amount":${jsonNum(n.amount)},"originAmount":${jsonNum(n.originAmount)},"currency":${jsonStr(
      n.currency,
    )},"orderId":${jsonNum(n.orderId)},"methodId":${jsonNum(n.methodId)},"statement":${jsonStr(
      n.statement,
    )},"crc":${jsonStr(crc)}}`;
  return sha384Hex(s);
}

/** Weryfikacja transakcji w P24 (po otrzymaniu powiadomienia). */
export async function verifyTransaction(
  cfg: P24Config,
  params: { sessionId: string; orderId: number; amount: number; currency: string },
): Promise<boolean> {
  const sign = await signVerify(params.sessionId, params.orderId, params.amount, params.currency, cfg.crc);
  const res = await fetch(`${baseUrl(cfg)}/api/v1/transaction/verify`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: authHeader(cfg) },
    body: JSON.stringify({
      merchantId: cfg.merchantId,
      posId: cfg.posId,
      sessionId: params.sessionId,
      amount: params.amount,
      currency: params.currency,
      orderId: params.orderId,
      sign,
    }),
  });
  if (!res.ok) return false;
  const data = await res.json().catch(() => ({}));
  return data?.data?.status === 'success';
}
