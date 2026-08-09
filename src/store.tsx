import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Team, Player, CoachEvent, Payment } from './types';
import { TEAMS, PLAYERS, EVENTS, PAYMENTS } from './data';
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
  addPlayer: (p: Omit<Player, 'id'>) => void;
  addEvent: (e: Omit<CoachEvent, 'id'>) => void;
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
        setPlayers((prev) => [...prev, { ...p, id }]);
        // Uwaga: zapis graczy do bazy dodamy przy pełnej migracji CRUD.
      },
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
  }, [teams, players, events, payments, loading, backend]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore musi być użyty wewnątrz <StoreProvider>');
  return ctx;
}
