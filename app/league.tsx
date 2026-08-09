import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable, ActivityIndicator, TextInput } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { STANDINGS, RESULTS } from '@/src/data';
import { useTheme, spacing, font, radius } from '@/src/theme';
import { Card, Badge, SectionTitle, EmptyState, formatDate } from '@/components/ui';
import type { StandingRow } from '@/src/types';
import {
  LEAGUE_PRESETS,
  fetchStandings,
  fetchPastEvents,
  searchLeagues,
  type LeaguePreset,
  type ProMatch,
} from '@/src/sports/thesportsdb';

type Mode = 'mine' | 'pro';

export default function LeagueScreen() {
  const c = useTheme();
  const [mode, setMode] = useState<Mode>('mine');

  return (
    <>
      <Stack.Screen options={{ title: 'Liga i wyniki' }} />
      <ScrollView
        style={{ backgroundColor: c.background }}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
      >
        {/* Przełącznik trybu */}
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {(['mine', 'pro'] as const).map((m) => {
            const active = mode === m;
            return (
              <Pressable
                key={m}
                onPress={() => setMode(m)}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  paddingVertical: spacing.md,
                  borderRadius: radius.md,
                  backgroundColor: active ? c.primary : c.card,
                  borderWidth: 1,
                  borderColor: active ? c.primary : c.border,
                }}
              >
                <Text style={{ color: active ? c.onPrimary : c.text, fontWeight: '800' }}>
                  {m === 'mine' ? 'Moja liga' : 'Liga zawodowa'}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {mode === 'mine' ? <MyLeague /> : <ProLeague />}
      </ScrollView>
    </>
  );
}

/* ---------------- Moja liga (dane własne/demo) ---------------- */

function MyLeague() {
  const c = useTheme();
  const sorted = [...STANDINGS].sort(
    (a, b) => b.points - a.points || b.goalsFor - b.goalsAgainst - (a.goalsFor - a.goalsAgainst),
  );
  return (
    <>
      <StandingsTable rows={sorted} highlightId="me" />
      <View>
        <SectionTitle title="Ostatnie mecze" />
        <View style={{ gap: spacing.md }}>
          {[...RESULTS].reverse().map((m) => {
            const win = m.goalsFor > m.goalsAgainst;
            const draw = m.goalsFor === m.goalsAgainst;
            const resultColor = win ? c.primary : draw ? c.warning : c.danger;
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
                    <Text style={{ color: '#fff', fontWeight: '900' }}>
                      {win ? 'W' : draw ? 'R' : 'P'}
                    </Text>
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
    </>
  );
}

/* ---------------- Liga zawodowa (TheSportsDB) ---------------- */

function ProLeague() {
  const c = useTheme();
  const [league, setLeague] = useState<LeaguePreset>(LEAGUE_PRESETS[0]);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<StandingRow[]>([]);
  const [season, setSeason] = useState<string>('');
  const [events, setEvents] = useState<ProMatch[]>([]);
  const [error, setError] = useState<string | null>(null);

  // wyszukiwarka
  const [query, setQuery] = useState('');
  const [found, setFound] = useState<LeaguePreset[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      const [st, ev] = await Promise.all([fetchStandings(league.id), fetchPastEvents(league.id)]);
      if (!active) return;
      if (st) {
        setRows(st.rows);
        setSeason(st.season);
      } else {
        setRows([]);
        setSeason('');
        setError('Brak tabeli dla tej ligi (możliwe ograniczenia darmowego klucza API).');
      }
      setEvents(ev.slice(0, 8));
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [league]);

  const runSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    const res = await searchLeagues(query.trim());
    setFound(res.slice(0, 8));
    setSearching(false);
  };

  return (
    <>
      {/* Presety lig */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
        {LEAGUE_PRESETS.map((l) => {
          const active = league.id === l.id;
          return (
            <Pressable
              key={l.id}
              onPress={() => setLeague(l)}
              style={{
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                borderRadius: radius.pill,
                backgroundColor: active ? c.primary : c.card,
                borderWidth: 1,
                borderColor: active ? c.primary : c.border,
              }}
            >
              <Text style={{ color: active ? c.onPrimary : c.text, fontWeight: '700', fontSize: font.small }}>
                {l.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Wyszukiwarka lig */}
      <Card>
        <Text style={{ color: c.textMuted, fontSize: font.small, marginBottom: 6 }}>
          Szukaj ligi po kraju (np. Poland, Spain)
        </Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={runSearch}
            placeholder="Kraj…"
            placeholderTextColor={c.tabInactive}
            style={{
              flex: 1,
              backgroundColor: c.cardAlt,
              borderRadius: radius.md,
              padding: spacing.md,
              color: c.text,
            }}
          />
          <Pressable
            onPress={runSearch}
            style={{
              paddingHorizontal: spacing.lg,
              justifyContent: 'center',
              borderRadius: radius.md,
              backgroundColor: c.primary,
            }}
          >
            <Ionicons name="search" size={18} color={c.onPrimary} />
          </Pressable>
        </View>
        {searching ? <ActivityIndicator style={{ marginTop: spacing.md }} color={c.primary} /> : null}
        {found.length > 0 ? (
          <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
            {found.map((l) => (
              <Pressable
                key={l.id}
                onPress={() => {
                  setLeague(l);
                  setFound([]);
                }}
                style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}
              >
                <Text style={{ color: c.text, fontWeight: '600' }}>{l.name}</Text>
                <Text style={{ color: c.textMuted, fontSize: font.small }}>{l.sport}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </Card>

      <SectionTitle title={`${league.name}${season ? ` · ${season}` : ''}`} />

      {loading ? (
        <ActivityIndicator style={{ marginVertical: spacing.xl }} color={c.primary} size="large" />
      ) : error ? (
        <EmptyState icon="cloud-offline-outline" text={error} />
      ) : (
        <>
          <StandingsTable rows={rows} />
          {events.length > 0 ? (
            <View>
              <SectionTitle title="Ostatnie mecze" />
              <View style={{ gap: spacing.sm }}>
                {events.map((m) => (
                  <Card key={m.id}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={{ color: c.text, flex: 1, fontWeight: '600' }} numberOfLines={1}>
                        {m.home}
                      </Text>
                      <Text style={{ color: c.text, fontWeight: '900', marginHorizontal: spacing.md }}>
                        {m.homeScore ?? '-'} : {m.awayScore ?? '-'}
                      </Text>
                      <Text style={{ color: c.text, flex: 1, textAlign: 'right', fontWeight: '600' }} numberOfLines={1}>
                        {m.away}
                      </Text>
                    </View>
                  </Card>
                ))}
              </View>
            </View>
          ) : null}
        </>
      )}

      <Text style={{ color: c.textMuted, fontSize: font.tiny }}>
        Dane: TheSportsDB (darmowy klucz testowy). Dla pełnej niezawodności ustaw własny klucz
        EXPO_PUBLIC_THESPORTSDB_KEY.
      </Text>
    </>
  );
}

/* ---------------- Wspólna tabela ---------------- */

function StandingsTable({ rows, highlightId }: { rows: StandingRow[]; highlightId?: string }) {
  const c = useTheme();
  if (rows.length === 0) return <EmptyState icon="list-outline" text="Brak danych tabeli." />;
  const col = (w: number) => ({ width: w, textAlign: 'center' as const });
  return (
    <Card style={{ padding: spacing.sm }}>
      <View style={{ flexDirection: 'row', paddingVertical: spacing.sm, paddingHorizontal: spacing.sm }}>
        <Text style={{ width: 24, color: c.textMuted, fontSize: font.tiny, fontWeight: '700' }}>#</Text>
        <Text style={{ flex: 1, color: c.textMuted, fontSize: font.tiny, fontWeight: '700' }}>Drużyna</Text>
        <Text style={{ ...col(28), color: c.textMuted, fontSize: font.tiny, fontWeight: '700' }}>M</Text>
        <Text style={{ ...col(48), color: c.textMuted, fontSize: font.tiny, fontWeight: '700' }}>B</Text>
        <Text style={{ ...col(34), color: c.textMuted, fontSize: font.tiny, fontWeight: '800' }}>Pkt</Text>
      </View>
      {rows.map((row, i) => {
        const me = highlightId && row.teamId === highlightId;
        const pos = i + 1;
        const posColor = pos <= 2 ? c.primary : pos >= rows.length - 1 ? c.danger : c.textMuted;
        return (
          <View
            key={row.teamId + i}
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
            <Text style={{ flex: 1, color: c.text, fontWeight: me ? '800' : '600', fontSize: font.small }} numberOfLines={1}>
              {row.name}
            </Text>
            <Text style={{ ...col(28), color: c.textMuted, fontSize: font.small }}>{row.played}</Text>
            <Text style={{ ...col(48), color: c.textMuted, fontSize: font.small }}>
              {row.goalsFor}:{row.goalsAgainst}
            </Text>
            <Text style={{ ...col(34), color: c.text, fontWeight: '900', fontSize: font.small }}>{row.points}</Text>
          </View>
        );
      })}
    </Card>
  );
}
