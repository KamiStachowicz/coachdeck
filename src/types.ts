/** CoachDeck – model danych (niezależny od dyscypliny). */

export type SportId =
  | 'football'
  | 'basketball'
  | 'volleyball'
  | 'handball'
  | 'tennis'
  | 'athletics'
  | 'swimming'
  | 'hockey';

export interface Sport {
  id: SportId;
  name: string;
  icon: string; // Ionicons name
  color: string;
  positions: string[];
}

export interface Team {
  id: string;
  name: string;
  sport: SportId;
  category: string; // np. "U-15", "Seniorzy", "Kobiety"
  season: string;
  colorAccent?: string;
}

export type Morale = 'high' | 'ok' | 'low';
export type Foot = 'L' | 'R' | 'both';

export interface PlayerRatings {
  fitness: number; // kondycja
  technique: number; // technika
  tactics: number; // taktyka
  mentality: number; // mentalność
}

export interface PlayerStats {
  apps: number; // wystąpienia
  goals: number;
  assists: number;
  minutes: number;
  yellow: number;
  red: number;
  avgRating: number; // średnia ocena 1–10
}

export interface DevPoint {
  label: string; // np. "Wrz", "Paź"
  overall: number; // ocena ogólna w danym miesiącu
}

/** Pola bazowe, wymagane przy tworzeniu zawodnika. */
export interface PlayerCore {
  id: string;
  teamId: string;
  firstName: string;
  lastName: string;
  number?: number;
  position?: string;
  birthYear?: number;
  ratings: PlayerRatings; // atrybuty 0–100 (uniwersalne)
  status: 'available' | 'injured' | 'suspended';
}

/** Pełny zawodnik z rozszerzeniami w stylu Football Managera. */
export interface Player extends PlayerCore {
  potential: number; // potencjał 0–100
  morale: Morale;
  condition: number; // gotowość na mecz 0–100
  value: number; // wartość rynkowa (PLN)
  foot: Foot;
  captain: boolean;
  stats: PlayerStats;
  form: number[]; // oceny z ostatnich meczów (1–10)
  development: DevPoint[]; // rozwój oceny ogólnej w czasie
}

export type EventType = 'training' | 'match';

export interface CoachEvent {
  id: string;
  teamId: string;
  type: EventType;
  title: string;
  date: string; // ISO
  location?: string;
  opponent?: string; // dla meczu
  notes?: string;
}

export interface AttendanceRecord {
  eventId: string;
  playerId: string;
  present: boolean;
}

export type PaymentKind = 'dues' | 'class' | 'camp' | 'equipment' | 'other';
export type PaymentStatus = 'paid' | 'pending' | 'overdue';

export interface Payment {
  id: string;
  playerId: string;
  teamId: string;
  kind: PaymentKind;
  title: string; // np. "Składka – marzec 2026"
  amount: number; // w PLN
  dueDate: string; // ISO
  paidDate?: string; // ISO, jeśli zapłacone
  status: PaymentStatus;
}

/* ---------- Taktyka i skład ---------- */

export interface FormationSlot {
  role: string; // np. "BR", "OB", "PM", "NA"
  x: number; // 0–100 (szerokość boiska)
  y: number; // 0–100 (0 = linia przeciwnika, 100 = własna bramka)
}

export interface Lineup {
  teamId: string;
  formation: string; // np. "4-4-2"
  slots: (string | null)[]; // playerId na pozycji lub null
  bench: string[]; // playerId na ławce
}

/* ---------- Liga i wyniki ---------- */

export interface StandingRow {
  teamId: string; // 'me' dla naszej drużyny lub id rywala
  name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

export interface MatchResult {
  id: string;
  teamId: string; // nasza drużyna
  opponent: string;
  date: string; // ISO
  home: boolean;
  goalsFor: number;
  goalsAgainst: number;
  competition?: string;
}
