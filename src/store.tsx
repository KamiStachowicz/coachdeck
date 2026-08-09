import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type {
  Team,
  Player,
  PlayerCore,
  CoachEvent,
  Payment,
  Lineup,
  StandingRow,
  MatchResult,
  MatchInput,
  ScoutTarget,
  Transfer,
  TrainingGoal,
} from './types';
import {
  TEAMS,
  PLAYERS,
  EVENTS,
  PAYMENTS,
  FORMATIONS,
  STANDINGS,
  RESULTS,
  SCOUT_TARGETS,
  TRAINING_GOALS,
  enrichPlayer,
} from './data';
import { isBackendConfigured } from './config';
import { supabase, fetchInitialData, fetchPayments, paymentToRow } from './supabase';

/**
 * Magazyn stanu aplikacji.
 * - Tryb DEMO (bez kluczy): dane w pamięci z pliku `data.ts`.
 * - Tryb BACKEND (Supabase skonfigurowane): dane ładowane i zapisywane w bazie,
 *   dzięki czemu potwierdzenia płatności z Przelewy24 są widoczne w aplikacji.
 */

export interface FinanceSummary {
  collected: number;
  pending: number;
  overdue: number;
  total: number;
}

interface StoreValue {
  teams: Team[];
  players: Player[];
  events: CoachEvent[];
  payments: Payment[];
  loading: boolean;
  backend: boolean;
  addPlayer: (p: Omit<PlayerCore, 'id'>) => void;
  addEvent: (e: Omit<CoachEvent, 'id'>) => void;
  getLineup: (teamId: string) => Lineup;
  setLineup: (lineup: Lineup) => void;
  standings: StandingRow[];
  results: MatchResult[];
  addResult: (input: MatchInput) => void;
  scoutTargets: ScoutTarget[];
  transfers: Transfer[];
  toggleWatch: (targetId: string) => void;
  signTarget: (targetId: string, teamId: string) => void;
  goalsByPlayer: (playerId: string) => TrainingGoal[];
  addGoal: (playerId: string, text: string) => void;
  toggleGoal: (goalId: string) => void;
  removeGoal: (goalId: string) => void;
  addPayment: (p: Omit<Payment, 'id'>) => void;
  markPaid: (id: string) => void;
  markUnpaid: (id: string) => void;
  refreshPayments: () => Promise<void>;
  playersByTeam: (teamId: string) => Player[];
  eventsByTeam: (teamId: string) => CoachEvent[];
  paymentsByPlayer: (playerId: string) => Payment[];
  getTeam: (id: string) => Team | undefined;
  getPlayer: (id: string) => Player | undefined;
  financeSummary: FinanceSummary;
}

const StoreContext = createContext<StoreValue | null>(null);

let counter = 100;
const nextId = (prefix: string) => `${prefix}${++counter}`;

