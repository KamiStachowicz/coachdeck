import type {
  Sport,
  SportId,
  Team,
  Player,
  PlayerCore,
  CoachEvent,
  Payment,
  PaymentKind,
  FormationSlot,
  StandingRow,
  MatchResult,
  ScoutTarget,
  TrainingGoal,
  PersonalRecord,
  SessionPackage,
  BodyMeasurement,
  Registration,
  Camp,
  Announcement,
  DirectoryCoach,
  Review,
  SlotBooking,
  ChatThread,
} from './types';

/** Specjalizacje trenera personalnego. */
export const SPECIALIZATIONS = [
  'Siłownia',
  'Przygotowanie motoryczne',
  'Redukcja masy',
  'Budowa masy',
  'Dietetyka',
  'Fitness',
  'Rehabilitacja',
  'Trening funkcjonalny',
];

/** Kolory do brandingu klubu. */
export const BRAND_COLORS = ['#059669', '#2563EB', '#DC2626', '#7C3AED', '#EA580C', '#0891B2', '#DB2777', '#CA8A04'];
/** Emoji-logo do wyboru. */
export const CLUB_EMOJIS = ['🦅', '⚽', '🏀', '🐬', '🦁', '🐺', '🔥', '⭐', '🛡️', '🏆'];

/** Kategorie wagowe – wspólne dla sportów walki. */
const WEIGHT_CLASSES = ['Musza', 'Kogucia', 'Piórkowa', 'Lekka', 'Półśrednia', 'Średnia', 'Półciężka', 'Ciężka'];

/** Sporty zespołowe (mają skład/formację, gole itd.) vs indywidualne. */
export function isTeamSport(sport: SportId): boolean {
  return ['football', 'basketball', 'volleyball', 'handball', 'hockey'].includes(sport);
}

/** Sporty walki – dla nagłówków/etykiet trenera indywidualnego. */
export function isCombatSport(sport: SportId): boolean {
  return ['boxing', 'mma', 'kickboxing', 'judo', 'karate', 'bjj', 'wrestling', 'taekwondo'].includes(sport);
}

/** Lista dyscyplin dopasowana do profilu trenera. */
export function sportsForProfile(profile: 'team' | 'individual' | 'personal' | null): Sport[] {
  if (profile === 'team') return SPORTS.filter((s) => isTeamSport(s.id));
  if (profile === 'individual') return SPORTS.filter((s) => !isTeamSport(s.id));
  return SPORTS;
}

export const SPORTS: Sport[] = [
  { id: 'football', name: 'Piłka nożna', icon: 'football-outline', color: '#059669', positions: ['Bramkarz', 'Obrońca', 'Pomocnik', 'Napastnik'] },
  { id: 'basketball', name: 'Koszykówka', icon: 'basketball-outline', color: '#EA580C', positions: ['Rozgrywający', 'Rzucający obrońca', 'Niski skrzydłowy', 'Silny skrzydłowy', 'Środkowy'] },
  { id: 'volleyball', name: 'Siatkówka', icon: 'tennisball-outline', color: '#2563EB', positions: ['Rozgrywający', 'Atakujący', 'Środkowy', 'Przyjmujący', 'Libero'] },
  { id: 'handball', name: 'Piłka ręczna', icon: 'hand-left-outline', color: '#7C3AED', positions: ['Bramkarz', 'Skrzydłowy', 'Rozgrywający', 'Obrotowy'] },
  { id: 'tennis', name: 'Tenis', icon: 'tennisball-outline', color: '#CA8A04', positions: ['Singiel', 'Debel'] },
  { id: 'athletics', name: 'Lekkoatletyka', icon: 'walk-outline', color: '#DB2777', positions: ['Sprint', 'Średnie', 'Długie', 'Skoki', 'Rzuty'] },
  { id: 'swimming', name: 'Pływanie', icon: 'water-outline', color: '#0891B2', positions: ['Kraul', 'Grzbiet', 'Klasyk', 'Motylek'] },
  { id: 'hockey', name: 'Hokej', icon: 'snow-outline', color: '#4F46E5', positions: ['Bramkarz', 'Obrońca', 'Napastnik'] },
  // Sporty walki
  { id: 'boxing', name: 'Boks', icon: 'hand-left-outline', color: '#B91C1C', positions: WEIGHT_CLASSES },
  { id: 'mma', name: 'MMA', icon: 'flame-outline', color: '#DC2626', positions: WEIGHT_CLASSES },
  { id: 'kickboxing', name: 'Kickboxing', icon: 'hand-right-outline', color: '#E11D48', positions: WEIGHT_CLASSES },
  { id: 'judo', name: 'Judo', icon: 'body-outline', color: '#4338CA', positions: WEIGHT_CLASSES },
  { id: 'karate', name: 'Karate', icon: 'body-outline', color: '#EA580C', positions: ['Kata', 'Kumite'] },
  { id: 'bjj', name: 'BJJ (jiu-jitsu)', icon: 'body-outline', color: '#1D4ED8', positions: ['Biały', 'Niebieski', 'Fioletowy', 'Brązowy', 'Czarny'] },
  { id: 'wrestling', name: 'Zapasy', icon: 'body-outline', color: '#7C3AED', positions: WEIGHT_CLASSES },
  { id: 'taekwondo', name: 'Taekwondo', icon: 'footsteps-outline', color: '#0D9488', positions: ['Poomsae', 'Kyorugi'] },
  // Inne indywidualne
  { id: 'gymnastics', name: 'Gimnastyka', icon: 'accessibility-outline', color: '#9333EA', positions: ['Wielobój', 'Wolne', 'Skok', 'Poręcze', 'Równoważnia'] },
  { id: 'cycling', name: 'Kolarstwo', icon: 'bicycle-outline', color: '#16A34A', positions: ['Szosa', 'Góral (MTB)', 'Tor', 'Przełaj'] },
];

