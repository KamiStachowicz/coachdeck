import React from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
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

interface QuickAction {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route: string;
  color: string;
}

export default function Dashboard() {
  const c = useTheme();
  const router = useRouter();
  const { teams, players, events, getTeam, financeSummary, profile, packagesByClient } = useStore();

  const isPersonal = profile.id === 'personal';
  const isIndividual = profile.id === 'individual';

  const now = new Date();
  const upcoming = [...events]
    .filter((e) => new Date(e.date) >= new Date(now.getFullYear(), now.getMonth(), now.getDate()))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  const injured = players.filter((p) => p.status === 'injured').length;
  const activePackages = players
    .flatMap((p) => packagesByClient(p.id))
    .filter((pk) => pk.total - pk.used > 0).length;

  // Szybkie akcje zależne od profilu
  const quick: QuickAction[] = isPersonal
    ? [
        { icon: 'people-outline', label: 'Klienci', route: '/players', color: c.primary },
        { icon: 'calendar-outline', label: 'Kalendarz', route: '/calendar', color: c.info },
        { icon: 'person-add-outline', label: 'Nowy klient', route: '/registrations', color: c.accent },
        { icon: 'clipboard-outline', label: 'Plany', route: '/training', color: '#7C3AED' },
      ]
    : isIndividual
      ? [
          { icon: 'people-outline', label: 'Zawodnicy', route: '/players', color: c.primary },
          { icon: 'calendar-outline', label: 'Kalendarz', route: '/calendar', color: c.info },
          { icon: 'person-add-outline', label: 'Nabór', route: '/registrations', color: c.accent },
          { icon: 'bonfire-outline', label: 'Obozy', route: '/camps', color: '#7C3AED' },
        ]
      : [
          {
            icon: 'grid-outline',
            label: 'Taktyka',
            route: teams[0] ? `/tactics/${teams[0].id}` : '/teams',
            color: c.primary,
          },
          { icon: 'trophy-outline', label: 'Liga', route: '/league', color: c.accent },
          { icon: 'clipboard-outline', label: 'Plany', route: '/training', color: c.info },
          { icon: 'person-add-outline', label: 'Nabór', route: '/registrations', color: '#7C3AED' },
        ];

  return (
    <ScrollView
      style={{ backgroundColor: c.background }}
      contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
    >
      {/* Powitanie */}
      <View>
        <Text style={{ color: c.textMuted, fontSize: font.small }}>Witaj z powrotem,</Text>
        <Text style={{ color: c.text, fontSize: font.h1, fontWeight: '800' }}>Trenerze 👋</Text>
        <Text style={{ color: c.primary, fontSize: font.small, fontWeight: '700', marginTop: 2 }}>
          {profile.name}
        </Text>
      </View>

      {/* Szybkie akcje */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
        {quick.map((q) => (
          <Pressable
            key={q.label}
            onPress={() => router.push(q.route as any)}
            style={{
              width: '47%',
              flexGrow: 1,
              backgroundColor: c.card,
              borderRadius: radius.lg,
              borderWidth: StyleSheet_hairline(),
              borderColor: c.border,
              padding: spacing.md,
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
            }}
          >
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: radius.md,
                backgroundColor: q.color + '22',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name={q.icon} size={20} color={q.color} />
            </View>
            <Text style={{ color: c.text, fontWeight: '700', fontSize: font.small }}>{q.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Statystyki (dopasowane do profilu) */}
      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <StatTile label={profile.labels.playersTab} value={players.length} icon="people-outline" />
        <StatTile label={profile.labels.teamsTab} value={teams.length} icon="shield-outline" tint={c.info} />
      </View>
      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <StatTile
          label={isPersonal ? 'Sesje' : 'Wydarzenia'}
          value={events.length}
          icon="calendar-outline"
          tint={c.accent}
        />
        {isPersonal ? (
          <StatTile label="Aktywne karnety" value={activePackages} icon="ticket-outline" tint={c.primary} />
        ) : (
          <StatTile label="Kontuzje" value={injured} icon="medkit-outline" tint={c.danger} />
        )}
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

      {/* Najbliższe */}
      <View>
        <SectionTitle
          title={isPersonal ? 'Najbliższe sesje' : 'Najbliższe'}
          action="Kalendarz"
          onAction={() => router.push('/calendar')}
        />
        <View style={{ gap: spacing.md }}>
          {upcoming.map((e) => {
            const team = getTeam(e.teamId);
            const sport = team ? getSport(team.sport) : null;
            const isMatch = e.type === 'match';
            return (
              <Card key={e.id} onPress={() => router.push(`/attendance/${e.id}`)}>
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

      {/* Moje drużyny / grupy */}
      <View>
        <SectionTitle
          title={`Moje ${profile.labels.teams}`}
          action="Zobacz wszystkie"
          onAction={() => router.push('/teams')}
        />
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
                    <Text style={{ color: c.textMuted, fontSize: font.tiny }}>
                      {profile.labels.players.slice(0, 6)}.
                    </Text>
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

function StyleSheet_hairline() {
  return 1;
}
