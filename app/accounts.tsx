import React from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useStore } from '@/src/store';
import { getSport } from '@/src/data';
import { useTheme, spacing, font, radius } from '@/src/theme';
import { Card, Avatar, Badge, SectionTitle, EmptyState } from '@/components/ui';

export default function AccountsScreen() {
  const c = useTheme();
  const router = useRouter();
  const { visiblePlayers, visibleTeams } = useStore();

  return (
    <>
      <Stack.Screen options={{ title: 'Konta rodziców i zawodników' }} />
      <ScrollView
        style={{ backgroundColor: c.background }}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
      >
        <Card style={{ backgroundColor: c.primary, gap: 4 }}>
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: font.body }}>Dostęp dla rodzica / zawodnika</Text>
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: font.small }}>
            Każdy zawodnik ma własny podgląd: składki (płatność online), frekwencja, terminarz i potwierdzanie obecności.
          </Text>
        </Card>

        {visibleTeams.map((tm) => {
          const players = visiblePlayers.filter((p) => p.teamId === tm.id);
          if (players.length === 0) return null;
          const sport = getSport(tm.sport);
          return (
            <View key={tm.id}>
              <SectionTitle title={tm.name} />
              <View style={{ gap: spacing.md }}>
                {players.map((p) => (
                  <Card key={p.id} onPress={() => router.push(`/parent/${p.id}`)}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                      <Avatar first={p.firstName} last={p.lastName} color={sport.color} />
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: c.text, fontWeight: '700', fontSize: font.body }}>
                          {p.firstName} {p.lastName}
                        </Text>
                        <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: 4 }}>
                          <Badge label="Konto rodzica" color={c.info} bg={c.info + '22'} />
                          {p.position ? <Badge label={p.position} /> : null}
                        </View>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={c.tabInactive} />
                    </View>
                  </Card>
                ))}
              </View>
            </View>
          );
        })}

        {visiblePlayers.length === 0 ? (
          <EmptyState icon="people-outline" text="Brak zawodników do wyświetlenia." />
        ) : null}

        <Text style={{ color: c.textMuted, fontSize: font.tiny, textAlign: 'center' }}>
          Demo: podgląd kont. Po podłączeniu backendu rodzic/zawodnik loguje się osobnym kontem.
        </Text>
      </ScrollView>
    </>
  );
}