export function getSport(id: string) {
  return SPORTS.find((s) => s.id === id) ?? SPORTS[0];
}

export const SEASON = '2025/2026';

export const TEAMS: Team[] = [
  { id: 't1', name: 'Orły Warszawa', sport: 'football', category: 'Seniorzy', season: SEASON, colorAccent: '#059669' },
  { id: 't2', name: 'Orlęta U-15', sport: 'football', category: 'U-15', season: SEASON, colorAccent: '#10B981' },
  { id: 't3', name: 'Wisła Basket', sport: 'basketball', category: 'Juniorzy', season: SEASON, colorAccent: '#EA580C' },
  { id: 't4', name: 'Delfiny Kraków', sport: 'swimming', category: 'Open', season: SEASON, colorAccent: '#0891B2' },
  { id: 't5', name: 'LKS Sokół – LA', sport: 'athletics', category: 'Juniorzy', season: SEASON, colorAccent: '#DB2777' },
  { id: 't6', name: 'Fight Club Kraków', sport: 'boxing', category: 'Seniorzy', season: SEASON, colorAccent: '#B91C1C' },
];

function p(
  id: string,
  teamId: string,
  firstName: string,
  lastName: string,
  number: number,
  position: string,
  birthYear: number,
  ratings: PlayerCore['ratings'],
  status: PlayerCore['status'] = 'available',
): PlayerCore {
  return { id, teamId, firstName, lastName, number, position, birthYear, ratings, status };
}

export function overallOf(r: PlayerCore['ratings']): number {
  return Math.round((r.fitness + r.technique + r.tactics + r.mentality) / 4);
}

