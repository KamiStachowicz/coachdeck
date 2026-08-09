import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY, isBackendConfigured } from './config';
import type { Team, Player, PlayerCore, Payment } from './types';
import { enrichPlayer } from './data';

/**
 * Klient Supabase tworzony tylko, gdy podano klucze.
 * W trybie DEMO pozostaje `null`, a warstwa danych używa danych w pamięci.
 */
export const supabase: SupabaseClient | null = isBackendConfigured()
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

/* ---------- mapowanie wierszy DB (snake_case) <-> model (camelCase) ---------- */

export function rowToTeam(r: any): Team {
  return {
    id: r.id,
    name: r.name,
    sport: r.sport,
    category: r.category,
    season: r.season,
    colorAccent: r.color_accent ?? undefined,
  };
}

export function rowToPlayer(r: any): Player {
  const core: PlayerCore = {
    id: r.id,
    teamId: r.team_id,
    firstName: r.first_name,
    lastName: r.last_name,
    number: r.number ?? undefined,
    position: r.position ?? undefined,
    birthYear: r.birth_year ?? undefined,
    ratings: {
      fitness: r.fitness ?? 60,
      technique: r.technique ?? 60,
      tactics: r.tactics ?? 60,
      mentality: r.mentality ?? 60,
    },
    status: r.status ?? 'available',
  };
  // Pola w stylu FM nie są (jeszcze) trzymane w bazie – wyliczamy je deterministycznie.
  return enrichPlayer(core);
}

export function rowToPayment(r: any): Payment {
  return {
    id: r.id,
    playerId: r.player_id,
    teamId: r.team_id,
    kind: r.kind,
    title: r.title,
    amount: Number(r.amount),
    dueDate: r.due_date,
    paidDate: r.paid_date ?? undefined,
    status: r.status,
  };
}

export function paymentToRow(p: Omit<Payment, 'id'> & { id?: string }) {
  return {
    ...(p.id ? { id: p.id } : {}),
    player_id: p.playerId,
    team_id: p.teamId,
    kind: p.kind,
    title: p.title,
    amount: p.amount,
    due_date: p.dueDate,
    paid_date: p.paidDate ?? null,
    status: p.status,
  };
}

/** Pobiera dane startowe z bazy (zwraca null przy braku backendu lub błędzie). */
export async function fetchInitialData(): Promise<{
  teams: Team[];
  players: Player[];
  payments: Payment[];
} | null> {
  if (!supabase) return null;
  try {
    const [teamsRes, playersRes, paymentsRes] = await Promise.all([
      supabase.from('teams').select('*'),
      supabase.from('players').select('*'),
      supabase.from('payments').select('*'),
    ]);
    if (teamsRes.error || playersRes.error || paymentsRes.error) return null;
    return {
      teams: (teamsRes.data ?? []).map(rowToTeam),
      players: (playersRes.data ?? []).map(rowToPlayer),
      payments: (paymentsRes.data ?? []).map(rowToPayment),
    };
  } catch {
    return null;
  }
}

/** Pobiera aktualną listę płatności (do odświeżenia po powrocie z P24). */
export async function fetchPayments(): Promise<Payment[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('payments').select('*');
  if (error) return null;
  return (data ?? []).map(rowToPayment);
}
