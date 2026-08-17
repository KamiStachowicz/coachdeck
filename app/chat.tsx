import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useStore } from '@/src/store';
import { useTheme, spacing, font } from '@/src/theme';
import { Card, Avatar, EmptyState } from '@/components/ui';

function whenLabel(ts: number): string {
  const diff = Date.now() - ts;
  const h = Math.floor(diff / 3600000);
  if (h < 1) return `${Math.max(1, Math.floor(diff / 60000))} min`;
  if (h < 24) return `${h} godz.`;
  return `${Math.floor(h / 24)} dni`;
}

export default function ChatListScreen() {
  const c = useTheme();
  const router = useRouter();
  const { chatThreads } = useStore();

  const sorted = [...chatThreads].sort((a, b) => {
    const la = a.messages[a.messages.length - 1]?.ts ?? 0;
    const lb = b.messages[b.messages.length - 1]?.ts ?? 0;
    return lb - la;
  });

  return (
    <>
      <Stack.Screen options={{ title: 'Wiadomości' }} />
      <ScrollView
        style={{ backgroundColor: c.background }}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
      >
        {sorted.length === 0 ? (
          <EmptyState icon="chatbubbles-outline" text="Brak rozmów." />
        ) : (
          sorted.map((t) => {
            const last = t.messages[t.messages.length - 1];
            return (
              <Card key={t.id} onPress={() => router.push(`/chat/${t.id}`)}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                  <Avatar first={t.name.split(' ')[0] ?? '?'} last={t.name.split(' ')[1] ?? ''} color={t.color} />
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ color: c.text, fontWeight: '800', fontSize: font.body }}>{t.name}</Text>
                      {last ? <Text style={{ color: c.tabInactive, fontSize: font.tiny }}>{whenLabel(last.ts)}</Text> : null}
                    </View>
                    <Text style={{ color: c.textMuted, fontSize: font.tiny }}>{t.role}</Text>
                    {last ? (
                      <Text style={{ color: c.textMuted, fontSize: font.small, marginTop: 4 }} numberOfLines={1}>
                        {last.from === 'coach' ? 'Ty: ' : ''}
                        {last.text}
                      </Text>
                    ) : null}
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={c.tabInactive} />
                </View>
              </Card>
            );
          })
        )}
        <Text style={{ color: c.textMuted, fontSize: font.tiny, textAlign: 'center', marginTop: spacing.md }}>
          Prywatne rozmowy z rodzicami i klientami. Ogłoszenia do wszystkich znajdziesz w „Komunikacji".
        </Text>
      </ScrollView>
    </>
  );
}
