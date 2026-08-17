import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, ActivityIndicator, Platform } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useNotifications } from '@/src/notifications';
import { useStore } from '@/src/store';
import { requestPushPermission, scheduleReminders, sendTestNotification } from '@/src/push';
import { useTheme, spacing, font, radius } from '@/src/theme';
import { Card, EmptyState } from '@/components/ui';

export default function NotificationsScreen() {
  const c = useTheme();
  const router = useRouter();
  const notifications = useNotifications();
  const { events, payments } = useStore();
  const [busy, setBusy] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const enablePush = async () => {
    setBusy(true);
    try {
      const granted = await requestPushPermission();
      if (!granted) {
        setStatus('Nie przyznano zgody na powiadomienia. Włącz je w ustawieniach systemu.');
        setEnabled(false);
        return;
      }
      const res = await scheduleReminders(events, payments);
      setEnabled(true);
      setStatus(
        res.web
          ? 'Powiadomienia włączone. Przypomnienia w tle (trening, składki) działają w aplikacji mobilnej.'
          : `Włączone. Zaplanowano ${res.scheduled} przypomnień (1 godz. przed wydarzeniami + zaległe składki).`,
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Powiadomienia' }} />
      <ScrollView
        style={{ backgroundColor: c.background }}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
      >
        {/* Karta push */}
        <Card style={{ gap: spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <View style={{ width: 42, height: 42, borderRadius: radius.md, backgroundColor: c.primary + '22', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={enabled ? 'notifications' : 'notifications-outline'} size={22} color={c.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.text, fontWeight: '800', fontSize: font.body }}>Powiadomienia push</Text>
              <Text style={{ color: c.textMuted, fontSize: font.small }}>
                Przypomnienia o treningach, meczach i zaległych składkach.
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <Pressable
              onPress={enablePush}
              disabled={busy}
              style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: spacing.md, borderRadius: radius.md, backgroundColor: enabled ? c.cardAlt : c.primary, borderWidth: 1, borderColor: enabled ? c.border : c.primary }}
            >
              {busy ? <ActivityIndicator color={enabled ? c.text : c.onPrimary} /> : <Ionicons name={enabled ? 'refresh' : 'notifications'} size={16} color={enabled ? c.text : c.onPrimary} />}
              <Text style={{ color: enabled ? c.text : c.onPrimary, fontWeight: '800', fontSize: font.small }}>
                {enabled ? 'Odśwież przypomnienia' : 'Włącz powiadomienia'}
              </Text>
            </Pressable>
            {enabled ? (
              <Pressable
                onPress={() => sendTestNotification()}
                style={{ paddingHorizontal: spacing.md, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, backgroundColor: c.info }}
              >
                <Text style={{ color: '#fff', fontWeight: '800', fontSize: font.small }}>Test</Text>
              </Pressable>
            ) : null}
          </View>
          {status ? <Text style={{ color: c.textMuted, fontSize: font.tiny }}>{status}</Text> : null}
          {Platform.OS === 'web' ? (
            <Text style={{ color: c.tabInactive, fontSize: font.tiny }}>
              W przeglądarce pokażemy powiadomienie testowe; pełne przypomnienia w tle działają w apce na telefonie.
            </Text>
          ) : null}
        </Card>

        {notifications.length === 0 ? (
          <EmptyState icon="notifications-off-outline" text="Brak nowych powiadomień." />
        ) : (
          notifications.map((n) => (
            <Card key={n.id} onPress={n.route ? () => router.push(n.route as any) : undefined}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: radius.md,
                    backgroundColor: n.color + '22',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name={n.icon as any} size={22} color={n.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.text, fontWeight: '700', fontSize: font.body }}>{n.title}</Text>
                  <Text style={{ color: c.textMuted, fontSize: font.small }} numberOfLines={2}>
                    {n.subtitle}
                  </Text>
                </View>
                {n.route ? <Ionicons name="chevron-forward" size={18} color={c.tabInactive} /> : null}
              </View>
            </Card>
          ))
        )}

        <Text style={{ color: c.textMuted, fontSize: font.tiny, textAlign: 'center', marginTop: spacing.md }}>
          Lista aktualnych alertów. Włącz push powyżej, aby dostawać przypomnienia na telefon.
        </Text>
      </ScrollView>
    </>
  );
}
