import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useStore } from '@/src/store';
import { getSport } from '@/src/data';
import { useTheme, spacing, font, radius } from '@/src/theme';
import { Card, Badge, SectionTitle, EmptyState, ProgressBar, formatMoney, formatDate } from '@/components/ui';

export default function ScoutingScreen() {
  const c = useTheme();
  const { scoutTargets, transfers, teams, toggleWatch, signTarget } = useStore();
  const [signing, setSigning] = useState<string | null>(null);
  const [filterWatched, setFilterWatched] = useState(false);

  const shown = filterWatched ? scoutTargets.filter((t) => t.watched) : scoutTargets;

  return (
    <>
      <Stack.Screen options={{ title: 'Skauting i transfery' }} />
      <ScrollView
        style={{ backgroundColor: c.background }}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
      >
        {/* Filtr */}
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <FilterChip label="Wszyscy" active={!filterWatched} onPress={() => setFilterWatched(false)} />
          <FilterChip label="Obserwowani" active={filterWatched} onPress={() => setFilterWatched(true)} />
        </View>

        {/* Lista celów */}
        <View>
          <SectionTitle title={`Obserwowani zawodnicy (${shown.length})`} />
          {shown.length === 0 ? (
            <EmptyState icon="search-outline" text="Brak zawodników na liście." />
          ) : (
            <View style={{ gap: spacing.md }}>
              {shown.map((t) => {
                const sport = getSport(t.sport);
                const isSigning = signing === t.id;
                return (
                  <Card key={t.id}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                      <View
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 22,
                          backgroundColor: sport.color,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text style={{ color: '#fff', fontWeight: '900' }}>{t.overall}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: c.text, fontWeight: '800', fontSize: font.body }}>
                          {t.firstName} {t.lastName}
                        </Text>
                        <Text style={{ color: c.textMuted, fontSize: font.small }}>
                          {t.position} · {t.age} lat · {t.club}
                        </Text>
                      </View>
                      <Pressable onPress={() => toggleWatch(t.id)}>
                        <Ionicons
                          name={t.watched ? 'eye' : 'eye-outline'}
                          size={22}
                          color={t.watched ? c.primary : c.tabInactive}
                        />
                      </Pressable>
                    </View>

                    {/* potencjał + wartość */}
                    <View style={{ flexDirection: 'row', gap: spacing.lg, marginTop: spacing.md }}>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                          <Text style={{ color: c.textMuted, fontSize: font.tiny }}>Potencjał</Text>
                          <Text style={{ color: c.info, fontSize: font.tiny, fontWeight: '800' }}>{t.potential}</Text>
                        </View>
                        <ProgressBar value={t.potential} color={c.info} />
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ color: c.textMuted, fontSize: font.tiny }}>Wycena</Text>
                        <Text style={{ color: c.text, fontWeight: '900' }}>{formatMoney(t.value)}</Text>
                      </View>
                    </View>

                    {/* akcje: podpisz */}
                    {isSigning ? (
                      <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
                        <Text style={{ color: c.textMuted, fontSize: font.small }}>Podpisz do drużyny:</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                          {teams.map((team) => (
                            <Pressable
                              key={team.id}
                              onPress={() => {
                                signTarget(t.id, team.id);
                                setSigning(null);
                              }}
                              style={{
                                paddingHorizontal: spacing.md,
                                paddingVertical: spacing.sm,
                                borderRadius: radius.pill,
                                backgroundColor: c.primary,
                              }}
                            >
                              <Text style={{ color: c.onPrimary, fontWeight: '700', fontSize: font.small }}>
                                {team.name}
                              </Text>
                            </Pressable>
                          ))}
                          <Pressable
                            onPress={() => setSigning(null)}
                            style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}
                          >
                            <Text style={{ color: c.danger, fontWeight: '700', fontSize: font.small }}>Anuluj</Text>
                          </Pressable>
                        </View>
                      </View>
                    ) : (
                      <Pressable
                        onPress={() => setSigning(t.id)}
                        style={{
                          marginTop: spacing.md,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          paddingVertical: spacing.sm,
                          borderRadius: radius.md,
                          backgroundColor: c.primarySoft,
                        }}
                      >
                        <Ionicons name="add-circle" size={18} color={c.primary} />
                        <Text style={{ color: c.primary, fontWeight: '800' }}>Podpisz kontrakt</Text>
                      </Pressable>
                    )}
                  </Card>
                );
              })}
            </View>
          )}
        </View>

        {/* Historia transferów */}
        <View>
          <SectionTitle title="Historia transferów" />
          {transfers.length === 0 ? (
            <EmptyState icon="swap-horizontal-outline" text="Brak transferów. Podpisz kogoś z listy!" />
          ) : (
            <View style={{ gap: spacing.md }}>
              {transfers.map((tr) => (
                <Card key={tr.id}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                    <Ionicons
                      name={tr.direction === 'in' ? 'arrow-down-circle' : 'arrow-up-circle'}
                      size={24}
                      color={tr.direction === 'in' ? c.primary : c.danger}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: c.text, fontWeight: '700' }}>{tr.playerName}</Text>
                      <Text style={{ color: c.textMuted, fontSize: font.small }}>
                        {tr.direction === 'in' ? 'z' : 'do'} {tr.club} · {formatDate(tr.date)}
                      </Text>
                    </View>
                    <Text style={{ color: c.text, fontWeight: '900' }}>{formatMoney(tr.fee)}</Text>
                  </View>
                </Card>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
}

function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const c = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: radius.pill,
        backgroundColor: active ? c.primary : c.card,
        borderWidth: 1,
        borderColor: active ? c.primary : c.border,
      }}
    >
      <Text style={{ color: active ? c.onPrimary : c.text, fontWeight: '700', fontSize: font.small }}>{label}</Text>
    </Pressable>
  );
}
