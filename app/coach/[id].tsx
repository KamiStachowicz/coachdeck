import React from 'react';
import { ScrollView, View, Text, Share } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { DIRECTORY_COACHES, REVIEWS } from '@/src/data';
import { useTheme, spacing, font, radius } from '@/src/theme';
import { Card, Badge, PrimaryButton, EmptyState, formatMoney, formatDate } from '@/components/ui';
import { Stars } from '../directory';

export default function CoachDetail() {
  const c = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const coach = DIRECTORY_COACHES.find((d) => d.id === id);
  if (!coach) return <EmptyState icon="alert-circle-outline" text="Nie znaleziono trenera." />;

  const reviews = REVIEWS.filter((r) => r.coachId === coach.id).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <Stack.Screen options={{ title: coach.name }} />
      <ScrollView
        style={{ backgroundColor: c.background }}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
      >
        {/* Nagłówek */}
        <Card style={{ backgroundColor: coach.color }}>
          <View style={{ alignItems: 'center', gap: spacing.sm }}>
            <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#fff', fontWeight: '900', fontSize: 24 }}>
                {coach.name.split(' ').map((w) => w[0]).join('')}
              </Text>
            </View>
            <Text style={{ color: '#fff', fontWeight: '900', fontSize: font.h2 }}>{coach.name}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: font.small }}>
              {coach.discipline} · {coach.city}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Stars rating={coach.rating} size={18} />
              <Text style={{ color: '#fff', fontWeight: '800' }}>{coach.rating}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: font.small }}>({coach.reviewsCount} opinii)</Text>
            </View>
          </View>
        </Card>

        {/* Cena + o mnie */}
        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: c.text, fontWeight: '700' }}>Stawka</Text>
            <Text style={{ color: c.primary, fontWeight: '900', fontSize: font.h3 }}>
              {formatMoney(coach.pricePerHour)} / godz.
            </Text>
          </View>
          <Text style={{ color: c.textMuted, fontSize: font.small, marginTop: spacing.sm }}>{coach.bio}</Text>
        </Card>

        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <PrimaryButton label="Napisz" icon="chatbubble-outline" onPress={() => {}} style={{ flex: 1 }} />
          <PrimaryButton
            label="Udostępnij"
            icon="share-social-outline"
            onPress={() => Share.share({ message: `${coach.name} – ${coach.discipline} (${coach.rating}★) w CoachDeck` }).catch(() => {})}
            style={{ flex: 1, backgroundColor: c.info }}
          />
        </View>

        {/* Opinie */}
        <View>
          <Text style={{ color: c.text, fontWeight: '800', fontSize: font.h3, marginBottom: spacing.md }}>
            Opinie ({reviews.length})
          </Text>
          {reviews.length === 0 ? (
            <EmptyState icon="chatbubbles-outline" text="Brak opinii." />
          ) : (
            <View style={{ gap: spacing.md }}>
              {reviews.map((r) => (
                <Card key={r.id}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ color: c.text, fontWeight: '700' }}>{r.author}</Text>
                    <Stars rating={r.rating} />
                  </View>
                  <Text style={{ color: c.textMuted, fontSize: font.small, marginTop: 6 }}>{r.text}</Text>
                  <Text style={{ color: c.tabInactive, fontSize: font.tiny, marginTop: 6 }}>{formatDate(r.date)}</Text>
                </Card>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
}
