import React, { useMemo, useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useStore } from '@/src/store';
import { getSport } from '@/src/data';
import { useTheme, spacing, font, radius } from '@/src/theme';
import { Card, Avatar, Badge, PrimaryButton, statusMeta } from '@/components/ui';

export default function PlayersScreen() {
  const c = useTheme();
  const router = useRouter();
  const { players, teams, getTeam } = useStore();
  const [teamFilter, setTeamFilter] = useState<string | null>(null);

  const filtered = useMemo(
    () => players.filter((p) => (teamFilter ? p.teamId === teamFilter : true)),
    [players, teamFilter],
  );

  const avg = (p: (typeof players)[number]) =>
    Math.round(
      (p.ratings.fitness + p.ratings.technique + p.ratings.tactics + p.ratings.mentality) / 4,
    );

  return (
    <ScrollView
      style={{ backgroundColor: c.background }}
      contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
    >
      <PrimaryButton label="Dodaj zawodnika" icon="person-add" onPress={() => router.push('/modal?type=player')} />

      {/* Filtry drużyn */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
        <FilterChip label="Wszyscy" active={!teamFilter} onPress={() => setTeamFilter(null)} />
        {teams.map((t) => (
          <FilterChip key={t.id} label={t.name} active={teamFilter === t.id} onPress={() => setTeamFilter(t.id)} />
        ))}
      </ScrollView>

      {filtered.map((p) => {
        const team = getTeam(p.teamId);
        const sport = team ? getSport(team.sport) : null;
        const st = statusMeta[p.status];
        return (
          <Card key={p.id} onPress={() => router.push(`/player/${p.id}`)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <Avatar first={p.firstName} last={p.lastName} color={sport?.color} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: c.text, fontWeight: '700', fontSize: font.body }}>
                  {p.number ? `#${p.number} ` : ''}
                  {p.firstName} {p.lastName}
                </Text>
                <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: 4, flexWrap: 'wrap' }}>
                  {p.position ? <Badge label={p.position} /> : null}
                  <Badge label={st.label} color={st.color} bg={st.bg} />
                </View>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: c.primary, fontWeight: '800', fontSize: font.h3 }}>{avg(p)}</Text>
                <Text style={{ color: c.textMuted, fontSize: font.tiny }}>ocena</Text>
              </View>
            </View>
          </Card>
        );
      })}
    </ScrollView>
  );
}

function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const c = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radius.pill,
        backgroundColor: active ? c.primary : c.card,
        borderWidth: 1,
        borderColor: active ? c.primary : c.border,
      }}
    >
      <Text style={{ color: active ? c.onPrimary : c.text, fontWeight: '600', fontSize: font.small }}>
        {label}
      </Text>
    </Pressable>
  );
}
