import React from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useStore } from '@/src/store';
import { useTheme, spacing, font, radius } from '@/src/theme';
import { Card, Badge, ProgressBar, EmptyState, formatMoney } from '@/components/ui';

export default function CampsScreen() {
  const c = useTheme();
  const { camps, campSignup } = useStore();

  const potential = camps.reduce((s, cmp) => s + cmp.signups * cmp.deposit, 0);

  return (
    <>
      <Stack.Screen options={{ title: 'Obozy i eventy' }} />
      <ScrollView
        style={{ backgroundColor: c.background }}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
      >
        <Card style={{ backgroundColor: c.primary }}>
          <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: font.small }}>Zebrane zaliczki (szac.)</Text>
          <Text style={{ color: '#fff', fontSize: 30, fontWeight: '900', marginTop: 2 }}>{formatMoney(potential)}</Text>
        </Card>

        {camps.length === 0 ? (
          <EmptyState icon="bonfire-outline" text="Brak obozów. Dodaj pierwszy." />
        ) : (
          <View style={{ gap: spacing.md }}>
            {camps.map((cmp) => {
              const left = cmp.capacity - cmp.signups;
              const pct = Math.round((cmp.signups / cmp.capacity) * 100);
              const full = left <= 0;
              return (
                <Card key={cmp.id}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                    <View
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: radius.md,
                        backgroundColor: c.accent + '22',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Ionicons name="bonfire-outline" size={24} color={c.accent} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: c.text, fontWeight: '800', fontSize: font.body }}>{cmp.title}</Text>
                      <Text style={{ color: c.textMuted, fontSize: font.small }}>
                        {cmp.location} · {cmp.dateRange}
                      </Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md, flexWrap: 'wrap' }}>
                    <Badge label={`Cena ${formatMoney(cmp.price)}`} color={c.primary} bg={c.primary + '22'} />
                    <Badge label={`Zaliczka ${formatMoney(cmp.deposit)}`} />
                    <Badge label={full ? 'Brak miejsc' : `Wolne: ${left}`} color={full ? c.danger : c.info} bg={(full ? c.danger : c.info) + '22'} />
                  </View>

                  <View style={{ marginTop: spacing.md, gap: 6 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ color: c.textMuted, fontSize: font.tiny }}>Zapisani</Text>
                      <Text style={{ color: c.textMuted, fontSize: font.tiny }}>
                        {cmp.signups}/{cmp.capacity}
                      </Text>
                    </View>
                    <ProgressBar value={pct} color={full ? c.danger : c.accent} />
                  </View>

                  <Pressable
                    onPress={() => campSignup(cmp.id)}
                    disabled={full}
                    style={{
                      marginTop: spacing.md,
                      alignItems: 'center',
                      paddingVertical: spacing.md,
                      borderRadius: radius.md,
                      backgroundColor: full ? c.cardAlt : c.primary,
                    }}
                  >
                    <Text style={{ color: full ? c.textMuted : c.onPrimary, fontWeight: '800' }}>
                      {full ? 'Lista pełna' : 'Zapisz uczestnika'}
                    </Text>
                  </Pressable>
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>
    </>
  );
}
