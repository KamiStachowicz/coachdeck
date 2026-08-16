import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useStore } from '@/src/store';
import { getSport } from '@/src/data';
import { useTheme, spacing, font, radius } from '@/src/theme';
import { Card, Badge, PrimaryButton, EmptyState, formatDate, formatTime } from '@/components/ui';
import { MonthCalendar, dayKey } from '@/components/MonthCalendar';

export default function CalendarScreen() {
  const c = useTheme();
  const router = useRouter();
  const { events, getTeam } = useStore();
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const marks = new Set(events.map((e) => dayKey(new Date(e.date))));

  const visible = selectedDay
    ? events.filter((e) => dayKey(new Date(e.date)) === dayKey(selectedDay))
    : events;
  const sorted = [...visible].sort((a, b) => a.date.localeCompare(b.date));

  // grupowanie po dacie (dzień)
  const groups: Record<string, typeof sorted> = {};
  for (const e of sorted) {
    const key = new Date(e.date).toDateString();
    (groups[key] ??= []).push(e);
  }

  return (
    <ScrollView
      style={{ backgroundColor: c.background }}
      contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
    >
      <PrimaryButton label="Dodaj wydarzenie" icon="add" onPress={() => router.push('/modal?type=event')} />

      {/* Kalendarz miesięczny */}
      <MonthCalendar
        selected={selectedDay}
        onSelect={(d) => setSelectedDay((prev) => (prev && dayKey(prev) === dayKey(d) ? null : d))}
        marks={marks}
      />

      {selectedDay ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ color: c.text, fontWeight: '800', fontSize: font.body }}>{formatDate(selectedDay.toISOString())}</Text>
          <Pressable onPress={() => setSelectedDay(null)}>
            <Text style={{ color: c.primary, fontWeight: '700', fontSize: font.small }}>Pokaż wszystkie</Text>
          </Pressable>
        </View>
      ) : null}

      {sorted.length === 0 ? (
        <EmptyState icon="calendar-outline" text={selectedDay ? 'Brak wydarzeń tego dnia.' : 'Brak zaplanowanych wydarzeń.'} />
      ) : (
        Object.entries(groups).map(([day, items]) => (
          <View key={day} style={{ gap: spacing.md }}>
            <Text style={{ color: c.textMuted, fontWeight: '700', fontSize: font.small }}>
              {formatDate(items[0].date)}
            </Text>
            {items.map((e) => {
              const team = getTeam(e.teamId);
              const sport = team ? getSport(team.sport) : null;
              const isMatch = e.type === 'match';
              return (
                <Card key={e.id} onPress={() => router.push(`/attendance/${e.id}`)}>
                  <View style={{ flexDirection: 'row', gap: spacing.md }}>
                    <View style={{ alignItems: 'center', width: 54 }}>
                      <Text style={{ color: c.text, fontWeight: '800' }}>{formatTime(e.date)}</Text>
                      <View
                        style={{
                          marginTop: 6,
                          width: 30,
                          height: 30,
                          borderRadius: radius.sm,
                          backgroundColor: (isMatch ? c.accent : c.primary) + '22',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Ionicons
                          name={isMatch ? 'trophy-outline' : 'barbell-outline'}
                          size={16}
                          color={isMatch ? c.accent : c.primary}
                        />
                      </View>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: c.text, fontWeight: '700', fontSize: font.body }}>
                        {e.title}
                        {e.opponent ? ` · ${e.opponent}` : ''}
                      </Text>
                      <Text style={{ color: c.textMuted, fontSize: font.small, marginTop: 2 }}>
                        {team?.name}
                        {e.location ? ` · ${e.location}` : ''}
                      </Text>
                      <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: 8 }}>
                        <Badge
                          label={isMatch ? 'Mecz' : 'Trening'}
                          color={isMatch ? c.accent : c.primary}
                          bg={(isMatch ? c.accent : c.primary) + '22'}
                        />
                        {sport ? <Badge label={sport.name} /> : null}
                      </View>
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
        ))
      )}
    </ScrollView>
  );
}
