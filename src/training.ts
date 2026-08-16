/** Plany treningowe: kategorie, biblioteka ćwiczeń i gotowe konspekty. */

export type ExerciseCategory =
  | 'rozgrzewka'
  | 'technika'
  | 'taktyka'
  | 'kondycja'
  | 'gra'
  | 'rozciąganie';

export const CATEGORY_META: Record<
  ExerciseCategory,
  { label: string; icon: string; color: string }
> = {
  rozgrzewka: { label: 'Rozgrzewka', icon: 'walk-outline', color: '#F59E0B' },
  technika: { label: 'Technika', icon: 'football-outline', color: '#2563EB' },
  taktyka: { label: 'Taktyka', icon: 'grid-outline', color: '#059669' },
  kondycja: { label: 'Kondycja', icon: 'barbell-outline', color: '#DC2626' },
  gra: { label: 'Gra', icon: 'trophy-outline', color: '#7C3AED' },
  rozciąganie: { label: 'Rozciąganie', icon: 'body-outline', color: '#0891B2' },
};

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  minutes: number;
  description: string;
}

export const EXERCISES: Exercise[] = [
  { id: 'x1', name: 'Trucht i mobilizacja', category: 'rozgrzewka', minutes: 10, description: 'Lekki bieg, krążenia ramion i bioder, wykroki.' },
  { id: 'x2', name: 'Drabinka koordynacyjna', category: 'rozgrzewka', minutes: 10, description: 'Szybkość nóg i koordynacja – różne wzory kroków.' },
  { id: 'x3', name: 'Podania w parach', category: 'technika', minutes: 15, description: 'Podania wewnętrzną częścią stopy, praca nad dokładnością.' },
  { id: 'x4', name: 'Przyjęcie i obrót', category: 'technika', minutes: 15, description: 'Przyjęcie piłki z obrotem i wyjściem na wolne pole.' },
  { id: 'x5', name: 'Drybling slalom', category: 'technika', minutes: 12, description: 'Prowadzenie piłki między tyczkami, zmiana tempa.' },
  { id: 'x6', name: 'Gra pozycyjna 4v2', category: 'taktyka', minutes: 15, description: 'Utrzymanie piłki, gra w wąskim polu, szybkie podania.' },
  { id: 'x7', name: 'Ustawienie w obronie', category: 'taktyka', minutes: 15, description: 'Krycie, asekuracja i przesuwanie linii obrony.' },
  { id: 'x8', name: 'Interwały biegowe', category: 'kondycja', minutes: 12, description: '30s szybko / 30s trucht, 8 powtórzeń.' },
  { id: 'x9', name: 'Obwód siłowy', category: 'kondycja', minutes: 15, description: 'Przysiady, plank, wykroki, brzuszki – 3 rundy.' },
  { id: 'x10', name: 'Gra właściwa 7v7', category: 'gra', minutes: 20, description: 'Mecz treningowy z realizacją założeń taktycznych.' },
  { id: 'x11', name: 'Strzały na bramkę', category: 'gra', minutes: 15, description: 'Wykończenie akcji, strzały z różnych pozycji.' },
  { id: 'x12', name: 'Stretching i schłodzenie', category: 'rozciąganie', minutes: 10, description: 'Rozciąganie statyczne głównych grup mięśniowych.' },
];

export function getExercise(id: string): Exercise | undefined {
  return EXERCISES.find((e) => e.id === id);
}

export interface TrainingSession {
  id: string;
  title: string;
  focus: string;
  level: string; // np. "Wszystkie", "U-15", "Seniorzy"
  items: string[]; // id ćwiczeń
}

export const TRAINING_SESSIONS: TrainingSession[] = [
  { id: 's1', title: 'Trening techniczny', focus: 'Technika i podania', level: 'Wszystkie', items: ['x1', 'x3', 'x4', 'x5', 'x11', 'x12'] },
  { id: 's2', title: 'Trening taktyczny', focus: 'Gra zespołowa', level: 'Seniorzy', items: ['x1', 'x6', 'x7', 'x10', 'x12'] },
  { id: 's3', title: 'Trening kondycyjny', focus: 'Wytrzymałość i siła', level: 'Wszystkie', items: ['x1', 'x8', 'x9', 'x2', 'x12'] },
  { id: 's4', title: 'Trening dla młodzików', focus: 'Zabawa i podstawy', level: 'U-15', items: ['x1', 'x2', 'x5', 'x10', 'x12'] },
];

export function sessionMinutes(session: TrainingSession): number {
  return session.items.reduce((sum, id) => sum + (getExercise(id)?.minutes ?? 0), 0);
}
