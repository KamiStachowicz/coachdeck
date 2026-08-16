/**
 * Lekki i18n dla powłoki aplikacji (PL/EN).
 * Ekrany szczegółowe pozostają po polsku – zakres EN rośnie stopniowo.
 */
export type Lang = 'pl' | 'en';

type Dict = Record<string, string>;

const PL: Dict = {
  'tab.home': 'Pulpit',
  'tab.calendar': 'Kalendarz',
  'tab.more': 'Więcej',
  'landing.tagline': 'Centrum dla trenerów i klubów sportowych',
  'landing.f1': 'Zawodnicy, kadra i frekwencja',
  'landing.f2': 'Statystyki, rozwój i taktyka',
  'landing.f3': 'Składki i płatności online',
  'landing.enter': 'Wejdź do aplikacji',
  'landing.profile': 'Profil',
  'landing.change': 'zmień',
  'settings.title': 'Ustawienia',
  'settings.appearance': 'Wygląd',
  'settings.theme': 'Motyw',
  'settings.light': 'Jasny',
  'settings.dark': 'Ciemny',
  'settings.system': 'Systemowy',
  'settings.language': 'Język',
  'settings.branding': 'Branding klubu',
  'settings.clubName': 'Nazwa klubu',
  'settings.accent': 'Kolor przewodni',
  'settings.logo': 'Logo (emoji)',
  'settings.reset': 'Przywróć domyślny kolor',
  'more.settings': 'Ustawienia',
  'more.settingsHint': 'Motyw, język, konto',
  'more.comms': 'Komunikacja',
  'more.commsHint': 'Ogłoszenia do drużyny',
  'more.reports': 'Raporty',
  'more.reportsHint': 'Frekwencja i finanse (PDF)',
};

const EN: Dict = {
  'tab.home': 'Home',
  'tab.calendar': 'Calendar',
  'tab.more': 'More',
  'landing.tagline': 'The hub for coaches and sports clubs',
  'landing.f1': 'Players, squad and attendance',
  'landing.f2': 'Stats, development and tactics',
  'landing.f3': 'Dues and online payments',
  'landing.enter': 'Enter the app',
  'landing.profile': 'Profile',
  'landing.change': 'change',
  'settings.title': 'Settings',
  'settings.appearance': 'Appearance',
  'settings.theme': 'Theme',
  'settings.light': 'Light',
  'settings.dark': 'Dark',
  'settings.system': 'System',
  'settings.language': 'Language',
  'settings.branding': 'Club branding',
  'settings.clubName': 'Club name',
  'settings.accent': 'Accent color',
  'settings.logo': 'Logo (emoji)',
  'settings.reset': 'Reset to default color',
  'more.settings': 'Settings',
  'more.settingsHint': 'Theme, language, account',
  'more.comms': 'Communication',
  'more.commsHint': 'Announcements to the team',
  'more.reports': 'Reports',
  'more.reportsHint': 'Attendance and finance (PDF)',
};

const DICT: Record<Lang, Dict> = { pl: PL, en: EN };

export function tr(lang: Lang, key: string): string {
  return DICT[lang][key] ?? PL[key] ?? key;
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
import { useStore } from './store';

/** Hook zwracający funkcję tłumaczącą wg bieżącego języka. */
export function useT(): (key: string) => string {
  const { lang } = useStore();
  return (key: string) => tr(lang, key);
}
