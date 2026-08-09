/**
 * Konfiguracja z publicznych zmiennych środowiskowych Expo.
 * Ustaw w pliku `.env` (patrz `.env.example`).
 * Bez tych zmiennych aplikacja działa w trybie DEMO (dane w pamięci),
 * a płatności online są ukryte.
 */

export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

/** Czy backend (Supabase) jest skonfigurowany. */
export const isBackendConfigured = (): boolean =>
  SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;

/** Czy płatności online (Przelewy24) są dostępne — wymagają backendu. */
export const isOnlinePaymentsEnabled = (): boolean => isBackendConfigured();
