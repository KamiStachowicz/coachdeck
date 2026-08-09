import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useStore } from '@/src/store';
import { getSport } from '@/src/data';
import { useTheme, spacing, font, radius } from '@/src/theme';
import {
  Card,
  SectionTitle,
  StatTile,
  Badge,
  Avatar,
  formatDate,
  formatTime,
  formatMoney,
} from '@/components/ui';

export default function Dashboard() {
  const c = useTheme();
  const router = useRouter();
  const { teams, players, events, getTeam, financeSummary } = useStore();

  const now = new Date();
  const upcoming = [...events]
    .filter((e) => new Date(e.date) >= new Date(now.getFullYear(), now.getMonth(), now.getDate()))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  const injured = players.filter((p) => p.status === 'injured').length;

  return (
    <ScrollView
      style={{ backgroundColor: c.background }}
      contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
    >
      {/* Powitanie */}
      <View>
        <Text style={{ color: c.textMuted, fontSize: font.small }}>Witaj z powrotem,</Text>
        <Text style={{ color: c.text, fontSize: font.h1, fontWeight: '800' }}>Trenerze 👋</Text>
      </View>

      {/* Statystyki */}
      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <StatTile label="Drużyny" value={teams.length} icon="shield-outline" />
        <StatTile label="Zawodnicy" value={players.length} icon="people-outline" tint={c.info} />
      </View>
      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <StatTile label="Wydarzenia" value={events.length} icon="calendar-outline" tint={c.accent} />
        <StatTile label="Kontuzje" value={injured} icon="medkit-outline" tint={c.danger} />
      </View>

      {/* Finanse */}
      <Card onPress={() => router.push('/finances')}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <View
            style={{
              width: 46,
              height: 46,
              borderRadius: radius.md,
              backgroundColor: c.primary + '22',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="wallet-outline" size={22} color={c.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: c.text, fontWeight: '700', fontSize: font.body }}>Finanse i składki</Text>
            <Text style={{ color: c.textMuted, fontSize: font.small }}>
              Zebrano {formatMoney(financeSummary.collected)}
              {financeSummary.overdue > 0 ? ` · zaległe ${formatMoney(financeSummary.overdue)}` : ''}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ color: c.primary, fontWeight: '900', fontSize: font.h3 }}>
              {formatMoney(financeSummary.total)}
            </Text>
            <Text style={{ color: c.textMuted, fontSize: font.tiny }}>do zebrania</Text>
          </View>
        </View>
      </Card>

      {/* Najbliższe wydarzenia */}
      <View>
        <SectionTitle title="Najbliższe" action="Kalendarz" onAction={() => router.push('/calendar')} />
        <View style={{ gap: spacing.md }}>
          {upcoming.map((e) => {
            const team = getTeam(e.teamId);
            const sport = team ? getSport(team.sport) : null;
            const isMatch = e.type === 'match';
            return (
              <Card key={e.id} onPress={() => router.push('/calendar')}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                  <View
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: radius.md,
                      backgroundColor: (isMatch ? c.accent : c.primary) + '22',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons
                      name={isMatch ? 'trophy-outline' : 'barbell-outline'}
                      size={22}
                      color={isMatch ? c.accent : c.primary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: c.text, fontWeight: '700', fontSize: font.body }}>
                      {e.title}
                      {e.opponent ? ` · ${e.opponent}` : ''}
                    </Text>
                    <Text style={{ color: c.textMuted, fontSize: font.small }}>
                      {team?.name} {sport ? `· ${sport.name}` : ''}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ color: c.text, fontWeight: '700', fontSize: font.small }}>
                      {formatDate(e.date)}
                    </Text>
                    <Text style={{ color: c.textMuted, fontSize: font.small }}>{formatTime(e.date)}</Text>
                  </View>
                </View>
              </Card>
            );
          })}
        </View>
      </View>

      {/* Moje drużyny */}
      <View>
        <SectionTitle title="Moje drużyny" action="Zobacz wszystkie" onAction={() => router.push('/teams')} />
        <View style={{ gap: spacing.md }}>
          {teams.map((t) => {
            const sport = getSport(t.sport);
            const count = players.filter((p) => p.teamId === t.id).length;
            return (
              <Card key={t.id} onPress={() => router.push(`/team/${t.id}`)}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                  <Avatar first={t.name[0]} last={t.name[1] ?? ''} color={t.colorAccent} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: c.text, fontWeight: '700', fontSize: font.body }}>{t.name}</Text>
                    <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: 4 }}>
                      <Badge label={sport.name} color={sport.color} bg={sport.color + '22'} />
                      <Badge label={t.category} />
                    </View>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ color: c.text, fontWeight: '800', fontSize: font.h3 }}>{count}</Text>
                    <Text style={{ color: c.textMuted, fontSize: font.tiny }}>zawodn.</Text>
                  </View>
                </View>
              </Card>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}
