import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { Stack } from 'expo-router';

import { STANDINGS, RESULTS } from '@/src/data';
import { useTheme, spacing, font, radius } from '@/src/theme';
import { Card, Badge, SectionTitle, formatDate } from '@/components/ui';

export default function LeagueScreen() {
  const c = useTheme();
  const sorted = [...STANDINGS].sort(
    (a, b) => b.points - a.points || b.goalsFor - b.goalsAgainst - (a.goalsFor - a.goalsAgainst),
  );

  const col = (w: number) => ({ width: w, textAlign: 'center' as const });

  return (
    <>
      <Stack.Screen options={{ title: 'Liga i wyniki' }} />
      <ScrollView
        style={{ backgroundColor: c.background }}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
      >
        {/* Tabela */}
        <View>
          <SectionTitle title="Tabela ligowa" />
          <Card style={{ padding: spacing.sm }}>
            {/* nagłówek */}
            <View style={{ flexDirection: 'row', paddingVertical: spacing.sm, paddingHorizontal: spacing.sm }}>
              <Text style={{ width: 24, color: c.textMuted, fontSize: font.tiny, fontWeight: '700' }}>#</Text>
              <Text style={{ flex: 1, color: c.textMuted, fontSize: font.tiny, fontWeight: '700' }}>Drużyna</Text>
              <Text style={{ ...col(28), color: c.textMuted, fontSize: font.tiny, fontWeight: '700' }}>M</Text>
              <Text style={{ ...col(48), color: c.textMuted, fontSize: font.tiny, fontWeight: '700' }}>B</Text>
              <Text style={{ ...col(34), color: c.textMuted, fontSize: font.tiny, fontWeight: '800' }}>Pkt</Text>
            </View>
            {sorted.map((row, i) => {
              const me = row.teamId === 'me';
              const pos = i + 1;
              const posColor = pos <= 2 ? c.primary : pos >= sorted.length - 1 ? c.danger : c.textMuted;
              return (
                <View
                  key={row.teamId}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: spacing.sm,
                    paddingHorizontal: spacing.sm,
                    borderRadius: radius.sm,
                    backgroundColor: me ? c.primarySoft : 'transparent',
                  }}
                >
                  <Text style={{ width: 24, color: posColor, fontWeight: '800', fontSize: font.small }}>{pos}</Text>
                  <Text
                    style={{ flex: 1, color: c.text, fontWeight: me ? '800' : '600', fontSize: font.small }}
                    numberOfLines={1}
                  >
                    {row.name}
                  </Text>
                  <Text style={{ ...col(28), color: c.textMuted, fontSize: font.small }}>{row.played}</Text>
                  <Text style={{ ...col(48), color: c.textMuted, fontSize: font.small }}>
                    {row.goalsFor}:{row.goalsAgainst}
                  </Text>
                  <Text style={{ ...col(34), color: c.text, fontWeight: '900', fontSize: font.small }}>
                    {row.points}
                  </Text>
                </View>
              );
            })}
          </Card>
          <Text style={{ color: c.textMuted, fontSize: font.tiny, marginTop: spacing.sm }}>
            M – mecze, B – bramki, Pkt – punkty. Zielone: awans, czerwone: spadek.
          </Text>
        </View>

        {/* Ostatnie wyniki */}
        <View>
          <SectionTitle title="Ostatnie mecze" />
          <View style={{ gap: spacing.md }}>
            {[...RESULTS].reverse().map((m) => {
              const win = m.goalsFor > m.goalsAgainst;
              const draw = m.goalsFor === m.goalsAgainst;
              const resultColor = win ? c.primary : draw ? c.warning : c.danger;
              const resultLabel = win ? 'W' : draw ? 'R' : 'P';
              return (
                <Card key={m.id}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                    <View
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: radius.sm,
                        backgroundColor: resultColor,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{ color: '#fff', fontWeight: '900' }}>{resultLabel}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: c.text, fontWeight: '700', fontSize: font.body }}>
                        {m.home ? 'Orły' : m.opponent} {m.goalsFor}:{m.goalsAgainst}{' '}
                        {m.home ? m.opponent : 'Orły'}
                      </Text>
                      <Text style={{ color: c.textMuted, fontSize: font.small }}>
                        {formatDate(m.date)} · {m.home ? 'u siebie' : 'na wyjeździe'}
                      </Text>
                    </View>
                    {m.competition ? <Badge label={m.competition} /> : null}
                  </View>
                </Card>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </>
  );
}
