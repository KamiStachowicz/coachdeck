import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useStore } from '@/src/store';
import { DIRECTORY_COACHES, getSport } from '@/src/data';
import { useTheme, spacing, font, radius } from '@/src/theme';
import { Card, Badge, formatMoney } from '@/components/ui';

export function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 1 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons
          key={i}
          name={rating >= i ? 'star' : rating >= i - 0.5 ? 'star-half' : 'star-outline'}
          size={size}
          color="#F59E0B"
        />
      ))}
    </View>
  );
}

export default function DirectoryScreen() {
  const c = useTheme();
  const router = useRouter();
  const { listedInDirectory, setListed, coachSport, coachSpecs, coachProfile, clubName } = useStore();
  const [filter, setFilter] = useState<string | null>(null);

  const disciplines = Array.from(new Set(DIRECTORY_COACHES.map((d) => d.discipline)));
  const shown = filter ? DIRECTORY_COACHES.filter((d) => d.discipline === filter) : DIRECTORY_COACHES;

  const myDiscipline =
    coachProfile === 'personal'
      ? coachSpecs.slice(0, 2).join(', ') || 'Trener personalny'
      : coachSport
        ? getSport(coachSport).name
        : 'Trener';

  return (
    <>
      <Stack.Screen options={{ title: 'Znajdź trenera' }} />
      <ScrollView
        style={{ backgroundColor: c.background }}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
      >
        {/* Twoja wizytówka */}
        <Card style={{ backgroundColor: listedInDirectory ? c.primary : c.card }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <Ionicons name="storefront-outline" size={24} color={listedInDirectory ? '#fff' : c.primary} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: listedInDirectory ? '#fff' : c.text, fontWeight: '800', fontSize: font.body }}>
                Twoja wizytówka
              </Text>
              <Text style={{ color: listedInDirectory ? 'rgba(255,255,255,0.85)' : c.textMuted, fontSize: font.small }}>
                {listedInDirectory ? `Widoczny jako: ${myDiscipline}` : 'Pokaż się klientom z okolicy'}
              </Text>
            </View>
            <Pressable
              onPress={() => setListed(!listedInDirectory)}
              style={{
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                borderRadius: radius.pill,
                backgroundColor: listedInDirectory ? 'rgba(255,255,255,0.2)' : c.primary,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: font.small }}>
                {listedInDirectory ? 'Ukryj' : 'Wystaw się'}
              </Text>
            </Pressable>
          </View>
        </Card>

        {/* Filtry dyscyplin */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
          <Chip label="Wszyscy" active={!filter} onPress={() => setFilter(null)} />
          {disciplines.map((d) => (
            <Chip key={d} label={d} active={filter === d} onPress={() => setFilter(d)} />
          ))}
        </ScrollView>

        {/* Lista trenerów */}
        <View style={{ gap: spacing.md }}>
          {shown
            .sort((a, b) => b.rating - a.rating)
            .map((coach) => (
              <Card key={coach.id} onPress={() => router.push(`/coach/${coach.id}`)}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                  <View
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 26,
                      backgroundColor: coach.color,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ color: '#fff', fontWeight: '800' }}>
                      {coach.name.split(' ').map((w) => w[0]).join('')}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: c.text, fontWeight: '800', fontSize: font.body }}>{coach.name}</Text>
                    <Text style={{ color: c.textMuted, fontSize: font.small }}>
                      {coach.discipline} · {coach.city}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 4 }}>
                      <Stars rating={coach.rating} />
                      <Text style={{ color: c.text, fontWeight: '700', fontSize: font.small }}>{coach.rating}</Text>
                      <Text style={{ color: c.textMuted, fontSize: font.tiny }}>({coach.reviewsCount})</Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ color: c.primary, fontWeight: '900' }}>{formatMoney(coach.pricePerHour)}</Text>
                    <Text style={{ color: c.textMuted, fontSize: font.tiny }}>/ godz.</Text>
                  </View>
                </View>
              </Card>
            ))}
        </View>

        <Text style={{ color: c.textMuted, fontSize: font.tiny, textAlign: 'center' }}>
          Katalog demonstracyjny. Realne profile i rezerwacje po podłączeniu backendu.
        </Text>
      </ScrollView>
    </>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const c = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radius.pill,
        backgroundColor: active ? c.primary : c.card,
        borderWidth: 1,
        borderColor: active ? c.primary : c.border,
      }}
    >
      <Text style={{ color: active ? c.onPrimary : c.text, fontWeight: '600', fontSize: font.small }}>{label}</Text>
    </Pressable>
  );
}
