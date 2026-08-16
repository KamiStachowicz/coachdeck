import { useStore } from './store';
import { formatDate } from '@/components/ui';

export interface AppNotification {
  id: string;
  type: 'training' | 'match' | 'overdue' | 'trial' | 'registration' | 'announcement';
  icon: string; // Ionicons
  color: string;
  title: string;
  subtitle: string;
  route?: string;
  ts: number; // do sortowania (mniejsze = pilniejsze/wcześniejsze)
}

/** Buduje listę powiadomień na podstawie stanu aplikacji. */
export function useNotifications(): AppNotification[] {
  const {
    events, payments, getPlayer, getTeam, trialActive, trialDaysLeft, registrations, announcements,
  } = useStore();

  const list: AppNotification[] = [];
  const now = Date.now();
  const weekAhead = now + 7 * 86400000;

  // Nadchodzące wydarzenia (7 dni)
  for (const e of events) {
    const t = new Date(e.date).getTime();
    if (t >= now && t <= weekAhead) {
      const team = getTeam(e.teamId);
      list.push({
        id: `ev-${e.id}`,
        type: e.type === 'match' ? 'match' : 'training',
        icon: e.type === 'match' ? 'trophy-outline' : 'barbell-outline',
        color: e.type === 'match' ? '#F97316' : '#059669',
        title: e.type === 'match' ? `Mecz: ${e.title}` : e.title,
        subtitle: `${team?.name ?? ''} · ${formatDate(e.date)}`,
        route: `/attendance/${e.id}`,
        ts: t,
      });
    }
  }

  // Zaległe składki
  for (const p of payments) {
    if (p.status === 'overdue') {
      const pl = getPlayer(p.playerId);
      list.push({
        id: `pay-${p.id}`,
        type: 'overdue',
        icon: 'alert-circle-outline',
        color: '#EF4444',
        title: 'Zaległa składka',
        subtitle: `${pl ? pl.firstName + ' ' + pl.lastName : ''} · ${p.title}`,
        route: '/finances',
        ts: now - 1, // pilne
      });
    }
  }

  // Nowe zgłoszenia (nabór)
  const newRegs = registrations.filter((r) => r.status === 'new').length;
  if (newRegs > 0) {
    list.push({
      id: 'regs',
      type: 'registration',
      icon: 'person-add-outline',
      color: '#3B82F6',
      title: `${newRegs} nowych zgłoszeń`,
      subtitle: 'Nabór i zapisy',
      route: '/registrations',
      ts: now,
    });
  }

  // Okres próbny
  if (trialActive && trialDaysLeft <= 7) {
    list.push({
      id: 'trial',
      type: 'trial',
      icon: 'gift-outline',
      color: '#F59E0B',
      title: `Okres próbny kończy się za ${trialDaysLeft} dni`,
      subtitle: 'Wybierz plan, aby korzystać dalej',
      route: '/plans',
      ts: now + 1,
    });
  }

  // Przypięte ogłoszenia
  for (const a of announcements) {
    if (a.pinned) {
      list.push({
        id: `an-${a.id}`,
        type: 'announcement',
        icon: 'megaphone-outline',
        color: '#7C3AED',
        title: a.title,
        subtitle: a.body,
        route: '/messages',
        ts: new Date(a.date).getTime(),
      });
    }
  }

  return list.sort((a, b) => a.ts - b.ts);
}
