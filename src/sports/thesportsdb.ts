/**
 * Integracja z TheSportsDB (https://www.thesportsdb.com) – ligi zawodowe.
 * Darmowy klucz testowy '123'. Dane: tabele ligowe i ostatnie mecze.
 */
import { THESPORTSDB_KEY } from '@/src/config';
import type { StandingRow } from '@/src/types';

const BASE = `https://www.thesportsdb.com/api/v1/json/${THESPORTSDB_KEY}`;

export interface LeaguePreset {
  id: string;
  name: string;
  sport: string;
}

/** Popularne ligi (można też szukać innych). */
export const LEAGUE_PRESETS: LeaguePreset[] = [
  { id: '4422', name: 'Ekstraklasa', sport: 'Piłka nożna' },
  { id: '4328', name: 'Premier League', sport: 'Piłka nożna' },
  { id: '4335', name: 'La Liga', sport: 'Piłka nożna' },
  { id: '4331', name: 'Bundesliga', sport: 'Piłka nożna' },
  { id: '4332', name: 'Serie A', sport: 'Piłka nożna' },
  { id: '4334', name: 'Ligue 1', sport: 'Piłka nożna' },
  { id: '4387', name: 'NBA', sport: 'Koszykówka' },
];

export interface ProMatch {
  id: string;
  home: string;
  away: string;
  homeScore: number | null;
  awayScore: number | null;
  date: string;
  league?: string;
  homeBadge?: string;
  awayBadge?: string;
}

/** Kandydujące sezony (bieżący i poprzedni) w formacie TheSportsDB. */
function candidateSeasons(): string[] {
  const now = new Date();
  const y = now.getFullYear();
  const startYear = now.getMonth() >= 6 ? y : y - 1; // sezon startuje ~lipiec
  const cur = `${startYear}-${startYear + 1}`;
  const prev = `${startYear - 1}-${startYear}`;
  return [cur, prev];
}

async function getJson(url: string): Promise<any | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function mapRow(r: any): StandingRow {
  return {
    teamId: String(r.idTeam ?? r.strTeam),
    name: r.strTeam ?? '—',
    played: Number(r.intPlayed ?? 0),
    won: Number(r.intWin ?? 0),
    drawn: Number(r.intDraw ?? 0),
    lost: Number(r.intLoss ?? 0),
    goalsFor: Number(r.intGoalsFor ?? 0),
    goalsAgainst: Number(r.intGoalsAgainst ?? 0),
    points: Number(r.intPoints ?? 0),
    badge: r.strBadge ?? r.strTeamBadge ?? undefined,
  };
}

/** Tabela ligowa – próbuje bieżący, potem poprzedni sezon. */
export async function fetchStandings(
  leagueId: string,
): Promise<{ season: string; rows: StandingRow[] } | null> {
  for (const season of candidateSeasons()) {
    const data = await getJson(`${BASE}/lookuptable.php?l=${leagueId}&s=${season}`);
    const table = data?.table;
    if (Array.isArray(table) && table.length > 0) {
      return { season, rows: table.map(mapRow) };
    }
  }
  return null;
}

/** Ostatnie rozegrane mecze w lidze. */
export async function fetchPastEvents(leagueId: string): Promise<ProMatch[]> {
  const data = await getJson(`${BASE}/eventspastleague.php?id=${leagueId}`);
  const events = data?.events;
  if (!Array.isArray(events)) return [];
  return events.map((e: any) => ({
    id: String(e.idEvent),
    home: e.strHomeTeam,
    away: e.strAwayTeam,
    homeScore: e.intHomeScore != null ? Number(e.intHomeScore) : null,
    awayScore: e.intAwayScore != null ? Number(e.intAwayScore) : null,
    date: e.dateEvent,
    league: e.strLeague,
    homeBadge: e.strHomeTeamBadge ?? undefined,
    awayBadge: e.strAwayTeamBadge ?? undefined,
  }));
}

/** Wyszukiwanie lig po kraju (np. 'Poland') i sporcie (np. 'Soccer'). */
export async function searchLeagues(country: string, sport = 'Soccer'): Promise<LeaguePreset[]> {
  const data = await getJson(
    `${BASE}/search_all_leagues.php?c=${encodeURIComponent(country)}&s=${encodeURIComponent(sport)}`,
  );
  const leagues = data?.countries ?? data?.leagues;
  if (!Array.isArray(leagues)) return [];
  return leagues
    .filter((l: any) => l.idLeague)
    .map((l: any) => ({ id: String(l.idLeague), name: l.strLeague, sport: l.strSport ?? sport }));
}
