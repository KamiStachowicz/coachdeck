/**
 * Plany subskrypcji, funkcje premium (paywall) i prowizja od składek.
 * Model monetyzacji CoachDeck.
 */

export type PlanId = 'pro' | 'club' | 'premium';

/** Długość darmowego okresu próbnego (dni). */
export const TRIAL_DAYS = 30;

export type FeatureKey =
  | 'tactics'
  | 'stats'
  | 'development'
  | 'scouting'
  | 'proLeague'
  | 'onlinePayments'
  | 'reports'
  | 'multiCoach'
  | 'revenue'
  | 'whiteLabel'
  | 'prioritySupport';

export const FEATURE_LABELS: Record<FeatureKey, string> = {
  tactics: 'Taktyka i skład',
  stats: 'Zaawansowane statystyki',
  development: 'Rozwój zawodnika',
  scouting: 'Skauting i transfery',
  proLeague: 'Ligi zawodowe (API)',
  onlinePayments: 'Płatności online (składki)',
  reports: 'Raporty PDF/Excel',
  multiCoach: 'Wielu trenerów',
  revenue: 'Panel przychodów',
  whiteLabel: 'White-label (logo, kolory)',
  prioritySupport: 'Wsparcie priorytetowe',
};

export interface Plan {
  id: PlanId;
  name: string;
  price: number; // PLN / miesiąc
  tagline: string;
  color: string;
  highlight?: boolean;
  limits: { teams: number | null; playersPerTeam: number | null; coaches: number | null };
  unlocks: FeatureKey[];
}

const proUnlocks: FeatureKey[] = ['tactics', 'stats', 'development', 'scouting', 'proLeague'];
const clubUnlocks: FeatureKey[] = [...proUnlocks, 'onlinePayments', 'reports', 'multiCoach', 'revenue'];
const premiumUnlocks: FeatureKey[] = [...clubUnlocks, 'whiteLabel', 'prioritySupport'];

export const PLANS: Plan[] = [
  {
    id: 'pro',
    name: 'Trener PRO',
    price: 39,
    tagline: 'Dla ambitnego trenera',
    color: '#059669',
    highlight: true,
    limits: { teams: 5, playersPerTeam: null, coaches: 1 },
    unlocks: proUnlocks,
  },
  {
    id: 'club',
    name: 'Klub',
    price: 149,
    tagline: 'Cały klub, wielu trenerów',
    color: '#2563EB',
    limits: { teams: null, playersPerTeam: null, coaches: 10 },
    unlocks: clubUnlocks,
  },
  {
    id: 'premium',
    name: 'Klub Premium',
    price: 349,
    tagline: 'Akademie i duże kluby',
    color: '#7C3AED',
    limits: { teams: null, playersPerTeam: null, coaches: null },
    unlocks: premiumUnlocks,
  },
];

export function getPlan(id: PlanId): Plan {
  return PLANS.find((p) => p.id === id) ?? PLANS[0];
}

/** Prowizja serwisowa doliczana do płatności online (składki). */
export const SERVICE_FEE = {
  percent: 1.5, // %
  min: 1, // min. w PLN
};

export function serviceFee(amount: number): number {
  return Math.max(SERVICE_FEE.min, Math.round(amount * (SERVICE_FEE.percent / 100) * 100) / 100);
}

/** Demonstracyjne subskrypcje platformy (do panelu przychodów). */
export const PLATFORM_SUBSCRIPTIONS: { club: string; plan: PlanId }[] = [
  { club: 'Orły Warszawa', plan: 'club' },
  { club: 'Akademia Wisła', plan: 'premium' },
  { club: 'UKS Sokół', plan: 'pro' },
  { club: 'MKS Basket', plan: 'pro' },
  { club: 'Gwardia', plan: 'club' },
  { club: 'Talent SC', plan: 'pro' },
];
