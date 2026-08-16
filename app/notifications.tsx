import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useNotifications } from '@/src/notifications';
import { useTheme, spacing, font, radius } from '@/src/theme';
import { Card, EmptyState } from '@/components/ui';

export default function NotificationsScreen() {
  const c = useTheme();
  const router = useRouter();
  const notifications = useNotifications();

  return (
    <>
      <Stack.Screen options={{ title: 'Powiadomienia' }} />
      <ScrollView
        style={{ backgroundColor: c.background }}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
      >
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
          Powiadomienia systemowe (push) uruchomimy po podłączeniu backendu.
        </Text>
      </ScrollView>
    </>
  );
}
