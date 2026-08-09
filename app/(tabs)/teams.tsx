import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useStore } from '@/src/store';
import { getSport, SEASON } from '@/src/data';
import { useTheme, spacing, font } from '@/src/theme';
import { Card, Badge, Avatar, SectionTitle } from '@/components/ui';

export default function TeamsScreen() {
  const c = useTheme();
  const router = useRouter();
  const { teams, players } = useStore();

  return (
    <ScrollView
      style={{ backgroundColor: c.background }}
      contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
    >
      <SectionTitle title={`Sezon ${SEASON}`} />
      {teams.map((t) => {
        const sport = getSport(t.sport);
        const teamPlayers = players.filter((p) => p.teamId === t.id);
        const injured = teamPlayers.filter((p) => p.status === 'injured').length;
        return (
          <Card key={t.id} onPress={() => router.push(`/team/${t.id}`)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <Avatar first={t.name[0]} last={t.name[1] ?? ''} size={52} color={t.colorAccent} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: c.text, fontWeight: '800', fontSize: font.h3 }}>{t.name}</Text>
                <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: 6, flexWrap: 'wrap' }}>
                  <Badge label={sport.name} color={sport.color} bg={sport.color + '22'} />
                  <Badge label={t.category} />
                  <Badge label={`${teamPlayers.length} zawodn.`} />
                  {injured > 0 ? <Badge label={`${injured} kontuzje`} color={c.danger} bg={c.danger + '22'} /> : null}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={c.tabInactive} />
            </View>
          </Card>
        );
      })}

      <Card style={{ borderStyle: 'dashed', borderWidth: 1, borderColor: c.border, alignItems: 'center' }}>
        <Ionicons name="add-circle-outline" size={28} color={c.primary} />
        <Text style={{ color: c.textMuted, marginTop: spacing.sm, textAlign: 'center' }}>
          Dodawanie nowych drużyn pojawi się wkrótce
        </Text>
      </Card>
    </ScrollView>
  );
}
