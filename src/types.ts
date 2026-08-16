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
  badge?: string; // URL herbu (z API)
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

export interface Scorer {
  playerId: string;
  goals: number;
  assists: number;
}

/** Dane wejściowe przy wpisywaniu wyniku meczu. */
export interface MatchInput {
  teamId: string;
  opponent: string;
  home: boolean;
  goalsFor: number;
  goalsAgainst: number;
  competition?: string;
  scorers: Scorer[];
}

/* ---------- Skauting i transfery ---------- */

export interface ScoutTarget {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  sport: SportId;
  age: number;
  overall: number;
  potential: number;
  value: number; // PLN
  club: string;
  ratings: PlayerRatings;
  watched: boolean;
}

export interface Transfer {
  id: string;
  playerName: string;
  direction: 'in' | 'out';
  fee: number;
  date: string;
  club: string; // z/do jakiego klubu
}

/* ---------- Cele treningowe ---------- */

export interface TrainingGoal {
  id: string;
  playerId: string;
  text: string;
  done: boolean;
}

/* ---------- Rekordy / wyniki indywidualne (pływanie, LA, tenis...) ---------- */

export interface PersonalRecord {
  id: string;
  playerId: string;
  event: string; // np. "100 m kraul", "Skok w dal", "Bilans singla"
  result: string; // np. "0:58.30", "6.20 m", "12–3"
  date: string; // ISO
}

/* ---------- Trener personalny: karnety i pomiary ---------- */

export interface SessionPackage {
  id: string;
  clientId: string; // playerId
  name: string; // np. "Karnet 10 wejść"
  total: number; // liczba wejść
  used: number; // wykorzystane
  price: number; // PLN
  date: string; // ISO – zakup
}

export interface BodyMeasurement {
  id: string;
  clientId: string; // playerId
  weightKg: number;
  date: string; // ISO
  note?: string;
}

/* ---------- Sprzedaż: nabór, obozy ---------- */

export interface Registration {
  id: string;
  teamId: string;
  firstName: string;
  lastName: string;
  contact?: string; // telefon/e-mail opiekuna
  fee: number; // wpisowe (PLN)
  paid: boolean;
  status: 'new' | 'accepted';
  date: string; // ISO
}

export interface Camp {
  id: string;
  title: string;
  location: string;
  dateRange: string; // np. "1–8 lipca"
  price: number; // PLN
  deposit: number; // zaliczka PLN
  capacity: number;
  signups: number;
}

/* ---------- Komunikacja ---------- */

export interface Announcement {
  id: string;
  teamId?: string; // null = do wszystkich
  title: string;
  body: string;
  date: string; // ISO
  pinned: boolean;
}
