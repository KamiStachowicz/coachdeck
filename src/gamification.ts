import type { Player } from './types';
import { overallOf } from './data';

export interface Badge {
  id: string;
  label: string;
  icon: string; // Ionicons
  color: string;
}

/** Odznaki zawodnika wyliczane z jego statystyk i frekwencji. */
export function badgesFor(player: Player, attendancePct?: number): Badge[] {
  const b: Badge[] = [];
  const avgForm =
    player.form.length > 0 ? player.form.reduce((s, v) => s + v, 0) / player.form.length : 0;

  if (player.captain) b.push({ id: 'cap', label: 'Kapitan', icon: 'ribbon-outline', color: '#F97316' });
  if (player.stats.goals >= 8) b.push({ id: 'snajper', label: 'Snajper', icon: 'football-outline', color: '#DC2626' });
  else if (player.stats.goals >= 4) b.push({ id: 'strzelec', label: 'Strzelec', icon: 'football-outline', color: '#EA580C' });
  if (player.stats.assists >= 5) b.push({ id: 'asysta', label: 'Asystent', icon: 'git-network-outline', color: '#2563EB' });
  if (player.potential >= 85) b.push({ id: 'talent', label: 'Talent', icon: 'sparkles-outline', color: '#7C3AED' });
  if (avgForm >= 7.5) b.push({ id: 'forma', label: 'Lider formy', icon: 'flame-outline', color: '#F59E0B' });
  if (player.stats.apps >= 12) b.push({ id: 'weteran', label: 'Weteran', icon: 'shield-checkmark-outline', color: '#059669' });
  if (overallOf(player.ratings) >= 85) b.push({ id: 'gwiazda', label: 'Gwiazda', icon: 'star', color: '#D97706' });
  if (attendancePct !== undefined && attendancePct >= 90)
    b.push({ id: 'frekwencja', label: 'Żelazna frekwencja', icon: 'checkmark-done-outline', color: '#0891B2' });

  return b;
}

/** Wszystkie możliwe odznaki (legenda). */
export const ALL_BADGES: Badge[] = [
  { id: 'cap', label: 'Kapitan', icon: 'ribbon-outline', color: '#F97316' },
  { id: 'snajper', label: 'Snajper (8+ goli)', icon: 'football-outline', color: '#DC2626' },
  { id: 'asysta', label: 'Asystent (5+ asyst)', icon: 'git-network-outline', color: '#2563EB' },
  { id: 'talent', label: 'Talent (potencjał 85+)', icon: 'sparkles-outline', color: '#7C3AED' },
  { id: 'forma', label: 'Lider formy', icon: 'flame-outline', color: '#F59E0B' },
  { id: 'weteran', label: 'Weteran (12+ meczów)', icon: 'shield-checkmark-outline', color: '#059669' },
  { id: 'gwiazda', label: 'Gwiazda (ocena 85+)', icon: 'star', color: '#D97706' },
  { id: 'frekwencja', label: 'Żelazna frekwencja (90%+)', icon: 'checkmark-done-outline', color: '#0891B2' },
];

/** Zawodnik miesiąca: najwyższa średnia forma (z tie-breakiem po ocenie). */
export function playerOfMonth(players: Player[]): Player | null {
  if (players.length === 0) return null;
  const score = (p: Player) => {
    const f = p.form.length ? p.form.reduce((s, v) => s + v, 0) / p.form.length : 0;
    return f * 10 + overallOf(p.ratings) / 10;
  };
  return [...players].sort((a, b) => score(b) - score(a))[0];
}
