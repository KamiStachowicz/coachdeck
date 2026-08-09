import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useStore } from '@/src/store';
import { getSport } from '@/src/data';
import { useTheme, spacing, font } from '@/src/theme';
import {
  Card,
  Avatar,
  Badge,
  StatTile,
  SectionTitle,
  EmptyState,
  statusMeta,
  formatDate,
  formatTime,
} from '@/components/ui';

export default function TeamDetail() {
  const c = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getTeam, playersByTeam, eventsByTeam } = useStore();

  const team = getTeam(id);
  if (!team) {
    return <EmptyState icon="alert-circle-outline" text="Nie znaleziono drużyny." />;
  }
  const sport = getSport(team.sport);
  const roster = playersByTeam(team.id);
  const events = [...eventsByTeam(team.id)].sort((a, b) => a.date.localeCompare(b.date));
  const injured = roster.filter((p) => p.status === 'injured').length;

  return (
    <>
      <Stack.Screen options={{ title: team.name }} />
      <ScrollView
        style={{ backgroundColor: c.background }}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
      >
        {/* Nagłówek */}
        <Card style={{ backgroundColor: sport.color }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: 'rgba(255,255,255,0.25)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name={sport.icon as any} size={30} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: font.h2 }}>{team.name}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: font.small, marginTop: 2 }}>
                {sport.name} · {team.category} · {team.season}
              </Text>
            </View>
          </View>
        </Card>

        {/* Statystyki */}
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <StatTile label="Zawodnicy" value={roster.length} icon="people-outline" />
          <StatTile label="Kontuzje" value={injured} icon="medkit-outline" tint={c.danger} />
          <StatTile label="Wydarzenia" value={events.length} icon="calendar-outline" tint={c.accent} />
        </View>

        {/* Kadra */}
        <View>
          <SectionTitle title={`Kadra (${roster.length})`} />
          <View style={{ gap: spacing.md }}>
            {roster.map((p) => {
              const st = statusMeta[p.status];
              return (
                <Card key={p.id} onPress={() => router.push(`/player/${p.id}`)}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                    <Avatar first={p.firstName} last={p.lastName} color={sport.color} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: c.text, fontWeight: '700' }}>
                        {p.number ? `#${p.number} ` : ''}
                        {p.firstName} {p.lastName}
                      </Text>
                      <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: 4 }}>
                        {p.position ? <Badge label={p.position} /> : null}
                        <Badge label={st.label} color={st.color} bg={st.bg} />
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={c.tabInactive} />
                  </View>
                </Card>
              );
            })}
          </View>
        </View>

        {/* Terminarz */}
        <View>
          <SectionTitle title="Terminarz" />
          {events.length === 0 ? (
            <EmptyState icon="calendar-outline" text="Brak wydarzeń dla tej drużyny." />
          ) : (
            <View style={{ gap: spacing.md }}>
              {events.map((e) => {
                const isMatch = e.type === 'match';
                return (
                  <Card key={e.id}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                      <Ionicons
                        name={isMatch ? 'trophy-outline' : 'barbell-outline'}
                        size={22}
                        color={isMatch ? c.accent : c.primary}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: c.text, fontWeight: '700' }}>
                          {e.title}
                          {e.opponent ? ` · ${e.opponent}` : ''}
                        </Text>
                        <Text style={{ color: c.textMuted, fontSize: font.small }}>
                          {formatDate(e.date)} · {formatTime(e.date)}
                          {e.location ? ` · ${e.location}` : ''}
                        </Text>
                      </View>
                    </View>
                  </Card>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
}
