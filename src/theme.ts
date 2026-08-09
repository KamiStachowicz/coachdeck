/**
 * CoachDeck – motyw aplikacji.
 * Jedno źródło prawdy dla kolorów, odstępów i zaokrągleń.
 * Obsługuje tryb jasny i ciemny.
 */
import { useColorScheme } from '@/components/useColorScheme';

const brand = {
  primary: '#059669', // emerald – boisko/energia
  primaryDark: '#047857',
  primarySoft: '#D1FAE5',
  accent: '#F97316', // pomarańcz – akcje/CTA
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
};

const palette = {
  light: {
    ...brand,
    background: '#F5F7FA',
    card: '#FFFFFF',
    cardAlt: '#F1F5F9',
    text: '#0F172A',
    textMuted: '#64748B',
    border: '#E2E8F0',
    tabBar: '#FFFFFF',
    tabInactive: '#94A3B8',
    onPrimary: '#FFFFFF',
    shadow: '#0F172A',
  },
  dark: {
    ...brand,
    primarySoft: '#064E3B',
    background: '#0B1220',
    card: '#131C2E',
    cardAlt: '#1B2740',
    text: '#F8FAFC',
    textMuted: '#94A3B8',
    border: '#243049',
    tabBar: '#0F1826',
    tabInactive: '#64748B',
    onPrimary: '#FFFFFF',
    shadow: '#000000',
  },
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 };
export const font = {
  h1: 28,
  h2: 22,
  h3: 18,
  body: 15,
  small: 13,
  tiny: 11,
};

export type Palette = typeof palette.light;

export function useTheme(): Palette {
  const scheme = useColorScheme() ?? 'light';
  return palette[scheme];
}

export { palette, brand };
