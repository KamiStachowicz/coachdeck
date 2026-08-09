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

export interface Player {
  id: string;
  teamId: string;
  firstName: string;
  lastName: string;
  number?: number;
  position?: string;
  birthYear?: number;
  // proste atrybuty 0–100 w stylu Football Managera (uniwersalne)
  ratings: {
    fitness: number; // kondycja
    technique: number; // technika
    tactics: number; // taktyka
    mentality: number; // mentalność
  };
  status: 'available' | 'injured' | 'suspended';
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
