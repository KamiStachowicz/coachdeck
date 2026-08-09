import React, { createContext, useContext, useMemo, useState } from 'react';
import type { Team, Player, CoachEvent, Payment } from './types';
import { TEAMS, PLAYERS, EVENTS, PAYMENTS } from './data';

/**
 * Prosty magazyn stanu w pamięci (Context).
 * Na start bez backendu = bez kosztów. Kolejny krok: podpięcie
 * bazy (np. Supabase – darmowy plan) w miejscu tych funkcji.
 */

export interface FinanceSummary {
  collected: number; // zapłacone
  pending: number; // oczekujące
  overdue: number; // zaległe
  total: number; // wszystko poza zapłaconym (do zebrania)
}

interface StoreValue {
  teams: Team[];
  players: Player[];
  events: CoachEvent[];
  payments: Payment[];
  addPlayer: (p: Omit<Player, 'id'>) => void;
  addEvent: (e: Omit<CoachEvent, 'id'>) => void;
  addPayment: (p: Omit<Payment, 'id'>) => void;
  markPaid: (id: string) => void;
  markUnpaid: (id: string) => void;
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

/** Aktualizuje status na 'overdue', jeśli termin minął i nie zapłacono. */
function withComputedStatus(p: Payment): Payment {
  if (p.status === 'paid') return p;
  const overdue = new Date(p.dueDate).getTime() < Date.now();
  return { ...p, status: overdue ? 'overdue' : 'pending' };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [teams] = useState<Team[]>(TEAMS);
  const [players, setPlayers] = useState<Player[]>(PLAYERS);
  const [events, setEvents] = useState<CoachEvent[]>(EVENTS);
  const [payments, setPayments] = useState<Payment[]>(PAYMENTS.map(withComputedStatus));

  const value = useMemo<StoreValue>(() => {
    const collected = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
    const pending = payments.filter((p) => p.status === 'pending').reduce((s, p) => s + p.amount, 0);
    const overdue = payments.filter((p) => p.status === 'overdue').reduce((s, p) => s + p.amount, 0);

    return {
      teams,
      players,
      events,
      payments,
      addPlayer: (p) => setPlayers((prev) => [...prev, { ...p, id: nextId('p') }]),
      addEvent: (e) =>
        setEvents((prev) =>
          [...prev, { ...e, id: nextId('e') }].sort((a, b) => a.date.localeCompare(b.date)),
        ),
      addPayment: (p) =>
        setPayments((prev) => [...prev, withComputedStatus({ ...p, id: nextId('pay') })]),
      markPaid: (id) =>
        setPayments((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, status: 'paid', paidDate: new Date().toISOString() } : p,
          ),
        ),
      markUnpaid: (id) =>
        setPayments((prev) =>
          prev.map((p) =>
            p.id === id ? withComputedStatus({ ...p, status: 'pending', paidDate: undefined }) : p,
          ),
        ),
      playersByTeam: (teamId) => players.filter((p) => p.teamId === teamId),
      eventsByTeam: (teamId) => events.filter((e) => e.teamId === teamId),
      paymentsByPlayer: (playerId) => payments.filter((p) => p.playerId === playerId),
      getTeam: (id) => teams.find((t) => t.id === id),
      getPlayer: (id) => players.find((p) => p.id === id),
      financeSummary: { collected, pending, overdue, total: pending + overdue },
    };
  }, [teams, players, events, payments]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore musi być użyty wewnątrz <StoreProvider>');
  return ctx;
}
