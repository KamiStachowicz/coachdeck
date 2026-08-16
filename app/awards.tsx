import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useStore } from '@/src/store';
import { getSport, overallOf } from '@/src/data';
import { playerOfMonth, badgesFor, ALL_BADGES } from '@/src/gamification';
import { useTheme, spacing, font, radius } from '@/src/theme';
import { Card, Avatar, SectionTitle } from '@/components/ui';
import type { Player } from '@/src/types';

export default function AwardsScreen() {
  const c = useTheme();
  const router = useRouter();
  const { players, attendanceStats } = useStore();

  const potm = playerOfMonth(players);
  const avgForm = (p: Player) => (p.form.length ? p.form.reduce((s, v) => s + v, 0) / p.form.length : 0);

  const topScorers = [...players].sort((a, b) => b.stats.goals - a.stats.goals).slice(0, 5);
  const topRated = [...players].sort((a, b) => overallOf(b.ratings) - overallOf(a.ratings)).slice(0, 5);
  const topAttendance = [...players]
    .map((p) => ({ p, pct: attendanceStats(p.id).pct, total: attendanceStats(p.id).total }))
    .filter((x) => x.total > 0)
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 5);

  return (
    <>
      <Stack.Screen options={{ title: 'Nagrody i odznaki' }} />
      <ScrollView
        style={{ backgroundColor: c.background }}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
      >
        {/* Zawodnik miesiąca */}
        {potm ? (
          <Card
            onPress={() => router.push(`/player/${potm.id}`)}
            style={{ backgroundColor: '#D97706' }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <Ionicons name="trophy" size={30} color="#fff" />
              <View style={{ flex: 1 }}>
                <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: font.small, fontWeight: '700' }}>
                  Zawodnik miesiąca
                </Text>
                <Text style={{ color: '#fff', fontSize: font.h3, fontWeight: '900' }}>
                  {potm.firstName} {potm.lastName}
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: font.small }}>
                  Śr. forma {avgForm(potm).toFixed(1)} · ocena {overallOf(potm.ratings)}
                </Text>
              </View>
              <Avatar first={potm.firstName} last={potm.lastName} size={52} color="rgba(255,255,255,0.25)" />
            </View>
          </Card>
        ) : null}

        {/* Rankingi */}
        <Ranking title="Najlepsi strzelcy" rows={topScorers.map((p) => ({ p, value: `${p.stats.goals} ⚽` }))} />
        <Ranking title="Najwyżej oceniani" rows={topRated.map((p) => ({ p, value: `${overallOf(p.ratings)}` }))} />
        {topAttendance.length > 0 ? (
          <Ranking title="Frekwencja" rows={topAttendance.map((x) => ({ p: x.p, value: `${x.pct}%` }))} />
        ) : null}

        {/* Legenda odznak */}
        <View>
          <SectionTitle title="Odznaki do zdobycia" />
          <Card>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
              {ALL_BADGES.map((badge) => (
                <View key={badge.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, width: '47%' }}>
                  <View
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 15,
                      backgroundColor: badge.color + '22',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name={badge.icon as any} size={16} color={badge.color} />
                  </View>
                  <Text style={{ color: c.textMuted, fontSize: font.tiny, flex: 1 }}>{badge.label}</Text>
                </View>
              ))}
            </View>
          </Card>
        </View>
      </ScrollView>
    </>
  );
}

function Ranking({
  title,
  rows,
}: {
  title: string;
  rows: { p: Player; value: string }[];
}) {
  const c = useTheme();
  const router = useRouter();
  const { getTeam } = useStore();
  return (
    <View>
      <SectionTitle title={title} />
      <Card style={{ gap: spacing.md }}>
        {rows.map((row, i) => {
          const team = getTeam(row.p.teamId);
          const sport = team ? getSport(team.sport) : null;
          return (
            <View
              key={row.p.id}
              style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}
            >
              <Text style={{ color: c.textMuted, fontWeight: '800', width: 18 }}>{i + 1}</Text>
              <Avatar first={row.p.firstName} last={row.p.lastName} size={32} color={sport?.color} />
              <Text
                style={{ flex: 1, color: c.text, fontWeight: '600' }}
                numberOfLines={1}
                onPress={() => router.push(`/player/${row.p.id}`)}
              >
                {row.p.firstName} {row.p.lastName}
              </Text>
              <Text style={{ color: c.text, fontWeight: '800' }}>{row.value}</Text>
            </View>
          );
        })}
      </Card>
    </View>
  );
}
