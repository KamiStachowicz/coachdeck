import React from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useStore } from '@/src/store';
import { getSport } from '@/src/data';
import { useTheme, spacing, font, radius } from '@/src/theme';
import { Card, Avatar, EmptyState, formatDate, formatTime } from '@/components/ui';

export default function AttendanceScreen() {
  const c = useTheme();
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const { events, getTeam, playersByTeam, getAttendance, setAttendance } = useStore();

  const event = events.find((e) => e.id === eventId);
  if (!event) return <EmptyState icon="alert-circle-outline" text="Nie znaleziono wydarzenia." />;

  const team = getTeam(event.teamId);
  const sport = team ? getSport(team.sport) : null;
  const roster = playersByTeam(event.teamId);
  const att = getAttendance(eventId);

  const presentCount = roster.filter((p) => att[p.id] === true).length;
  const markedCount = roster.filter((p) => p.id in att).length;

  return (
    <>
      <Stack.Screen options={{ title: 'Frekwencja' }} />
      <ScrollView
        style={{ backgroundColor: c.background }}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
      >
        {/* Nagłówek wydarzenia */}
        <Card style={{ backgroundColor: event.type === 'match' ? c.accent : c.primary }}>
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: font.h3 }}>{event.title}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: font.small, marginTop: 2 }}>
            {team?.name} · {formatDate(event.date)} · {formatTime(event.date)}
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.lg, marginTop: spacing.md }}>
            <View>
              <Text style={{ color: '#fff', fontWeight: '900', fontSize: font.h2 }}>{presentCount}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: font.tiny }}>obecnych</Text>
            </View>
            <View>
              <Text style={{ color: '#fff', fontWeight: '900', fontSize: font.h2 }}>{roster.length}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: font.tiny }}>w kadrze</Text>
            </View>
          </View>
        </Card>

        {roster.length === 0 ? (
          <EmptyState icon="people-outline" text="Brak zawodników w drużynie." />
        ) : (
          <View style={{ gap: spacing.md }}>
            {roster.map((p) => {
              const state = att[p.id]; // true / false / undefined
              return (
                <Card key={p.id} style={{ padding: spacing.md }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                    <Avatar first={p.firstName} last={p.lastName} size={38} color={sport?.color} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: c.text, fontWeight: '700', fontSize: font.small }}>
                        {p.number ? `#${p.number} ` : ''}
                        {p.firstName} {p.lastName}
                      </Text>
                      <Text style={{ color: c.textMuted, fontSize: font.tiny }}>{p.position ?? '—'}</Text>
                    </View>
                    {/* przyciski obecny / nieobecny */}
                    <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                      <Pressable
                        onPress={() => setAttendance(eventId, p.id, true)}
                        style={{
                          width: 42,
                          height: 38,
                          borderRadius: radius.md,
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: state === true ? c.primary : c.cardAlt,
                        }}
                      >
                        <Ionicons name="checkmark" size={20} color={state === true ? '#fff' : c.textMuted} />
                      </Pressable>
                      <Pressable
                        onPress={() => setAttendance(eventId, p.id, false)}
                        style={{
                          width: 42,
                          height: 38,
                          borderRadius: radius.md,
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: state === false ? c.danger : c.cardAlt,
                        }}
                      >
                        <Ionicons name="close" size={20} color={state === false ? '#fff' : c.textMuted} />
                      </Pressable>
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
        )}

        <Text style={{ color: c.textMuted, fontSize: font.tiny, textAlign: 'center' }}>
          Oznaczono {markedCount}/{roster.length}. Frekwencja liczy się do statystyk zawodnika.
        </Text>
      </ScrollView>
    </>
  );
}
