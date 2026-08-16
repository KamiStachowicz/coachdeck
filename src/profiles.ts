/**
 * Profile trenera – CoachDeck jako centrum dla różnych typów trenerów.
 * Wybór profilu dopasowuje interfejs (widoczne moduły, nazewnictwo).
 */

export type CoachProfile = 'team' | 'individual' | 'personal';

export interface ProfileConfig {
  id: CoachProfile;
  name: string;
  tagline: string;
  icon: string; // Ionicons
  color: string;
  labels: {
    teamsTab: string; // etykieta zakładki „Drużyny"
    playersTab: string; // etykieta zakładki „Zawodnicy"
    teams: string; // np. „drużyny" / „grupy"
    players: string; // np. „zawodnicy" / „klienci"
  };
  show: {
    tactics: boolean;
    league: boolean;
    scouting: boolean;
  };
}

export const PROFILES: ProfileConfig[] = [
  {
    id: 'team',
    name: 'Trener drużynowy',
    tagline: 'Piłka, koszykówka, siatkówka i inne sporty zespołowe',
    icon: 'shield-half-outline',
    color: '#059669',
    labels: { teamsTab: 'Drużyny', playersTab: 'Zawodnicy', teams: 'drużyny', players: 'zawodnicy' },
    show: { tactics: true, league: true, scouting: true },
  },
  {
    id: 'individual',
    name: 'Trener dyscyplin indywidualnych',
    tagline: 'Pływanie, lekkoatletyka, tenis, sporty walki…',
    icon: 'stopwatch-outline',
    color: '#0891B2',
    labels: { teamsTab: 'Grupy', playersTab: 'Zawodnicy', teams: 'grupy', players: 'zawodnicy' },
    show: { tactics: false, league: false, scouting: false },
  },
  {
    id: 'personal',
    name: 'Trener personalny',
    tagline: 'Klienci indywidualni, plany i sesje treningowe',
    icon: 'barbell-outline',
    color: '#F97316',
    labels: { teamsTab: 'Grupy', playersTab: 'Klienci', teams: 'grupy', players: 'klienci' },
    show: { tactics: false, league: false, scouting: false },
  },
];

export function getProfile(id: CoachProfile | null): ProfileConfig {
  return PROFILES.find((p) => p.id === id) ?? PROFILES[0];
}