/** Deterministyczny pseudolosowy 0–1 na podstawie tekstu (stabilny między odświeżeniami). */
function seededRand(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const MONTHS = ['Wrz', 'Paź', 'Lis', 'Gru', 'Sty', 'Lut'];

/** Uzupełnia zawodnika o atrybuty w stylu Football Managera (deterministycznie). */
export function enrichPlayer(base: PlayerCore): Player {
  const rnd = seededRand(base.id);
  const overall = overallOf(base.ratings);
  const age = base.birthYear ? new Date().getFullYear() - base.birthYear : 24;

  // Potencjał: młodsi mają większy zapas.
  const youthBonus = Math.max(0, 22 - Math.max(0, age - 16));
  const potential = Math.min(99, overall + Math.round(youthBonus * (0.5 + rnd() * 0.6)));

  const moraleRoll = rnd();
  const morale: Player['morale'] =
    base.status === 'injured' || base.status === 'suspended'
      ? 'low'
      : moraleRoll > 0.66
        ? 'high'
        : moraleRoll > 0.25
          ? 'ok'
          : 'low';

  const condition =
    base.status === 'injured' ? 25 + Math.round(rnd() * 20) : 80 + Math.round(rnd() * 20);

  // Wartość rynkowa (zabawowo): rośnie z oceną i potencjałem, spada z wiekiem.
  const value = Math.round(
    (overall ** 2 * (1 + (potential - overall) / 40) * (age < 23 ? 1.4 : age > 30 ? 0.6 : 1)) * 90,
  );

  const apps = 4 + Math.floor(rnd() * 12);
  const isFwd = (base.position ?? '').match(/Napastnik|skrzyd|Atakuj|Rozgryw/i);
  const goals = isFwd ? Math.floor(rnd() * apps * 0.8) : Math.floor(rnd() * apps * 0.25);
  const assists = Math.floor(rnd() * apps * 0.4);
  const minutes = apps * (55 + Math.floor(rnd() * 35));
  const yellow = Math.floor(rnd() * 4);
  const red = rnd() > 0.9 ? 1 : 0;
  const avgRating = Math.round((5.8 + (overall / 100) * 3.5 + rnd() * 0.4) * 10) / 10;

  const form = Array.from({ length: 5 }, () => {
    const v = avgRating + (rnd() - 0.5) * 2.2;
    return Math.max(4, Math.min(10, Math.round(v * 10) / 10));
  });

  const development = MONTHS.map((label, i) => {
    const progress = (i / (MONTHS.length - 1)) * Math.min(6, potential - overall + 3);
    return { label, overall: Math.round(overall - (Math.min(6, potential - overall + 3) - progress)) };
  });

  const foot: Player['foot'] = rnd() > 0.85 ? 'both' : rnd() > 0.35 ? 'R' : 'L';

  return {
    ...base,
    potential,
    morale,
    condition,
    value,
    foot,
    captain: false,
    stats: { apps, goals, assists, minutes, yellow, red, avgRating },
    form,
    development,
  };
}

const RAW_PLAYERS: PlayerCore[] = [
  p('p1', 't1', 'Marek', 'Kowalski', 1, 'Bramkarz', 1998, { fitness: 78, technique: 72, tactics: 80, mentality: 85 }),
  p('p2', 't1', 'Jan', 'Nowak', 4, 'Obrońca', 1996, { fitness: 82, technique: 70, tactics: 78, mentality: 76 }),
  p('p3', 't1', 'Piotr', 'Wiśniewski', 8, 'Pomocnik', 1999, { fitness: 88, technique: 84, tactics: 82, mentality: 80 }),
  p('p4', 't1', 'Tomasz', 'Lewandowski', 9, 'Napastnik', 2000, { fitness: 90, technique: 89, tactics: 76, mentality: 88 }),
  p('p5', 't1', 'Adam', 'Zieliński', 11, 'Napastnik', 2001, { fitness: 85, technique: 80, tactics: 72, mentality: 75 }, 'injured'),
  p('p6', 't2', 'Kacper', 'Wójcik', 7, 'Pomocnik', 2010, { fitness: 70, technique: 68, tactics: 60, mentality: 72 }),
  p('p7', 't2', 'Igor', 'Kamiński', 10, 'Napastnik', 2010, { fitness: 74, technique: 75, tactics: 58, mentality: 70 }),
  p('p8', 't3', 'Bartosz', 'Mazur', 23, 'Rozgrywający', 2005, { fitness: 80, technique: 82, tactics: 78, mentality: 79 }),
  p('p9', 't3', 'Filip', 'Krawczyk', 12, 'Środkowy', 2004, { fitness: 84, technique: 76, tactics: 74, mentality: 77 }, 'suspended'),
  // Pływacy (Delfiny Kraków)
  p('p10', 't4', 'Zofia', 'Lis', 0, 'Kraul', 2006, { fitness: 88, technique: 85, tactics: 70, mentality: 84 }),
  p('p11', 't4', 'Antoni', 'Duda', 0, 'Klasyk', 2005, { fitness: 86, technique: 82, tactics: 68, mentality: 80 }),
  p('p12', 't4', 'Maja', 'Sawicka', 0, 'Motylek', 2007, { fitness: 84, technique: 88, tactics: 66, mentality: 82 }),
  // Lekkoatleci (LKS Sokół – LA)
  p('p13', 't5', 'Jakub', 'Ostrowski', 0, 'Sprint', 2006, { fitness: 90, technique: 78, tactics: 60, mentality: 83 }),
  p('p14', 't5', 'Lena', 'Górska', 0, 'Skoki', 2007, { fitness: 87, technique: 84, tactics: 62, mentality: 80 }),
  // Zawodnicy sportów walki (Fight Club Kraków)
  p('p15', 't6', 'Damian', 'Kruk', 0, 'Półśrednia', 1997, { fitness: 89, technique: 86, tactics: 82, mentality: 88 }),
  p('p16', 't6', 'Wiktor', 'Baran', 0, 'Średnia', 1999, { fitness: 87, technique: 83, tactics: 79, mentality: 84 }),
  p('p17', 't6', 'Nikola', 'Rutkowska', 0, 'Lekka', 2001, { fitness: 85, technique: 88, tactics: 80, mentality: 86 }),
  p('p18', 't6', 'Oskar', 'Pawlak', 0, 'Ciężka', 1995, { fitness: 84, technique: 79, tactics: 77, mentality: 82 }, 'injured'),
];

export const PLAYERS: Player[] = RAW_PLAYERS.map(enrichPlayer);
// Kapitanowie (po jednym na drużynę seniorską).
for (const cap of ['p3', 'p8']) {
  const pl = PLAYERS.find((x) => x.id === cap);
  if (pl) pl.captain = true;
}

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
  { id: 'e6', teamId: 't6', type: 'training', title: 'Sparingi + praca na łapach', date: daysFromNow(1, 19), location: 'Sala bokserska' },
  { id: 'e7', teamId: 't6', type: 'match', title: 'Gala – walka wieczoru', date: daysFromNow(5, 20), location: 'Arena Kraków', opponent: 'Team Rebel' },
];

