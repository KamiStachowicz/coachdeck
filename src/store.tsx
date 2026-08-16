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
  PersonalRecord,
  SessionPackage,
  BodyMeasurement,
  Registration,
  Camp,
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
  PERSONAL_RECORDS,
  SESSION_PACKAGES,
  MEASUREMENTS,
  REGISTRATIONS,
  CAMPS,
  enrichPlayer,
} from './data';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isBackendConfigured } from './config';
import { supabase, fetchInitialData, fetchPayments, paymentToRow } from './supabase';
import { getPlan, TRIAL_DAYS, findCoupon, type PlanId, type FeatureKey, type BillingCycle, type Coupon } from './plans';
import { getProfile, type CoachProfile, type ProfileConfig } from './profiles';

const ONBOARDED_KEY = 'coachdeck.onboarded';
const PROFILE_KEY = 'coachdeck.profile';

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
  recordsByPlayer: (playerId: string) => PersonalRecord[];
  addRecord: (playerId: string, event: string, result: string) => void;
  packagesByClient: (clientId: string) => SessionPackage[];
  addPackage: (clientId: string, name: string, total: number, price: number) => void;
  useSession: (packageId: string) => void;
  measurementsByClient: (clientId: string) => BodyMeasurement[];
  addMeasurement: (clientId: string, weightKg: number) => void;
  currentPlan: PlanId | null; // aktywna subskrypcja (null = brak, np. w okresie próbnym)
  trialActive: boolean;
  trialDaysLeft: number;
  billingCycle: BillingCycle;
  setBillingCycle: (cycle: BillingCycle) => void;
  coupon: Coupon | null;
  applyCoupon: (code: string) => boolean;
  clearCoupon: () => void;
  registrations: Registration[];
  addRegistration: (r: Omit<Registration, 'id' | 'paid' | 'status' | 'date'>) => void;
  acceptRegistration: (id: string) => void;
  toggleRegPaid: (id: string) => void;
  camps: Camp[];
  campSignup: (id: string) => void;
  onboarded: boolean | null; // null = jeszcze wczytywane
  completeOnboarding: () => void;
  coachProfile: CoachProfile | null; // null = jeszcze niewybrany
  profile: ProfileConfig; // rozwiązany config (domyślnie drużynowy)
  setProfile: (p: CoachProfile | null) => void;
  profilePickerOpen: boolean;
  openProfilePicker: () => void;
  closeProfilePicker: () => void;
  entered: boolean; // czy użytkownik wszedł ze strony startowej (na sesję)
  enterApp: () => void;
  backToStart: () => void;
  getAttendance: (eventId: string) => Record<string, boolean>;
  setAttendance: (eventId: string, playerId: string, present: boolean) => void;
  attendanceStats: (playerId: string) => { present: number; total: number; pct: number };
  setPlan: (plan: PlanId) => void;
  hasFeature: (key: FeatureKey) => boolean;
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
  const [records, setRecords] = useState<PersonalRecord[]>(PERSONAL_RECORDS);
  const [packages, setPackages] = useState<SessionPackage[]>(SESSION_PACKAGES);
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>(MEASUREMENTS);
  const [billingCycle, setBillingCycleState] = useState<BillingCycle>('monthly');
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>(REGISTRATIONS);
  const [camps, setCamps] = useState<Camp[]>(CAMPS);
  const [subscribedPlan, setSubscribedPlan] = useState<PlanId | null>(null);
  const [trialEndsAt] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + TRIAL_DAYS);
    return d.toISOString();
  });
  const [loading, setLoading] = useState<boolean>(backend);
  const [onboarded, setOnboarded] = useState<boolean | null>(null);
  const [coachProfile, setCoachProfile] = useState<CoachProfile | null>(null);
  const [pickerOpen, setPickerOpen] = useState<boolean>(false);
  const [entered, setEntered] = useState<boolean>(false);
  const [attendance, setAttendanceState] = useState<Record<string, Record<string, boolean>>>({
    e1: { p1: true, p2: true, p3: true, p4: true, p5: false },
    e3: { p6: true, p7: true },
    e5: { p1: true, p2: false, p3: true, p4: true },
  });

  // Wczytanie flagi onboardingu i profilu trenera.
  useEffect(() => {
    let active = true;
    Promise.all([AsyncStorage.getItem(ONBOARDED_KEY), AsyncStorage.getItem(PROFILE_KEY)])
      .then(([ob, pr]) => {
        if (!active) return;
        setOnboarded(ob === '1');
        if (pr === 'team' || pr === 'individual' || pr === 'personal') setCoachProfile(pr);
      })
      .catch(() => {
        if (active) setOnboarded(false);
      });
    return () => {
      active = false;
    };
  }, []);

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

    const trialMs = new Date(trialEndsAt).getTime() - Date.now();
    const trialActive = !subscribedPlan && trialMs > 0;
    const trialDaysLeft = Math.max(0, Math.ceil(trialMs / 86400000));

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
      recordsByPlayer: (playerId) =>
        records.filter((r) => r.playerId === playerId).sort((a, b) => b.date.localeCompare(a.date)),
      addRecord: (playerId, event, result) =>
        setRecords((prev) => [
          ...prev,
          { id: nextId('r'), playerId, event, result, date: new Date().toISOString() },
        ]),
      packagesByClient: (clientId) =>
        packages.filter((p) => p.clientId === clientId).sort((a, b) => b.date.localeCompare(a.date)),
      addPackage: (clientId, name, total, price) =>
        setPackages((prev) => [
          ...prev,
          { id: nextId('pk'), clientId, name, total, used: 0, price, date: new Date().toISOString() },
        ]),
      useSession: (packageId) =>
        setPackages((prev) =>
          prev.map((p) => (p.id === packageId && p.used < p.total ? { ...p, used: p.used + 1 } : p)),
        ),
      measurementsByClient: (clientId) =>
        measurements.filter((m) => m.clientId === clientId).sort((a, b) => a.date.localeCompare(b.date)),
      addMeasurement: (clientId, weightKg) =>
        setMeasurements((prev) => [
          ...prev,
          { id: nextId('bm'), clientId, weightKg, date: new Date().toISOString() },
        ]),
      billingCycle,
      setBillingCycle: (cycle) => setBillingCycleState(cycle),
      coupon,
      applyCoupon: (code) => {
        const found = findCoupon(code);
        if (found) {
          setCoupon(found);
          return true;
        }
        return false;
      },
      clearCoupon: () => setCoupon(null),
      registrations,
      addRegistration: (r) =>
        setRegistrations((prev) => [
          { ...r, id: nextId('rg'), paid: false, status: 'new', date: new Date().toISOString() },
          ...prev,
        ]),
      acceptRegistration: (id) => {
        const reg = registrations.find((x) => x.id === id);
        if (!reg) return;
        const pid = nextId('p');
        setPlayers((prev) => [
          ...prev,
          enrichPlayer({
            id: pid,
            teamId: reg.teamId,
            firstName: reg.firstName,
            lastName: reg.lastName,
            ratings: { fitness: 55, technique: 55, tactics: 55, mentality: 55 },
            status: 'available',
          }),
        ]);
        setRegistrations((prev) => prev.map((x) => (x.id === id ? { ...x, status: 'accepted' } : x)));
      },
      toggleRegPaid: (id) =>
        setRegistrations((prev) => prev.map((x) => (x.id === id ? { ...x, paid: !x.paid } : x))),
      camps,
      campSignup: (id) =>
        setCamps((prev) =>
          prev.map((cmp) => (cmp.id === id && cmp.signups < cmp.capacity ? { ...cmp, signups: cmp.signups + 1 } : cmp)),
        ),
      currentPlan: subscribedPlan,
      trialActive,
      trialDaysLeft,
      onboarded,
      completeOnboarding: () => {
        setOnboarded(true);
        AsyncStorage.setItem(ONBOARDED_KEY, '1').catch(() => {});
      },
      coachProfile,
      profile: getProfile(coachProfile),
      setProfile: (p) => {
        setCoachProfile(p);
        if (p) {
          AsyncStorage.setItem(PROFILE_KEY, p).catch(() => {});
          setPickerOpen(false); // po wyborze zamknij picker
        } else {
          AsyncStorage.removeItem(PROFILE_KEY).catch(() => {});
        }
      },
      profilePickerOpen: pickerOpen,
      openProfilePicker: () => setPickerOpen(true),
      closeProfilePicker: () => setPickerOpen(false),
      entered,
      enterApp: () => setEntered(true),
      backToStart: () => setEntered(false),
      getAttendance: (eventId) => attendance[eventId] ?? {},
      setAttendance: (eventId, playerId, present) =>
        setAttendanceState((prev) => ({
          ...prev,
          [eventId]: { ...(prev[eventId] ?? {}), [playerId]: present },
        })),
      attendanceStats: (playerId) => {
        let present = 0;
        let total = 0;
        for (const ev of Object.values(attendance)) {
          if (playerId in ev) {
            total += 1;
            if (ev[playerId]) present += 1;
          }
        }
        return { present, total, pct: total > 0 ? Math.round((present / total) * 100) : 0 };
      },
      setPlan: (plan) => setSubscribedPlan(plan),
      // W okresie próbnym pełny dostęp; po nim tylko funkcje wykupionego planu.
      hasFeature: (key) =>
        trialActive ? true : subscribedPlan ? getPlan(subscribedPlan).unlocks.includes(key) : false,
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
  }, [teams, players, events, payments, lineups, standings, results, scoutTargets, transfers, goals, records, packages, measurements, billingCycle, coupon, registrations, camps, subscribedPlan, trialEndsAt, onboarded, coachProfile, pickerOpen, entered, attendance, loading, backend]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore musi być użyty wewnątrz <StoreProvider>');
  return ctx;
}
