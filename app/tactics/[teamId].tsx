import React, { useMemo, useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useStore } from '@/src/store';
import { FORMATIONS, FORMATION_NAMES, getSport, overallOf } from '@/src/data';
import { useTheme, spacing, font, radius } from '@/src/theme';
import { Card, Badge, EmptyState } from '@/components/ui';
import type { Lineup, Player } from '@/src/types';

const PITCH = '#0E7A4F';
const LINE = 'rgba(255,255,255,0.55)';

export default function TacticsScreen() {
  const c = useTheme();
  const { teamId } = useLocalSearchParams<{ teamId: string }>();
  const { getTeam, playersByTeam, getLineup, setLineup } = useStore();

  const team = getTeam(teamId);
  const roster = playersByTeam(teamId);
  const [lineup, setLocalLineup] = useState<Lineup>(() => getLineup(teamId));
  const [activeSlot, setActiveSlot] = useState<number | null>(null);

  const slotDefs = FORMATIONS[lineup.formation];
  const assignedIds = useMemo(
    () => new Set([...lineup.slots.filter(Boolean), ...lineup.bench] as string[]),
    [lineup],
  );
  const available = roster.filter((p) => !assignedIds.has(p.id));

  if (!team) return <EmptyState icon="alert-circle-outline" text="Nie znaleziono drużyny." />;

  const persist = (l: Lineup) => {
    setLocalLineup(l);
    setLineup(l);
  };

  const changeFormation = (f: string) => {
    persist({ ...lineup, formation: f, slots: FORMATIONS[f].map(() => null) });
    setActiveSlot(null);
  };

  const assignToSlot = (slotIndex: number, playerId: string) => {
    const slots = [...lineup.slots];
    // usuń gracza z ławki lub innego slotu
    const bench = lineup.bench.filter((id) => id !== playerId);
    for (let i = 0; i < slots.length; i++) if (slots[i] === playerId) slots[i] = null;
    slots[slotIndex] = playerId;
    persist({ ...lineup, slots, bench });
    setActiveSlot(null);
  };

  const clearSlot = (slotIndex: number) => {
    const slots = [...lineup.slots];
    slots[slotIndex] = null;
    persist({ ...lineup, slots });
    setActiveSlot(null);
  };

  const toggleBench = (playerId: string) => {
    if (lineup.bench.includes(playerId)) {
      persist({ ...lineup, bench: lineup.bench.filter((id) => id !== playerId) });
    } else {
      const slots = lineup.slots.map((id) => (id === playerId ? null : id));
      persist({ ...lineup, slots, bench: [...lineup.bench, playerId] });
    }
  };

  const startersCount = lineup.slots.filter(Boolean).length;
  const findPlayer = (id: string | null) => (id ? roster.find((p) => p.id === id) : undefined);

  return (
    <>
      <Stack.Screen options={{ title: `Taktyka · ${team.name}` }} />
      <ScrollView
        style={{ backgroundColor: c.background }}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
      >
        {/* Wybór formacji */}
        <View>
          <Text style={{ color: c.textMuted, fontSize: font.small, fontWeight: '600', marginBottom: 8 }}>
            Formacja · {startersCount}/11 wybranych
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
            {FORMATION_NAMES.map((f) => {
              const active = lineup.formation === f;
              return (
                <Pressable
                  key={f}
                  onPress={() => changeFormation(f)}
                  style={{
                    paddingHorizontal: spacing.lg,
                    paddingVertical: spacing.sm,
                    borderRadius: radius.pill,
                    backgroundColor: active ? c.primary : c.card,
                    borderWidth: 1,
                    borderColor: active ? c.primary : c.border,
                  }}
                >
                  <Text style={{ color: active ? c.onPrimary : c.text, fontWeight: '800' }}>{f}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Boisko */}
        <View
          style={{
            backgroundColor: PITCH,
            borderRadius: radius.lg,
            aspectRatio: 0.66,
            overflow: 'hidden',
            justifyContent: 'center',
          }}
        >
          {/* linie boiska */}
          <View style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 2, backgroundColor: LINE }} />
          <View
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 80,
              height: 80,
              borderRadius: 40,
              borderWidth: 2,
              borderColor: LINE,
              marginLeft: -40,
              marginTop: -40,
            }}
          />
          <View style={{ position: 'absolute', top: 0, left: '25%', right: '25%', height: '14%', borderWidth: 2, borderTopWidth: 0, borderColor: LINE }} />
          <View style={{ position: 'absolute', bottom: 0, left: '25%', right: '25%', height: '14%', borderWidth: 2, borderBottomWidth: 0, borderColor: LINE }} />

          {/* pozycje */}
          {slotDefs.map((slot, i) => {
            const player = findPlayer(lineup.slots[i]);
            const isActive = activeSlot === i;
            return (
              <Pressable
                key={i}
                onPress={() => setActiveSlot(isActive ? null : i)}
                style={{
                  position: 'absolute',
                  left: `${slot.x}%`,
                  top: `${slot.y}%`,
                  marginLeft: -27,
                  marginTop: -27,
                  alignItems: 'center',
                  width: 54,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: player ? '#fff' : 'rgba(255,255,255,0.22)',
                    borderWidth: isActive ? 3 : 2,
                    borderColor: isActive ? '#FDE047' : '#fff',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {player ? (
                    <Text style={{ color: '#0F172A', fontWeight: '900', fontSize: 15 }}>
                      {player.number ?? overallOf(player.ratings)}
                    </Text>
                  ) : (
                    <Text style={{ color: '#fff', fontWeight: '800', fontSize: 11 }}>{slot.role}</Text>
                  )}
                </View>
                <Text numberOfLines={1} style={{ color: '#fff', fontSize: 10, fontWeight: '700', marginTop: 2 }}>
                  {player ? player.lastName : slot.role}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Panel wyboru zawodnika do pozycji */}
        {activeSlot !== null ? (
          <Card style={{ borderColor: c.primary, borderWidth: 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
              <Text style={{ color: c.text, fontWeight: '800' }}>
                Pozycja {slotDefs[activeSlot].role} – wybierz zawodnika
              </Text>
              {lineup.slots[activeSlot] ? (
                <Pressable onPress={() => clearSlot(activeSlot)}>
                  <Text style={{ color: c.danger, fontWeight: '700', fontSize: font.small }}>Wyczyść</Text>
                </Pressable>
              ) : null}
            </View>
            {available.length === 0 ? (
              <Text style={{ color: c.textMuted, fontSize: font.small }}>Brak wolnych zawodników.</Text>
            ) : (
              <View style={{ gap: spacing.sm }}>
                {available.map((p) => (
                  <PlayerRow key={p.id} player={p} onPress={() => assignToSlot(activeSlot, p.id)} action="Ustaw" />
                ))}
              </View>
            )}
          </Card>
        ) : null}

        {/* Ławka rezerwowych */}
        <View>
          <Text style={{ color: c.text, fontWeight: '800', fontSize: font.h3, marginBottom: spacing.md }}>
            Ławka ({lineup.bench.length})
          </Text>
          <View style={{ gap: spacing.sm }}>
            {roster
              .filter((p) => !lineup.slots.includes(p.id))
              .map((p) => {
                const onBench = lineup.bench.includes(p.id);
                return (
                  <PlayerRow
                    key={p.id}
                    player={p}
                    onPress={() => toggleBench(p.id)}
                    action={onBench ? 'Zdejmij' : '+ ławka'}
                    highlighted={onBench}
                  />
                );
              })}
          </View>
        </View>
      </ScrollView>
    </>
  );
}

function PlayerRow({
  player,
  onPress,
  action,
  highlighted,
}: {
  player: Player;
  onPress: () => void;
  action: string;
  highlighted?: boolean;
}) {
  const c = useTheme();
  const team = useStore().getTeam(player.teamId);
  const sport = team ? getSport(team.sport) : null;
  const ov = overallOf(player.ratings);
  const unavailable = player.status !== 'available';
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        backgroundColor: highlighted ? c.primarySoft : c.cardAlt,
        borderRadius: radius.md,
        padding: spacing.sm,
      }}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          backgroundColor: sport?.color ?? c.primary,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12 }}>{ov}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: c.text, fontWeight: '700', fontSize: font.small }}>
          {player.number ? `#${player.number} ` : ''}
          {player.firstName} {player.lastName}
        </Text>
        <Text style={{ color: c.textMuted, fontSize: font.tiny }}>{player.position ?? '—'}</Text>
      </View>
      {unavailable ? <Badge label={player.status === 'injured' ? 'Kontuzja' : 'Zawieszony'} color={c.danger} bg={c.danger + '22'} /> : null}
      <Text style={{ color: c.primary, fontWeight: '800', fontSize: font.small }}>{action}</Text>
    </Pressable>
  );
}
