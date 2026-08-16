import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useStore } from '@/src/store';
import { getSport, isTeamSport } from '@/src/data';
import { useTheme, spacing, font, radius } from '@/src/theme';
import {
  Card,
  Avatar,
  Badge,
  SectionTitle,
  EmptyState,
  ProgressBar,
  paymentStatusMeta,
  formatMoney,
  formatDate,
  formatTime,
} from '@/components/ui';

export default function ParentView() {
  const c = useTheme();
  const { playerId } = useLocalSearchParams<{ playerId: string }>();
  const { getPlayer, getTeam, eventsByTeam, attendanceStats, paymentsByPlayer, announcements, recordsByPlayer } =
    useStore();

  const player = getPlayer(playerId);
  if (!player) return <EmptyState icon="alert-circle-outline" text="Nie znaleziono zawodnika." />;

  const team = getTeam(player.teamId);
  const sport = team ? getSport(team.sport) : null;
  const att = attendanceStats(player.id);
  const now = Date.now();
  const upcoming = eventsByTeam(player.teamId)
    .filter((e) => new Date(e.date).getTime() >= now - 86400000)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4);
  const payments = paymentsByPlayer(player.id);
  const dues = payments.filter((p) => p.status !== 'paid');
  const news = announcements
    .filter((a) => !a.teamId || a.teamId === player.teamId)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4);
  const records = recordsByPlayer(player.id);
  const individual = sport ? !isTeamSport(sport.id) : false;

  return (
    <>
      <Stack.Screen options={{ title: 'Podgląd rodzica' }} />
      <ScrollView
        style={{ backgroundColor: c.background }}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
      >
        {/* Nagłówek */}
        <Card style={{ backgroundColor: sport?.color ?? c.primary }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <Avatar first={player.firstName} last={player.lastName} size={56} color="rgba(255,255,255,0.25)" />
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#fff', fontWeight: '900', fontSize: font.h3 }}>
                {player.firstName} {player.lastName}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: font.small }}>
                {team?.name} {sport ? `· ${sport.name}` : ''}
              </Text>
            </View>
          </View>
        </Card>

        {/* Frekwencja */}
        {att.total > 0 ? (
          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ color: c.text, fontWeight: '700' }}>Frekwencja</Text>
              <Text style={{ color: c.primary, fontWeight: '900' }}>{att.pct}%</Text>
            </View>
            <ProgressBar value={att.pct} />
            <Text style={{ color: c.textMuted, fontSize: font.tiny, marginTop: 6 }}>
              Obecność {att.present}/{att.total}
            </Text>
          </Card>
        ) : null}

        {/* Składki */}
        <View>
          <SectionTitle title="Składki i opłaty" />
          {payments.length === 0 ? (
            <EmptyState icon="wallet-outline" text="Brak opłat." />
          ) : (
            <View style={{ gap: spacing.md }}>
              {payments.map((p) => {
                const st = paymentStatusMeta[p.status];
                return (
                  <Card key={p.id}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: c.text, fontWeight: '700', fontSize: font.small }}>{p.title}</Text>
                        <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: 4 }}>
                          <Badge label={st.label} color={st.color} bg={st.bg} />
                          <Badge label={`termin ${formatDate(p.dueDate)}`} />
                        </View>
                      </View>
                      <Text style={{ color: c.text, fontWeight: '900' }}>{formatMoney(p.amount)}</Text>
                    </View>
                  </Card>
                );
              })}
              {dues.length > 0 ? (
                <Text style={{ color: c.textMuted, fontSize: font.tiny }}>
                  Do zapłaty: {formatMoney(dues.reduce((s, p) => s + p.amount, 0))} — opłać u trenera lub online.
                </Text>
              ) : null}
            </View>
          )}
        </View>

        {/* Nadchodzące */}
        <View>
          <SectionTitle title="Nadchodzące" />
          {upcoming.length === 0 ? (
            <EmptyState icon="calendar-outline" text="Brak wydarzeń." />
          ) : (
            <View style={{ gap: spacing.md }}>
              {upcoming.map((e) => {
                const isMatch = e.type === 'match';
                return (
                  <Card key={e.id}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                      <Ionicons name={isMatch ? 'trophy-outline' : 'barbell-outline'} size={22} color={isMatch ? c.accent : c.primary} />
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: c.text, fontWeight: '700', fontSize: font.small }}>{e.title}</Text>
                        <Text style={{ color: c.textMuted, fontSize: font.tiny }}>
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

        {/* Rekordy (dyscypliny indywidualne) */}
        {individual && records.length > 0 ? (
          <View>
            <SectionTitle title="Rekordy" />
            <Card style={{ gap: spacing.sm }}>
              {records.map((r) => (
                <View key={r.id} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: c.text, fontSize: font.small }}>{r.event}</Text>
                  <Text style={{ color: c.text, fontWeight: '800' }}>{r.result}</Text>
                </View>
              ))}
            </Card>
          </View>
        ) : null}

        {/* Ogłoszenia */}
        <View>
          <SectionTitle title="Ogłoszenia" />
          {news.length === 0 ? (
            <EmptyState icon="chatbubbles-outline" text="Brak ogłoszeń." />
          ) : (
            <View style={{ gap: spacing.md }}>
              {news.map((a) => (
                <Card key={a.id}>
                  <Text style={{ color: c.text, fontWeight: '800', fontSize: font.small }}>{a.title}</Text>
                  <Text style={{ color: c.textMuted, fontSize: font.small, marginTop: 4 }}>{a.body}</Text>
                  <Text style={{ color: c.tabInactive, fontSize: font.tiny, marginTop: 6 }}>{formatDate(a.date)}</Text>
                </Card>
              ))}
            </View>
          )}
        </View>

        <Text style={{ color: c.textMuted, fontSize: font.tiny, textAlign: 'center' }}>
          To podgląd dla rodzica/zawodnika (tylko do odczytu).
        </Text>
      </ScrollView>
    </>
  );
}
