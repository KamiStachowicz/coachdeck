import React, { useMemo, useState } from 'react';
import { ScrollView, View, Text, TextInput, Pressable } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useStore } from '@/src/store';
import { getSport } from '@/src/data';
import { useTheme, spacing, font, radius } from '@/src/theme';
import { Card, PrimaryButton, Avatar } from '@/components/ui';
import type { Scorer } from '@/src/types';

export default function AddResultScreen() {
  const c = useTheme();
  const router = useRouter();
  const { teams, playersByTeam, addResult } = useStore();

  const [teamId, setTeamId] = useState(teams[0]?.id ?? '');
  const [opponent, setOpponent] = useState('');
  const [home, setHome] = useState(true);
  const [gf, setGf] = useState(0);
  const [ga, setGa] = useState(0);
  const [competition, setCompetition] = useState('Liga');
  const [scorers, setScorers] = useState<Record<string, { goals: number; assists: number }>>({});

  const roster = useMemo(() => playersByTeam(teamId), [teamId, playersByTeam]);

  const bump = (id: string, field: 'goals' | 'assists', delta: number) =>
    setScorers((prev) => {
      const cur = prev[id] ?? { goals: 0, assists: 0 };
      const val = Math.max(0, cur[field] + delta);
      return { ...prev, [id]: { ...cur, [field]: val } };
    });

  const inputStyle = {
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: radius.md,
    padding: spacing.md,
    color: c.text,
    fontSize: font.body,
  } as const;

  const Label = ({ children }: { children: string }) => (
    <Text style={{ color: c.textMuted, fontSize: font.small, fontWeight: '600', marginBottom: 6 }}>
      {children}
    </Text>
  );

  const Stepper = ({ value, onDelta }: { value: number; onDelta: (d: number) => void }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
      <Pressable
        onPress={() => onDelta(-1)}
        style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: c.cardAlt, alignItems: 'center', justifyContent: 'center' }}
      >
        <Ionicons name="remove" size={20} color={c.text} />
      </Pressable>
      <Text style={{ color: c.text, fontWeight: '900', fontSize: font.h2, width: 40, textAlign: 'center' }}>
        {value}
      </Text>
      <Pressable
        onPress={() => onDelta(1)}
        style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' }}
      >
        <Ionicons name="add" size={20} color={c.onPrimary} />
      </Pressable>
    </View>
  );

  const canSave = opponent.trim().length > 0;

  const save = () => {
    if (!canSave) return;
    const list: Scorer[] = Object.entries(scorers)
      .filter(([, v]) => v.goals > 0 || v.assists > 0)
      .map(([playerId, v]) => ({ playerId, goals: v.goals, assists: v.assists }));
    addResult({
      teamId,
      opponent: opponent.trim(),
      home,
      goalsFor: gf,
      goalsAgainst: ga,
      competition: competition.trim() || undefined,
      scorers: list,
    });
    router.back();
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Wynik meczu' }} />
      <ScrollView
        style={{ backgroundColor: c.background }}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
      >
        {/* Drużyna */}
        <View>
          <Label>Drużyna</Label>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
            {teams.map((t) => {
              const active = teamId === t.id;
              const sport = getSport(t.sport);
              return (
                <Pressable
                  key={t.id}
                  onPress={() => setTeamId(t.id)}
                  style={{
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                    borderRadius: radius.pill,
                    backgroundColor: active ? sport.color : c.card,
                    borderWidth: 1,
                    borderColor: active ? sport.color : c.border,
                  }}
                >
                  <Text style={{ color: active ? '#fff' : c.text, fontWeight: '600', fontSize: font.small }}>
                    {t.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Przeciwnik + miejsce */}
        <View>
          <Label>Przeciwnik</Label>
          <TextInput
            value={opponent}
            onChangeText={setOpponent}
            placeholder="np. Polonia"
            placeholderTextColor={c.tabInactive}
            style={inputStyle}
          />
        </View>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {([true, false] as const).map((h) => {
            const active = home === h;
            return (
              <Pressable
                key={String(h)}
                onPress={() => setHome(h)}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  paddingVertical: spacing.md,
                  borderRadius: radius.md,
                  backgroundColor: active ? c.primary : c.card,
                  borderWidth: 1,
                  borderColor: active ? c.primary : c.border,
                }}
              >
                <Text style={{ color: active ? '#fff' : c.text, fontWeight: '700' }}>
                  {h ? 'U siebie' : 'Na wyjeździe'}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Wynik */}
        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
            <View style={{ alignItems: 'center', gap: spacing.sm }}>
              <Text style={{ color: c.textMuted, fontSize: font.small }}>My</Text>
              <Stepper value={gf} onDelta={(d) => setGf((v) => Math.max(0, v + d))} />
            </View>
            <Text style={{ color: c.textMuted, fontWeight: '900', fontSize: font.h1 }}>:</Text>
            <View style={{ alignItems: 'center', gap: spacing.sm }}>
              <Text style={{ color: c.textMuted, fontSize: font.small }}>Rywal</Text>
              <Stepper value={ga} onDelta={(d) => setGa((v) => Math.max(0, v + d))} />
            </View>
          </View>
        </Card>

        {/* Rozgrywki */}
        <View>
          <Label>Rozgrywki</Label>
          <TextInput
            value={competition}
            onChangeText={setCompetition}
            placeholder="Liga / Puchar / Sparing"
            placeholderTextColor={c.tabInactive}
            style={inputStyle}
          />
        </View>

        {/* Strzelcy i asystenci */}
        <View>
          <Label>Strzelcy i asystenci (opcjonalnie)</Label>
          <View style={{ gap: spacing.sm }}>
            {roster.map((p) => {
              const sc = scorers[p.id] ?? { goals: 0, assists: 0 };
              const team = teams.find((t) => t.id === p.teamId);
              const sport = team ? getSport(team.sport) : null;
              return (
                <Card key={p.id} style={{ padding: spacing.sm }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                    <Avatar first={p.firstName} last={p.lastName} size={32} color={sport?.color} />
                    <Text style={{ flex: 1, color: c.text, fontWeight: '600', fontSize: font.small }} numberOfLines={1}>
                      {p.firstName} {p.lastName}
                    </Text>
                    <MiniCounter label="G" value={sc.goals} onDelta={(d) => bump(p.id, 'goals', d)} color={c.primary} />
                    <MiniCounter label="A" value={sc.assists} onDelta={(d) => bump(p.id, 'assists', d)} color={c.info} />
                  </View>
                </Card>
              );
            })}
          </View>
        </View>

        <PrimaryButton label="Zapisz wynik" icon="checkmark" onPress={save} style={{ opacity: canSave ? 1 : 0.5 }} />
      </ScrollView>
    </>
  );
}

function MiniCounter({
  label,
  value,
  onDelta,
  color,
}: {
  label: string;
  value: number;
  onDelta: (d: number) => void;
  color: string;
}) {
  const c = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Pressable onPress={() => onDelta(-1)} style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: c.cardAlt, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="remove" size={14} color={c.text} />
      </Pressable>
      <View style={{ alignItems: 'center', width: 26 }}>
        <Text style={{ color, fontWeight: '900' }}>{value}</Text>
        <Text style={{ color: c.textMuted, fontSize: 9 }}>{label}</Text>
      </View>
      <Pressable onPress={() => onDelta(1)} style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="add" size={14} color="#fff" />
      </Pressable>
    </View>
  );
}
