import type { Sport, Team, Player, CoachEvent } from './types';

export const SPORTS: Sport[] = [
  { id: 'football', name: 'Piłka nożna', icon: 'football-outline', color: '#059669', positions: ['Bramkarz', 'Obrońca', 'Pomocnik', 'Napastnik'] },
  { id: 'basketball', name: 'Koszykówka', icon: 'basketball-outline', color: '#EA580C', positions: ['Rozgrywający', 'Rzucający obrońca', 'Niski skrzydłowy', 'Silny skrzydłowy', 'Środkowy'] },
  { id: 'volleyball', name: 'Siatkówka', icon: 'tennisball-outline', color: '#2563EB', positions: ['Rozgrywający', 'Atakujący', 'Środkowy', 'Przyjmujący', 'Libero'] },
  { id: 'handball', name: 'Piłka ręczna', icon: 'hand-left-outline', color: '#7C3AED', positions: ['Bramkarz', 'Skrzydłowy', 'Rozgrywający', 'Obrotowy'] },
  { id: 'tennis', name: 'Tenis', icon: 'tennisball-outline', color: '#CA8A04', positions: ['Singiel', 'Debel'] },
  { id: 'athletics', name: 'Lekkoatletyka', icon: 'walk-outline', color: '#DB2777', positions: ['Sprint', 'Średnie', 'Długie', 'Skoki', 'Rzuty'] },
  { id: 'swimming', name: 'Pływanie', icon: 'water-outline', color: '#0891B2', positions: ['Kraul', 'Grzbiet', 'Klasyk', 'Motylek'] },
  { id: 'hockey', name: 'Hokej', icon: 'snow-outline', color: '#4F46E5', positions: ['Bramkarz', 'Obrońca', 'Napastnik'] },
];

export function getSport(id: string) {
  return SPORTS.find((s) => s.id === id) ?? SPORTS[0];
}

export const SEASON = '2025/2026';

export const TEAMS: Team[] = [
  { id: 't1', name: 'Orły Warszawa', sport: 'football', category: 'Seniorzy', season: SEASON, colorAccent: '#059669' },
  { id: 't2', name: 'Orlęta U-15', sport: 'football', category: 'U-15', season: SEASON, colorAccent: '#10B981' },
  { id: 't3', name: 'Wisła Basket', sport: 'basketball', category: 'Juniorzy', season: SEASON, colorAccent: '#EA580C' },
];

function p(
  id: string,
  teamId: string,
  firstName: string,
  lastName: string,
  number: number,
  position: string,
  birthYear: number,
  ratings: Player['ratings'],
  status: Player['status'] = 'available',
): Player {
  return { id, teamId, firstName, lastName, number, position, birthYear, ratings, status };
}

export const PLAYERS: Player[] = [
  p('p1', 't1', 'Marek', 'Kowalski', 1, 'Bramkarz', 1998, { fitness: 78, technique: 72, tactics: 80, mentality: 85 }),
  p('p2', 't1', 'Jan', 'Nowak', 4, 'Obrońca', 1996, { fitness: 82, technique: 70, tactics: 78, mentality: 76 }),
  p('p3', 't1', 'Piotr', 'Wiśniewski', 8, 'Pomocnik', 1999, { fitness: 88, technique: 84, tactics: 82, mentality: 80 }),
  p('p4', 't1', 'Tomasz', 'Lewandowski', 9, 'Napastnik', 2000, { fitness: 90, technique: 89, tactics: 76, mentality: 88 }),
  p('p5', 't1', 'Adam', 'Zieliński', 11, 'Napastnik', 2001, { fitness: 85, technique: 80, tactics: 72, mentality: 75 }, 'injured'),
  p('p6', 't2', 'Kacper', 'Wójcik', 7, 'Pomocnik', 2010, { fitness: 70, technique: 68, tactics: 60, mentality: 72 }),
  p('p7', 't2', 'Igor', 'Kamiński', 10, 'Napastnik', 2010, { fitness: 74, technique: 75, tactics: 58, mentality: 70 }),
  p('p8', 't3', 'Bartosz', 'Mazur', 23, 'Rozgrywający', 2005, { fitness: 80, technique: 82, tactics: 78, mentality: 79 }),
  p('p9', 't3', 'Filip', 'Krawczyk', 12, 'Środkowy', 2004, { fitness: 84, technique: 76, tactics: 74, mentality: 77 }, 'suspended'),
];

function daysFromNow(days: number, hour: number, min = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
}

export const EVENTS: CoachEvent[] = [
  { id: 'e1', teamId: 't1', type: 'training', title: 'Trening – taktyka', date: daysFromNow(0, 18), location: 'Boisko główne' },
  { id: 'e2', teamId: 't1', type: 'match', title: 'Mecz ligowy', date: daysFromNow(2, 16), location: 'Stadion miejski', opponent: 'Legia II' },
  { id: 'e3', teamId: 't2', type: 'training', title: 'Trening – technika', date: daysFromNow(1, 17), location: 'Orlik' },
  { id: 'e4', teamId: 't3', type: 'match', title: 'Puchar – 1/8 finału', date: daysFromNow(3, 19), location: 'Hala Sportowa', opponent: 'Zagłębie' },
  { id: 'e5', teamId: 't1', type: 'training', title: 'Trening – kondycja', date: daysFromNow(4, 18), location: 'Boisko boczne' },
];