/** Klucz slotu grafiku: `${rok}-${miesiąc}-${dzień}T${godzina}` (spójny z dayKey z MonthCalendar). */
export function slotKeyFromDate(d: Date, hour: number): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}T${hour}`;
}
function slotKeyIn(daysFromToday: number, hour: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromToday);
  return slotKeyFromDate(d, hour);
}

/** Wolne godziny zaznaczone przez trenera (demo – startowa dostępność). */
export const INITIAL_AVAILABILITY: string[] = [
  slotKeyIn(1, 16), slotKeyIn(1, 17), slotKeyIn(1, 18), slotKeyIn(1, 19),
  slotKeyIn(2, 9), slotKeyIn(2, 10), slotKeyIn(2, 17), slotKeyIn(2, 18),
  slotKeyIn(3, 16), slotKeyIn(3, 17), slotKeyIn(3, 18),
];

/**
 * Deterministyczne terminy trenera z katalogu (dla demo trenerów dc1–dc6).
 * Zwraca godziny oferowane danego dnia wraz z informacją, czy są już zaklepane.
 * Stabilne między odświeżeniami (seed = coachId + dzień).
 */
export function coachDaySlots(coachId: string, date: Date): { hour: number; booked: boolean }[] {
  const dk = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  const rnd = seededRand(`${coachId}|${dk}`);
  const pool = [9, 10, 11, 12, 16, 17, 18, 19, 20];
  const out: { hour: number; booked: boolean }[] = [];
  for (const h of pool) {
    if (rnd() > 0.55) out.push({ hour: h, booked: rnd() > 0.7 });
  }
  return out;
}

/** Sloty już zaklepane przez klientów (pokazywane na szaro). */
export const SLOT_BOOKINGS: SlotBooking[] = [
  { id: 'sb1', slotKey: slotKeyIn(1, 17), clientName: 'Kuba N.', date: daysFromNow(0, 12) },
  { id: 'sb2', slotKey: slotKeyIn(1, 18), clientName: 'Ola W.', date: daysFromNow(0, 12) },
  { id: 'sb3', slotKey: slotKeyIn(2, 10), clientName: 'Marek P.', date: daysFromNow(0, 12) },
  { id: 'sb4', slotKey: slotKeyIn(3, 16), clientName: 'Zofia L.', date: daysFromNow(0, 12) },
];

export const PAYMENT_KINDS: Record<
  PaymentKind,
  { label: string; icon: string; color: string }
> = {
  dues: { label: 'Składka', icon: 'repeat-outline', color: '#059669' },
  class: { label: 'Zajęcia', icon: 'barbell-outline', color: '#3B82F6' },
  camp: { label: 'Obóz', icon: 'bonfire-outline', color: '#F97316' },
  equipment: { label: 'Sprzęt', icon: 'shirt-outline', color: '#7C3AED' },
  other: { label: 'Inne', icon: 'cash-outline', color: '#64748B' },
};

function payDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
}

export const PAYMENTS: Payment[] = [
  { id: 'pay1', playerId: 'p1', teamId: 't1', kind: 'dues', title: 'Składka miesięczna', amount: 120, dueDate: payDate(-5), paidDate: payDate(-6), status: 'paid' },
  { id: 'pay2', playerId: 'p2', teamId: 't1', kind: 'dues', title: 'Składka miesięczna', amount: 120, dueDate: payDate(3), status: 'pending' },
  { id: 'pay3', playerId: 'p3', teamId: 't1', kind: 'dues', title: 'Składka miesięczna', amount: 120, dueDate: payDate(-8), status: 'overdue' },
  { id: 'pay4', playerId: 'p4', teamId: 't1', kind: 'camp', title: 'Obóz letni – zaliczka', amount: 400, dueDate: payDate(10), status: 'pending' },
  { id: 'pay5', playerId: 'p6', teamId: 't2', kind: 'dues', title: 'Składka miesięczna', amount: 90, dueDate: payDate(-3), status: 'overdue' },
  { id: 'pay6', playerId: 'p7', teamId: 't2', kind: 'class', title: 'Dodatkowe zajęcia techniczne', amount: 60, dueDate: payDate(-1), paidDate: payDate(-1), status: 'paid' },
  { id: 'pay7', playerId: 'p8', teamId: 't3', kind: 'dues', title: 'Składka miesięczna', amount: 150, dueDate: payDate(5), status: 'pending' },
  { id: 'pay8', playerId: 'p9', teamId: 't3', kind: 'equipment', title: 'Komplet strojów', amount: 220, dueDate: payDate(-2), status: 'overdue' },
];

/* ---------- Taktyka: formacje ---------- */
// y: 92 = własna bramka (dół), 8 = pole rywala (góra). x: 50 = środek.
export const FORMATIONS: Record<string, FormationSlot[]> = {
  '4-4-2': [
    { role: 'BR', x: 50, y: 92 },
    { role: 'LO', x: 18, y: 72 },
    { role: 'ŚO', x: 39, y: 76 },
    { role: 'ŚO', x: 61, y: 76 },
    { role: 'PO', x: 82, y: 72 },
    { role: 'LP', x: 18, y: 46 },
    { role: 'ŚP', x: 39, y: 50 },
    { role: 'ŚP', x: 61, y: 50 },
    { role: 'PP', x: 82, y: 46 },
    { role: 'NA', x: 39, y: 22 },
    { role: 'NA', x: 61, y: 22 },
  ],
  '4-3-3': [
    { role: 'BR', x: 50, y: 92 },
    { role: 'LO', x: 18, y: 72 },
    { role: 'ŚO', x: 39, y: 76 },
    { role: 'ŚO', x: 61, y: 76 },
    { role: 'PO', x: 82, y: 72 },
    { role: 'ŚP', x: 30, y: 52 },
    { role: 'ŚP', x: 50, y: 56 },
    { role: 'ŚP', x: 70, y: 52 },
    { role: 'LS', x: 20, y: 24 },
    { role: 'NA', x: 50, y: 20 },
    { role: 'PS', x: 80, y: 24 },
  ],
  '3-5-2': [
    { role: 'BR', x: 50, y: 92 },
    { role: 'ŚO', x: 30, y: 76 },
    { role: 'ŚO', x: 50, y: 78 },
    { role: 'ŚO', x: 70, y: 76 },
    { role: 'LW', x: 12, y: 50 },
    { role: 'ŚP', x: 35, y: 54 },
    { role: 'ŚP', x: 50, y: 58 },
    { role: 'ŚP', x: 65, y: 54 },
    { role: 'PW', x: 88, y: 50 },
    { role: 'NA', x: 39, y: 22 },
    { role: 'NA', x: 61, y: 22 },
  ],
  '4-2-3-1': [
    { role: 'BR', x: 50, y: 92 },
    { role: 'LO', x: 18, y: 74 },
    { role: 'ŚO', x: 39, y: 78 },
    { role: 'ŚO', x: 61, y: 78 },
    { role: 'PO', x: 82, y: 74 },
    { role: 'DP', x: 38, y: 58 },
    { role: 'DP', x: 62, y: 58 },
    { role: 'LS', x: 20, y: 36 },
    { role: 'OP', x: 50, y: 38 },
    { role: 'PS', x: 80, y: 36 },
    { role: 'NA', x: 50, y: 16 },
  ],
};

export const FORMATION_NAMES = Object.keys(FORMATIONS);

/* ---------- Liga: tabela i wyniki (dla drużyny seniorskiej t1) ---------- */

export const STANDINGS: StandingRow[] = [
  { teamId: 'r1', name: 'Legia II', played: 12, won: 9, drawn: 2, lost: 1, goalsFor: 28, goalsAgainst: 9, points: 29 },
  { teamId: 'me', name: 'Orły Warszawa', played: 12, won: 8, drawn: 2, lost: 2, goalsFor: 25, goalsAgainst: 12, points: 26 },
  { teamId: 'r2', name: 'Polonia', played: 12, won: 7, drawn: 3, lost: 2, goalsFor: 22, goalsAgainst: 14, points: 24 },
  { teamId: 'r3', name: 'Znicz', played: 12, won: 6, drawn: 2, lost: 4, goalsFor: 19, goalsAgainst: 16, points: 20 },
  { teamId: 'r4', name: 'Radomiak II', played: 12, won: 5, drawn: 3, lost: 4, goalsFor: 17, goalsAgainst: 15, points: 18 },
  { teamId: 'r5', name: 'Ursus', played: 12, won: 4, drawn: 4, lost: 4, goalsFor: 15, goalsAgainst: 16, points: 16 },
  { teamId: 'r6', name: 'Świt', played: 12, won: 3, drawn: 3, lost: 6, goalsFor: 12, goalsAgainst: 19, points: 12 },
  { teamId: 'r7', name: 'Dolcan', played: 12, won: 2, drawn: 2, lost: 8, goalsFor: 10, goalsAgainst: 24, points: 8 },
  { teamId: 'r8', name: 'Mazur', played: 12, won: 1, drawn: 2, lost: 9, goalsFor: 8, goalsAgainst: 31, points: 5 },
];

export const RESULTS: MatchResult[] = [
  { id: 'm1', teamId: 't1', opponent: 'Polonia', date: payDate(-28), home: true, goalsFor: 3, goalsAgainst: 1, competition: 'Liga' },
  { id: 'm2', teamId: 't1', opponent: 'Znicz', date: payDate(-21), home: false, goalsFor: 2, goalsAgainst: 2, competition: 'Liga' },
  { id: 'm3', teamId: 't1', opponent: 'Ursus', date: payDate(-14), home: true, goalsFor: 1, goalsAgainst: 0, competition: 'Liga' },
  { id: 'm4', teamId: 't1', opponent: 'Legia II', date: payDate(-7), home: false, goalsFor: 0, goalsAgainst: 2, competition: 'Liga' },
  { id: 'm5', teamId: 't1', opponent: 'Świt', date: payDate(-3), home: true, goalsFor: 4, goalsAgainst: 1, competition: 'Puchar' },
];

/* ---------- Rekordy życiowe (dyscypliny indywidualne) ---------- */

export const PERSONAL_RECORDS: PersonalRecord[] = [
  // Zofia – progres na 100 m kraul (czasy spadają = poprawa)
  { id: 'r1', playerId: 'p10', event: '100 m kraul', result: '1:01.20', date: payDate(-60) },
  { id: 'r1b', playerId: 'p10', event: '100 m kraul', result: '0:59.70', date: payDate(-35) },
  { id: 'r1c', playerId: 'p10', event: '100 m kraul', result: '0:58.30', date: payDate(-8) },
  { id: 'r2', playerId: 'p10', event: '200 m kraul', result: '2:09.80', date: payDate(-6) },
  { id: 'r3', playerId: 'p11', event: '100 m klasyczny', result: '1:07.40', date: payDate(-13) },
  { id: 'r4', playerId: 'p12', event: '100 m motylkowy', result: '1:03.10', date: payDate(-9) },
  { id: 'r5', playerId: 'p13', event: '100 m', result: '11.24 s', date: payDate(-15) },
  { id: 'r6', playerId: 'p13', event: '200 m', result: '22.90 s', date: payDate(-2) },
  { id: 'r7', playerId: 'p14', event: 'Skok w dal', result: '5.85 m', date: payDate(-11) },
];

/* ---------- Trener personalny: karnety i pomiary (demo) ---------- */

export const SESSION_PACKAGES: SessionPackage[] = [
  { id: 'pk1', clientId: 'p4', name: 'Karnet 10 wejść', total: 10, used: 6, price: 600, date: payDate(-25) },
  { id: 'pk2', clientId: 'p10', name: 'Karnet 8 wejść', total: 8, used: 2, price: 520, date: payDate(-12) },
  { id: 'pk3', clientId: 'p3', name: 'Pakiet miesięczny', total: 12, used: 11, price: 700, date: payDate(-20) },
];

export const MEASUREMENTS: BodyMeasurement[] = [
  { id: 'bm1', clientId: 'p4', weightKg: 82.0, date: payDate(-60) },
  { id: 'bm2', clientId: 'p4', weightKg: 80.5, date: payDate(-35) },
  { id: 'bm3', clientId: 'p4', weightKg: 79.2, date: payDate(-10) },
  { id: 'bm4', clientId: 'p10', weightKg: 61.0, date: payDate(-40) },
  { id: 'bm5', clientId: 'p10', weightKg: 60.2, date: payDate(-12) },
];

/* ---------- Sprzedaż: nabór i obozy (demo) ---------- */

export const REGISTRATIONS: Registration[] = [
  { id: 'rg1', teamId: 't2', firstName: 'Szymon', lastName: 'Wróbel', contact: '600 100 200', fee: 150, paid: false, status: 'new', date: payDate(-2) },
  { id: 'rg2', teamId: 't2', firstName: 'Aleks', lastName: 'Nowicki', contact: 'rodzic@mail.pl', fee: 150, paid: true, status: 'new', date: payDate(-1) },
  { id: 'rg3', teamId: 't4', firstName: 'Nadia', lastName: 'Kot', contact: '511 222 333', fee: 120, paid: false, status: 'new', date: payDate(-4) },
];

export const CAMPS: Camp[] = [
  { id: 'cmp1', title: 'Obóz letni – Zakopane', location: 'Zakopane', dateRange: '1–8 lipca', price: 1800, deposit: 400, capacity: 30, signups: 22 },
  { id: 'cmp2', title: 'Camp pływacki', location: 'Spała', dateRange: '15–20 sierpnia', price: 1400, deposit: 300, capacity: 20, signups: 20 },
  { id: 'cmp3', title: 'Turniej weekendowy', location: 'Łódź', dateRange: '12–13 października', price: 250, deposit: 100, capacity: 40, signups: 12 },
];

export const ANNOUNCEMENTS: Announcement[] = [
  { id: 'an1', title: 'Zmiana godziny treningu', body: 'W czwartek trening zaczynamy o 17:30 zamiast 18:00. Prosimy o punktualność.', date: payDate(-1), pinned: true },
  { id: 'an2', teamId: 't1', title: 'Mecz wyjazdowy', body: 'Zbiórka w sobotę o 13:00 pod klubem. Zabierzcie dwa komplety strojów.', date: payDate(-3), pinned: false },
  { id: 'an3', title: 'Składki za wrzesień', body: 'Przypominamy o opłaceniu składek do końca tygodnia. Można online w aplikacji.', date: payDate(-5), pinned: false },
];

/* ---------- Czat trener ↔ rodzic/klient (demo) ---------- */

const H = 3600000;
export const CHAT_THREADS: ChatThread[] = [
  {
    id: 'ch1',
    name: 'Mama Kacpra',
    role: 'Rodzic · Orlęta U-15',
    color: '#059669',
    messages: [
      { id: 'm1', from: 'client', text: 'Dzień dobry! Czy Kacper będzie grał w sobotę?', ts: Date.now() - 26 * H },
      { id: 'm2', from: 'coach', text: 'Dzień dobry! Tak, jest w kadrze meczowej. Zbiórka 13:00 pod klubem.', ts: Date.now() - 25 * H },
      { id: 'm3', from: 'client', text: 'Super, dziękuję! Będzie na pewno.', ts: Date.now() - 25 * H + 5 * 60000 },
    ],
  },
  {
    id: 'ch2',
    name: 'Anna (klient)',
    role: 'Trening personalny',
    color: '#F97316',
    messages: [
      { id: 'm4', from: 'client', text: 'Cześć, możemy przełożyć wtorkowy trening na środę?', ts: Date.now() - 4 * H },
      { id: 'm5', from: 'coach', text: 'Jasne, środa 18:00 wolna. Rezerwuję.', ts: Date.now() - 3 * H },
    ],
  },
  {
    id: 'ch3',
    name: 'Tata Igora',
    role: 'Rodzic · Orlęta U-15',
    color: '#2563EB',
    messages: [
      { id: 'm6', from: 'client', text: 'Czy jest zniżka przy dwójce dzieci w klubie?', ts: Date.now() - 50 * H },
    ],
  },
];

/* ---------- Katalog trenerów (demo) ---------- */

export const DIRECTORY_COACHES: DirectoryCoach[] = [
  { id: 'dc1', name: 'Anna Kowalczyk', discipline: 'Trener personalny', city: 'Warszawa · Mokotów', rating: 4.9, reviewsCount: 47, pricePerHour: 120, bio: 'Redukcja masy i trening funkcjonalny. 8 lat doświadczenia.', color: '#F97316' },
  { id: 'dc2', name: 'Marcin Zawada', discipline: 'Piłka nożna', city: 'Warszawa · Ursynów', rating: 4.7, reviewsCount: 31, pricePerHour: 90, bio: 'Trener UEFA B, praca z młodzieżą i technika indywidualna.', color: '#059669' },
  { id: 'dc3', name: 'Katarzyna Lewicka', discipline: 'Pływanie', city: 'Warszawa · Wola', rating: 5.0, reviewsCount: 63, pricePerHour: 110, bio: 'Nauka i doskonalenie pływania, przygotowanie do zawodów.', color: '#0891B2' },
  { id: 'dc4', name: 'Paweł Nowak', discipline: 'Przygotowanie motoryczne', city: 'Warszawa · Praga', rating: 4.6, reviewsCount: 22, pricePerHour: 130, bio: 'Przygotowanie motoryczne sportowców, prewencja urazów.', color: '#7C3AED' },
  { id: 'dc5', name: 'Julia Dąbrowska', discipline: 'Tenis', city: 'Warszawa · Bemowo', rating: 4.8, reviewsCount: 18, pricePerHour: 140, bio: 'Tenis dla dzieci i dorosłych, każdy poziom.', color: '#CA8A04' },
  { id: 'dc6', name: 'Tomasz Wójcik', discipline: 'Lekkoatletyka', city: 'Warszawa · Bielany', rating: 4.5, reviewsCount: 14, pricePerHour: 100, bio: 'Sprint i skoki, przygotowanie do egzaminów sprawnościowych.', color: '#DB2777' },
];

export const REVIEWS: Review[] = [
  { id: 'rv1', coachId: 'dc1', author: 'Ewa M.', rating: 5, text: 'Świetne podejście, schudłam 8 kg w 3 miesiące!', date: payDate(-10) },
  { id: 'rv2', coachId: 'dc1', author: 'Rafał K.', rating: 5, text: 'Profesjonalizm i motywacja na najwyższym poziomie.', date: payDate(-25) },
  { id: 'rv3', coachId: 'dc1', author: 'Ania', rating: 4, text: 'Bardzo dobre treningi, polecam.', date: payDate(-40) },
  { id: 'rv4', coachId: 'dc3', author: 'Marek', rating: 5, text: 'Córka nauczyła się pływać w miesiąc. Super!', date: payDate(-8) },
  { id: 'rv5', coachId: 'dc2', author: 'Grzegorz', rating: 5, text: 'Syn zrobił ogromne postępy technicznie.', date: payDate(-15) },
];

/** Parsuje wynik do liczby (mm:ss → sekundy; „6.20 m" → 6.20). */
export function parseRecordValue(result: string): number | null {
  const t = result.match(/(\d+):(\d+(?:\.\d+)?)/);
  if (t) return parseInt(t[1], 10) * 60 + parseFloat(t[2]);
  const n = result.match(/(\d+(?:[.,]\d+)?)/);
  return n ? parseFloat(n[1].replace(',', '.')) : null;
}

/** Czy niższy wynik jest lepszy (czasy) vs wyższy (odległości). */
export function lowerIsBetter(result: string): boolean {
  if (result.includes(':')) return true; // czas mm:ss
  if (/\bs\b|sek|s$/i.test(result)) return true; // sekundy
  return false; // metry, punkty itp. – wyżej lepiej
}

/* ---------- Skauting: obserwowani zawodnicy ---------- */

export const SCOUT_TARGETS: ScoutTarget[] = [
  { id: 's1', firstName: 'Mateusz', lastName: 'Górski', position: 'Napastnik', sport: 'football', age: 19, overall: 78, potential: 88, value: 950000, club: 'Stal Rzeszów', ratings: { fitness: 82, technique: 80, tactics: 70, mentality: 79 }, watched: true },
  { id: 's2', firstName: 'Dawid', lastName: 'Sikora', position: 'Pomocnik', sport: 'football', age: 21, overall: 75, potential: 82, value: 620000, club: 'Motor Lublin', ratings: { fitness: 78, technique: 79, tactics: 74, mentality: 70 }, watched: false },
  { id: 's3', firstName: 'Oskar', lastName: 'Baran', position: 'Obrońca', sport: 'football', age: 18, overall: 71, potential: 86, value: 480000, club: 'Widzew II', ratings: { fitness: 80, technique: 66, tactics: 72, mentality: 68 }, watched: false },
  { id: 's4', firstName: 'Nikodem', lastName: 'Pawlak', position: 'Bramkarz', sport: 'football', age: 22, overall: 76, potential: 80, value: 400000, club: 'GKS Katowice', ratings: { fitness: 74, technique: 70, tactics: 78, mentality: 82 }, watched: false },
  { id: 's5', firstName: 'Szymon', lastName: 'Adamczyk', position: 'Rozgrywający', sport: 'basketball', age: 20, overall: 79, potential: 85, value: 300000, club: 'Anwil Junior', ratings: { fitness: 81, technique: 83, tactics: 76, mentality: 77 }, watched: false },
];

/* ---------- Cele treningowe (startowe) ---------- */

export const TRAINING_GOALS: TrainingGoal[] = [
  { id: 'g1', playerId: 'p4', text: 'Poprawa gry lewą nogą', done: false },
  { id: 'g2', playerId: 'p4', text: 'Utrzymanie formy strzeleckiej', done: true },
  { id: 'g3', playerId: 'p3', text: 'Rozwój przywództwa na boisku', done: false },
  { id: 'g6', playerId: 'p6', text: 'Budowa siły i kondycji', done: false },
];
