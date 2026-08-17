/**
 * Powiadomienia push / lokalne (Expo Notifications).
 * - Na telefonie (iOS/Android): prawdziwe zaplanowane powiadomienia lokalne
 *   (przypomnienia o treningach/meczach i zaległych składkach).
 * - Na web: prosi o zgodę przez Web Notifications i pokazuje powiadomienie
 *   testowe; realne planowanie w tle działa w aplikacji mobilnej.
 */
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { CoachEvent, Payment } from '@/src/types';

// Pokazuj powiadomienia także, gdy aplikacja jest otwarta.
Notifications.setNotificationHandler({
  handleNotification: async () =>
    ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }) as any,
});

const isWeb = Platform.OS === 'web';

/** Prosi o zgodę na powiadomienia. Zwraca true, gdy przyznano. */
export async function requestPushPermission(): Promise<boolean> {
  if (isWeb) {
    try {
      if (typeof window === 'undefined' || !('Notification' in window)) return false;
      const res = await Notification.requestPermission();
      return res === 'granted';
    } catch {
      return false;
    }
  }
  const current = await Notifications.getPermissionsAsync();
  let status = current.status;
  if (status !== 'granted') {
    const req = await Notifications.requestPermissionsAsync();
    status = req.status;
  }
  return status === 'granted';
}

/** Powiadomienie testowe „tu i teraz”. */
export async function sendTestNotification(): Promise<void> {
  if (isWeb) {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('CoachDeck', { body: 'Powiadomienia działają! 🎉' });
    }
    return;
  }
  await Notifications.scheduleNotificationAsync({
    content: { title: 'CoachDeck', body: 'Powiadomienia działają! 🎉' },
    trigger: null, // od razu
  });
}

export interface ScheduleResult {
  scheduled: number;
  web: boolean;
}

/**
 * Kasuje wcześniejsze i planuje przypomnienia:
 * - 1 godz. przed każdym nadchodzącym treningiem/meczem,
 * - o zaległych składkach (najbliższa pełna godzina).
 * Na web nie planuje w tle – zwraca web:true.
 */
export async function scheduleReminders(events: CoachEvent[], payments: Payment[]): Promise<ScheduleResult> {
  if (isWeb) return { scheduled: 0, web: true };

  await Notifications.cancelAllScheduledNotificationsAsync();
  const now = Date.now();
  let count = 0;

  for (const e of events) {
    const start = new Date(e.date).getTime();
    const remindAt = new Date(start - 3600000); // 1 godz. przed
    if (remindAt.getTime() > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: e.type === 'match' ? `Mecz za godzinę: ${e.title}` : `Trening za godzinę: ${e.title}`,
          body: e.location ? `Miejsce: ${e.location}` : 'Do zobaczenia!',
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: remindAt } as any,
      });
      count++;
    }
  }

  const overdue = payments.filter((p) => p.status === 'overdue');
  if (overdue.length > 0) {
    const soon = new Date(now + 60000); // za minutę
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Zaległe składki',
        body: `${overdue.length} zaległych płatności do rozliczenia.`,
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: soon } as any,
    });
    count++;
  }

  return { scheduled: count, web: false };
}

/** Kasuje wszystkie zaplanowane przypomnienia. */
export async function cancelReminders(): Promise<void> {
  if (isWeb) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}
