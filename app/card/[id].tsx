import React from 'react';
import { View, Text, ScrollView, Share, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';

import { useStore } from '@/src/store';
import { overallOf } from '@/src/data';
import { useTheme, spacing, font } from '@/src/theme';
import { PlayerCard } from '@/components/PlayerCard';
import { PrimaryButton, EmptyState } from '@/components/ui';

export default function PlayerCardScreen() {
  const c = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getPlayer } = useStore();
  const { width } = useWindowDimensions();

  const player = getPlayer(id);
  if (!player) {
    return <EmptyState icon="alert-circle-outline" text="Nie znaleziono zawodnika." />;
  }

  const cardWidth = Math.min(320, width - spacing.lg * 2);

  const share = async () => {
    try {
      await Share.share({
        message: `${player.firstName} ${player.lastName} – ocena ${overallOf(
          player.ratings,
        )} ⭐\nKarta zawodnika w CoachDeck 🏆`,
      });
    } catch {
      /* użytkownik anulował */
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Karta zawodnika' }} />
      <ScrollView
        style={{ backgroundColor: c.background }}
        contentContainerStyle={{ padding: spacing.lg, alignItems: 'center', gap: spacing.xl }}
      >
        <PlayerCard player={player} width={cardWidth} style={{ marginTop: spacing.lg }} />

        <View style={{ alignItems: 'center', gap: spacing.sm }}>
          <Text style={{ color: c.text, fontWeight: '800', fontSize: font.h3 }}>
            {player.firstName} {player.lastName}
          </Text>
          <Text style={{ color: c.textMuted, fontSize: font.small, textAlign: 'center' }}>
            Pochwal się kartą swojego zawodnika — udostępnij ją znajomym i rodzicom.
          </Text>
        </View>

        <PrimaryButton label="Udostępnij kartę" icon="share-social-outline" onPress={share} style={{ alignSelf: 'stretch' }} />
      </ScrollView>
    </>
  );
}
