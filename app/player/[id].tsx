import React from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useStore } from '@/src/store';
import { getSport, PAYMENT_KINDS } from '@/src/data';
import { useTheme, spacing, font, radius } from '@/src/theme';
import {
  Card,
  Avatar,
  Badge,
  SectionTitle,
  ProgressBar,
  EmptyState,
  statusMeta,
  paymentStatusMeta,
  formatMoney,
  formatDate,
} from '@/components/ui';

const RATING_LABELS: { key: 'fitness' | 'technique' | 'tactics' | 'mentality'; label: string }[] = [
  { key: 'fitness', label: 'Kondycja' },
  { key: 'technique', label: 'Technika' },
  { key: 'tactics', label: 'Taktyka' },
  { key: 'mentality', label: 'Mentalność' },
];

export default function PlayerDetail() {
  const c = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getPlayer, getTeam, paymentsByPlayer, markPaid, markUnpaid } = useStore();

  const player = getPlayer(id);
  if (!player) {
    return <EmptyState icon="alert-circle-outline" text="Nie znaleziono zawodnika." />;
  }
  const team = getTeam(player.teamId);
  const sport = team ? getSport(team.sport) : null;
  const st = statusMeta[player.status];
  const avg = Math.round(
    (player.ratings.fitness + player.ratings.technique + player.ratings.tactics + player.ratings.mentality) / 4,
  );
  const age = player.birthYear ? new Date().getFullYear() - player.birthYear : null;

  const ratingColor = (v: number) => (v >= 80 ? c.primary : v >= 65 ? c.warning : c.danger);

  const payments = [...paymentsByPlayer(player.id)].sort((a, b) => b.dueDate.localeCompare(a.dueDate));
  const outstanding = payments
    .filter((p) => p.status !== 'paid')
    .reduce((s, p) => s + p.amount, 0);

  return (
    <>
      <Stack.Screen options={{ title: `${player.firstName} ${player.lastName}` }} />
      <ScrollView
        style={{ backgroundColor: c.background }}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
      >
        {/* Nagłówek */}
        <Card>
          <View style={{ alignItems: 'center', gap: spacing.md }}>
            <Avatar first={player.firstName} last={player.lastName} size={84} color={sport?.color} />
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: c.text, fontWeight: '800', fontSize: font.h2 }}>
                {player.number ? `#${player.number} ` : ''}
                {player.firstName} {player.lastName}
              </Text>
              {team ? (
                <Text style={{ color: c.textMuted, fontSize: font.small, marginTop: 2 }}>
                  {team.name} {sport ? `· ${sport.name}` : ''}
                </Text>
              ) : null}
            </View>
            <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap', justifyContent: 'center' }}>
              {player.position ? <Badge label={player.position} /> : null}
              {age ? <Badge label={`${age} lat`} /> : null}
              <Badge label={st.label} color={st.color} bg={st.bg} />
            </View>
          </View>
        </Card>

        {/* Ocena ogólna */}
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ color: c.text, fontWeight: '700', fontSize: font.body }}>Ocena ogólna</Text>
            <Text style={{ color: ratingColor(avg), fontWeight: '900', fontSize: font.h1 }}>{avg}</Text>
          </View>
        </Card>

        {/* Atrybuty */}
        <View>
          <SectionTitle title="Atrybuty" />
          <Card style={{ gap: spacing.lg }}>
            {RATING_LABELS.map(({ key, label }) => {
              const v = player.ratings[key];
              return (
                <View key={key} style={{ gap: 6 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: c.text, fontSize: font.small, fontWeight: '600' }}>{label}</Text>
                    <Text style={{ color: ratingColor(v), fontSize: font.small, fontWeight: '800' }}>{v}</Text>
                  </View>
                  <ProgressBar value={v} color={ratingColor(v)} />
                </View>
              );
            })}
          </Card>
        </View>

        {/* Płatności */}
        <View>
          <SectionTitle title="Płatności" />
          {outstanding > 0 ? (
            <Card style={{ marginBottom: spacing.md, backgroundColor: c.danger + '18' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ color: c.text, fontWeight: '700' }}>Zaległości do uregulowania</Text>
                <Text style={{ color: c.danger, fontWeight: '900', fontSize: font.h3 }}>
                  {formatMoney(outstanding)}
                </Text>
              </View>
            </Card>
          ) : null}
          {payments.length === 0 ? (
            <EmptyState icon="wallet-outline" text="Brak płatności dla tego zawodnika." />
          ) : (
            <View style={{ gap: spacing.md }}>
              {payments.map((pay) => {
                const kind = PAYMENT_KINDS[pay.kind];
                const ps = paymentStatusMeta[pay.status];
                const paid = pay.status === 'paid';
                return (
                  <Card key={pay.id}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                      <View
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: radius.md,
                          backgroundColor: kind.color + '22',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Ionicons name={kind.icon as any} size={18} color={kind.color} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: c.text, fontWeight: '700', fontSize: font.small }}>{pay.title}</Text>
                        <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: 4 }}>
                          <Badge label={ps.label} color={ps.color} bg={ps.bg} />
                          <Badge label={`termin ${formatDate(pay.dueDate)}`} />
                        </View>
                      </View>
                      <View style={{ alignItems: 'flex-end', gap: 6 }}>
                        <Text style={{ color: c.text, fontWeight: '900' }}>{formatMoney(pay.amount)}</Text>
                        <Pressable
                          onPress={() => (paid ? markUnpaid(pay.id) : markPaid(pay.id))}
                          style={{
                            paddingHorizontal: spacing.sm,
                            paddingVertical: 4,
                            borderRadius: radius.pill,
                            backgroundColor: paid ? c.cardAlt : c.primary,
                          }}
                        >
                          <Text
                            style={{
                              color: paid ? c.textMuted : c.onPrimary,
                              fontWeight: '700',
                              fontSize: font.tiny,
                            }}
                          >
                            {paid ? 'Cofnij' : 'Zapłacono'}
                          </Text>
                        </Pressable>
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
