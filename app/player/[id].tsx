import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useStore } from '@/src/store';
import { getSport, PAYMENT_KINDS, isTeamSport } from '@/src/data';
import { badgesFor } from '@/src/gamification';
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
  moraleMeta,
  FormDots,
  MiniBars,
  PrimaryButton,
  formatMoney,
  formatDate,
} from '@/components/ui';

const RATING_LABELS: { key: 'fitness' | 'technique' | 'tactics' | 'mentality'; label: string }[] = [
  { key: 'fitness', label: 'Kondycja' },
  { key: 'technique', label: 'Technika' },
  { key: 'tactics', label: 'Taktyka' },
  { key: 'mentality', label: 'Mentalność' },
];

function StatCell({ label, value }: { label: string; value: string | number }) {
  const c = useTheme();
  return (
    <View style={{ width: '25%', alignItems: 'center', paddingVertical: spacing.md }}>
      <Text style={{ color: c.text, fontWeight: '900', fontSize: font.h3 }}>{value}</Text>
      <Text style={{ color: c.textMuted, fontSize: font.tiny, textAlign: 'center' }}>{label}</Text>
    </View>
  );
}

export default function PlayerDetail() {
  const c = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getPlayer, getTeam, paymentsByPlayer, markPaid, markUnpaid, goalsByPlayer, addGoal, toggleGoal, removeGoal, attendanceStats, recordsByPlayer, addRecord } =
    useStore();
  const [goalText, setGoalText] = useState('');
  const [recEvent, setRecEvent] = useState('');
  const [recResult, setRecResult] = useState('');

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

  const att = attendanceStats(player.id);
  const badges = badgesFor(player, att.total > 0 ? att.pct : undefined);
  const teamSport = sport ? isTeamSport(sport.id) : true;
  const records = recordsByPlayer(player.id);
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
              {player.captain ? <Badge label="Kapitan (C)" color={c.accent} bg={c.accent + '22'} /> : null}
              {player.position ? <Badge label={player.position} /> : null}
              {age ? <Badge label={`${age} lat`} /> : null}
              <Badge label={`Noga: ${player.foot === 'both' ? 'obie' : player.foot === 'L' ? 'lewa' : 'prawa'}`} />
              <Badge label={st.label} color={st.color} bg={st.bg} />
            </View>
          </View>
        </Card>

        {/* Odznaki */}
        {badges.length > 0 ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {badges.map((b) => (
              <View
                key={b.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 5,
                  paddingHorizontal: spacing.md,
                  paddingVertical: 6,
                  borderRadius: radius.pill,
                  backgroundColor: b.color + '22',
                }}
              >
                <Ionicons name={b.icon as any} size={14} color={b.color} />
                <Text style={{ color: b.color, fontWeight: '700', fontSize: font.tiny }}>{b.label}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* Karta zawodnika (styl FIFA) */}
        <PrimaryButton
          label="Zobacz kartę zawodnika"
          icon="card-outline"
          onPress={() => router.push(`/card/${player.id}`)}
        />

        {/* Ocena ogólna + potencjał */}
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ color: ratingColor(avg), fontWeight: '900', fontSize: font.h1 }}>{avg}</Text>
              <Text style={{ color: c.textMuted, fontSize: font.tiny }}>Ocena ogólna</Text>
            </View>
            <View style={{ width: 1, height: 40, backgroundColor: c.border }} />
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ color: c.info, fontWeight: '900', fontSize: font.h1 }}>{player.potential}</Text>
              <Text style={{ color: c.textMuted, fontSize: font.tiny }}>Potencjał</Text>
            </View>
            <View style={{ width: 1, height: 40, backgroundColor: c.border }} />
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ color: c.text, fontWeight: '900', fontSize: font.h3 }}>
                {formatMoney(player.value)}
              </Text>
              <Text style={{ color: c.textMuted, fontSize: font.tiny }}>Wartość</Text>
            </View>
          </View>
        </Card>

        {/* Morale i gotowość */}
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <Card style={{ flex: 1 }}>
            <Text style={{ color: c.textMuted, fontSize: font.tiny, marginBottom: 6 }}>Morale</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name={moraleMeta[player.morale].icon} size={20} color={moraleMeta[player.morale].color} />
              <Text style={{ color: moraleMeta[player.morale].color, fontWeight: '800' }}>
                {moraleMeta[player.morale].label}
              </Text>
            </View>
          </Card>
          <Card style={{ flex: 1 }}>
            <Text style={{ color: c.textMuted, fontSize: font.tiny, marginBottom: 6 }}>Gotowość na mecz</Text>
            <Text
              style={{
                color: player.condition >= 75 ? c.primary : player.condition >= 50 ? c.warning : c.danger,
                fontWeight: '900',
                fontSize: font.h3,
                marginBottom: 4,
              }}
            >
              {player.condition}%
            </Text>
            <ProgressBar
              value={player.condition}
              color={player.condition >= 75 ? c.primary : player.condition >= 50 ? c.warning : c.danger}
            />
          </Card>
        </View>

        {/* Statystyki sezonu (sporty zespołowe) */}
        {teamSport ? (
          <View>
            <SectionTitle title="Statystyki sezonu" />
            <Card>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                <StatCell label="Mecze" value={player.stats.apps} />
                <StatCell label="Gole" value={player.stats.goals} />
                <StatCell label="Asysty" value={player.stats.assists} />
                <StatCell label="Minuty" value={player.stats.minutes} />
                <StatCell label="Śr. ocena" value={player.stats.avgRating.toFixed(1)} />
                <StatCell label="Żółte" value={player.stats.yellow} />
                <StatCell label="Czerwone" value={player.stats.red} />
                <StatCell label="Gole/mecz" value={(player.stats.goals / Math.max(1, player.stats.apps)).toFixed(2)} />
                {att.total > 0 ? <StatCell label="Frekwencja" value={`${att.pct}%`} /> : null}
              </View>
            </Card>
          </View>
        ) : (
          <View>
            <SectionTitle title="Podsumowanie" />
            <Card>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                <StatCell label="Starty" value={player.stats.apps} />
                <StatCell label="Śr. ocena" value={player.stats.avgRating.toFixed(1)} />
                {att.total > 0 ? <StatCell label="Frekwencja" value={`${att.pct}%`} /> : null}
              </View>
            </Card>
          </View>
        )}

        {/* Rekordy życiowe / wyniki */}
        <View>
          <SectionTitle title="Rekordy życiowe" />
          <Card style={{ gap: spacing.md }}>
            {records.length === 0 ? (
              <Text style={{ color: c.textMuted, fontSize: font.small }}>Brak rekordów. Dodaj pierwszy poniżej.</Text>
            ) : (
              records.map((r) => (
                <View key={r.id} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                  <Ionicons name="stopwatch-outline" size={18} color={c.info} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: c.text, fontWeight: '700', fontSize: font.small }}>{r.event}</Text>
                    <Text style={{ color: c.textMuted, fontSize: font.tiny }}>{formatDate(r.date)}</Text>
                  </View>
                  <Text style={{ color: c.text, fontWeight: '900' }}>{r.result}</Text>
                </View>
              ))
            )}
            {/* dodawanie */}
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <TextInput
                value={recEvent}
                onChangeText={setRecEvent}
                placeholder="Konkurencja (np. 100 m kraul)"
                placeholderTextColor={c.tabInactive}
                style={{ flex: 1.5, backgroundColor: c.cardAlt, borderRadius: radius.md, padding: spacing.md, color: c.text }}
              />
              <TextInput
                value={recResult}
                onChangeText={setRecResult}
                placeholder="Wynik"
                placeholderTextColor={c.tabInactive}
                style={{ flex: 1, backgroundColor: c.cardAlt, borderRadius: radius.md, padding: spacing.md, color: c.text }}
              />
              <Pressable
                onPress={() => {
                  if (recEvent.trim() && recResult.trim()) {
                    addRecord(player.id, recEvent.trim(), recResult.trim());
                    setRecEvent('');
                    setRecResult('');
                  }
                }}
                style={{ paddingHorizontal: spacing.md, justifyContent: 'center', borderRadius: radius.md, backgroundColor: c.primary }}
              >
                <Ionicons name="add" size={20} color={c.onPrimary} />
              </Pressable>
            </View>
          </Card>
        </View>

        {/* Forma */}
        <View>
          <SectionTitle title="Forma (ostatnie mecze)" />
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <FormDots form={player.form} />
              <Text style={{ color: c.textMuted, fontSize: font.small }}>
                śr. {(player.form.reduce((s, v) => s + v, 0) / player.form.length).toFixed(1)}
              </Text>
            </View>
          </Card>
        </View>

        {/* Rozwój */}
        <View>
          <SectionTitle title="Rozwój oceny ogólnej" />
          <Card>
            <MiniBars points={player.development} color={c.info} />
          </Card>
        </View>

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

        {/* Cele treningowe */}
        <View>
          <SectionTitle title="Cele treningowe" />
          <Card style={{ gap: spacing.md }}>
            {goalsByPlayer(player.id).length === 0 ? (
              <Text style={{ color: c.textMuted, fontSize: font.small }}>Brak celów. Dodaj pierwszy poniżej.</Text>
            ) : (
              goalsByPlayer(player.id).map((g) => (
                <View key={g.id} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                  <Pressable onPress={() => toggleGoal(g.id)}>
                    <Ionicons
                      name={g.done ? 'checkmark-circle' : 'ellipse-outline'}
                      size={22}
                      color={g.done ? c.primary : c.tabInactive}
                    />
                  </Pressable>
                  <Text
                    style={{
                      flex: 1,
                      color: g.done ? c.textMuted : c.text,
                      textDecorationLine: g.done ? 'line-through' : 'none',
                      fontSize: font.small,
                    }}
                  >
                    {g.text}
                  </Text>
                  <Pressable onPress={() => removeGoal(g.id)}>
                    <Ionicons name="trash-outline" size={18} color={c.danger} />
                  </Pressable>
                </View>
              ))
            )}
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <TextInput
                value={goalText}
                onChangeText={setGoalText}
                placeholder="Nowy cel treningowy…"
                placeholderTextColor={c.tabInactive}
                onSubmitEditing={() => {
                  if (goalText.trim()) {
                    addGoal(player.id, goalText.trim());
                    setGoalText('');
                  }
                }}
                style={{
                  flex: 1,
                  backgroundColor: c.cardAlt,
                  borderRadius: radius.md,
                  padding: spacing.md,
                  color: c.text,
                }}
              />
              <Pressable
                onPress={() => {
                  if (goalText.trim()) {
                    addGoal(player.id, goalText.trim());
                    setGoalText('');
                  }
                }}
                style={{
                  paddingHorizontal: spacing.lg,
                  justifyContent: 'center',
                  borderRadius: radius.md,
                  backgroundColor: c.primary,
                }}
              >
                <Ionicons name="add" size={20} color={c.onPrimary} />
              </Pressable>
            </View>
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
