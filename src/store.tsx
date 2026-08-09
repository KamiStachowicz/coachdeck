import React, { createContext, useContext, useMemo, useState } from 'react';
import type { Team, Player, CoachEvent } from './types';
import { TEAMS, PLAYERS, EVENTS } from './data';

/**
 * Prosty magazyn stanu w pamięci (Context).
 * Na start bez backendu = bez kosztów. Kolejny krok: podpięcie
 * bazy (np. Supabase – darmowy plan) w miejscu tych funkcji.
 */

interface StoreValue {
  teams: Team[];
  players: Player[];
  events: CoachEvent[];
  addPlayer: (p: Omit<Player, 'id'>) => void;
  addEvent: (e: Omit<CoachEvent, 'id'>) => void;
  playersByTeam: (teamId: string) => Player[];
  eventsByTeam: (teamId: string) => CoachEvent[];
  getTeam: (id: string) => Team | undefined;
  getPlayer: (id: string) => Player | undefined;
}

const StoreContext = createContext<StoreValue | null>(null);

let counter = 100;
const nextId = (prefix: string) => `${prefix}${++counter}`;

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [teams] = useState<Team[]>(TEAMS);
  const [players, setPlayers] = useState<Player[]>(PLAYERS);
  const [events, setEvents] = useState<CoachEvent[]>(EVENTS);

  const value = useMemo<StoreValue>(
    () => ({
      teams,
      players,
      events,
      addPlayer: (p) => setPlayers((prev) => [...prev, { ...p, id: nextId('p') }]),
      addEvent: (e) =>
        setEvents((prev) =>
          [...prev, { ...e, id: nextId('e') }].sort((a, b) => a.date.localeCompare(b.date)),
        ),
      playersByTeam: (teamId) => players.filter((p) => p.teamId === teamId),
      eventsByTeam: (teamId) => events.filter((e) => e.teamId === teamId),
      getTeam: (id) => teams.find((t) => t.id === id),
      getPlayer: (id) => players.find((p) => p.id === id),
    }),
    [teams, players, events],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore musi być użyty wewnątrz <StoreProvider>');
  return ctx;
}