function withComputedStatus(p: Payment): Payment {
  if (p.status === 'paid') return p;
  const overdue = new Date(p.dueDate).getTime() < Date.now();
  return { ...p, status: overdue ? 'overdue' : 'pending' };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const backend = isBackendConfigured();
  const [teams, setTeams] = useState<Team[]>(TEAMS);
  const [players, setPlayers] = useState<Player[]>(PLAYERS);
  const [events, setEvents] = useState<CoachEvent[]>(EVENTS);
  const [payments, setPayments] = useState<Payment[]>(PAYMENTS.map(withComputedStatus));
  const [lineups, setLineups] = useState<Record<string, Lineup>>({});
  const [standings, setStandings] = useState<StandingRow[]>(STANDINGS);
  const [results, setResults] = useState<MatchResult[]>(RESULTS);
  const [scoutTargets, setScoutTargets] = useState<ScoutTarget[]>(SCOUT_TARGETS);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [goals, setGoals] = useState<TrainingGoal[]>(TRAINING_GOALS);
  const [loading, setLoading] = useState<boolean>(backend);

  // Ładowanie danych z bazy (tylko gdy backend skonfigurowany).
  useEffect(() => {
    if (!backend) return;
    let active = true;
    (async () => {
      const data = await fetchInitialData();
      if (active && data) {
        setTeams(data.teams);
        setPlayers(data.players);
        setPayments(data.payments.map(withComputedStatus));
      }
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [backend]);

  const refreshPayments = async () => {
    if (!backend) return;
    const fresh = await fetchPayments();
    if (fresh) setPayments(fresh.map(withComputedStatus));
  };

  const value = useMemo<StoreValue>(() => {
    const collected = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
    const pending = payments.filter((p) => p.status === 'pending').reduce((s, p) => s + p.amount, 0);
    const overdue = payments.filter((p) => p.status === 'overdue').reduce((s, p) => s + p.amount, 0);

    return {
      teams,
      players,
      events,
      payments,
      loading,
      backend,
      addPlayer: (p) => {
        const id = nextId('p');
        setPlayers((prev) => [...prev, enrichPlayer({ ...p, id })]);
        // Uwaga: zapis graczy do bazy dodamy przy pełnej migracji CRUD.
      },
      getLineup: (teamId) => {
        const existing = lineups[teamId];
        if (existing) return existing;
        const formation = '4-4-2';
        return { teamId, formation, slots: FORMATIONS[formation].map(() => null), bench: [] };
      },
      setLineup: (lineup) => setLineups((prev) => ({ ...prev, [lineup.teamId]: lineup })),
      standings,
      results,
      addResult: (input) => {
        const win = input.goalsFor > input.goalsAgainst;
        const draw = input.goalsFor === input.goalsAgainst;
        // 1. Dodaj mecz do historii.
        const result: MatchResult = {
          id: nextId('m'),
          teamId: input.teamId,
          opponent: input.opponent,
          date: new Date().toISOString(),
          home: input.home,
          goalsFor: input.goalsFor,
          goalsAgainst: input.goalsAgainst,
          competition: input.competition,
        };
        setResults((prev) => [...prev, result]);

        // 2. Zaktualizuj tabelę: nasza drużyna ('me') + rywal (jeśli w tabeli).
        setStandings((prev) => {
          const next = prev.map((r) => ({ ...r }));
          const applyRow = (row: StandingRow, gf: number, ga: number) => {
            row.played += 1;
            row.goalsFor += gf;
            row.goalsAgainst += ga;
            if (gf > ga) {
              row.won += 1;
              row.points += 3;
            } else if (gf === ga) {
              row.drawn += 1;
              row.points += 1;
            } else {
              row.lost += 1;
            }
          };
          const me = next.find((r) => r.teamId === 'me');
          if (me) applyRow(me, input.goalsFor, input.goalsAgainst);
          const opp = next.find((r) => r.name.toLowerCase() === input.opponent.trim().toLowerCase());
          if (opp) applyRow(opp, input.goalsAgainst, input.goalsFor);
          return next;
        });

        // 3. Zaktualizuj statystyki strzelców.
        if (input.scorers.length > 0) {
          setPlayers((prev) =>
            prev.map((p) => {
              const s = input.scorers.find((x) => x.playerId === p.id);
              if (!s) return p;
              return {
                ...p,
                stats: {
                  ...p.stats,
                  apps: p.stats.apps + 1,
                  goals: p.stats.goals + s.goals,
                  assists: p.stats.assists + s.assists,
                },
              };
            }),
          );
        }
      },
      scoutTargets,
      transfers,
      toggleWatch: (targetId) =>
        setScoutTargets((prev) =>
          prev.map((t) => (t.id === targetId ? { ...t, watched: !t.watched } : t)),
        ),
      signTarget: (targetId, teamId) => {
        const target = scoutTargets.find((t) => t.id === targetId);
        if (!target) return;
        const id = nextId('p');
        const core: PlayerCore = {
          id,
          teamId,
          firstName: target.firstName,
          lastName: target.lastName,
          position: target.position,
          birthYear: new Date().getFullYear() - target.age,
          ratings: target.ratings,
          status: 'available',
        };
        setPlayers((prev) => [...prev, enrichPlayer(core)]);
        setScoutTargets((prev) => prev.filter((t) => t.id !== targetId));
        setTransfers((prev) => [
          {
            id: nextId('tr'),
            playerName: `${target.firstName} ${target.lastName}`,
            direction: 'in',
            fee: target.value,
            date: new Date().toISOString(),
            club: target.club,
          },
          ...prev,
        ]);
      },
      goalsByPlayer: (playerId) => goals.filter((g) => g.playerId === playerId),
      addGoal: (playerId, text) =>
        setGoals((prev) => [...prev, { id: nextId('g'), playerId, text, done: false }]),
      toggleGoal: (goalId) =>
        setGoals((prev) => prev.map((g) => (g.id === goalId ? { ...g, done: !g.done } : g))),
      removeGoal: (goalId) => setGoals((prev) => prev.filter((g) => g.id !== goalId)),
      addEvent: (e) =>
        setEvents((prev) =>
          [...prev, { ...e, id: nextId('e') }].sort((a, b) => a.date.localeCompare(b.date)),
        ),
      addPayment: (p) => {
        const id = nextId('pay');
        const withStatus = withComputedStatus({ ...p, id });
        setPayments((prev) => [...prev, withStatus]);
        if (backend && supabase) {
          supabase.from('payments').insert(paymentToRow(withStatus)).then(() => {});
        }
      },
      markPaid: (id) => {
        const paidDate = new Date().toISOString();
        setPayments((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: 'paid', paidDate } : p)),
        );
        if (backend && supabase) {
          supabase.from('payments').update({ status: 'paid', paid_date: paidDate }).eq('id', id).then(() => {});
        }
      },
      markUnpaid: (id) => {
        setPayments((prev) =>
          prev.map((p) =>
            p.id === id ? withComputedStatus({ ...p, status: 'pending', paidDate: undefined }) : p,
          ),
        );
        if (backend && supabase) {
          supabase.from('payments').update({ status: 'pending', paid_date: null }).eq('id', id).then(() => {});
        }
      },
      refreshPayments,
      playersByTeam: (teamId) => players.filter((p) => p.teamId === teamId),
      eventsByTeam: (teamId) => events.filter((e) => e.teamId === teamId),
      paymentsByPlayer: (playerId) => payments.filter((p) => p.playerId === playerId),
      getTeam: (id) => teams.find((t) => t.id === id),
      getPlayer: (id) => players.find((p) => p.id === id),
      financeSummary: { collected, pending, overdue, total: pending + overdue },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teams, players, events, payments, lineups, standings, results, scoutTargets, transfers, goals, loading, backend]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore musi być użyty wewnątrz <StoreProvider>');
  return ctx;
}
