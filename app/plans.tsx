import React from 'react';
import { ScrollView, View, Text, Pressable, Alert, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useStore } from '@/src/store';
import { PLANS, FEATURE_LABELS, getPlan, type FeatureKey } from '@/src/plans';
import { isOnlinePaymentsEnabled } from '@/src/config';
import { startSubscription } from '@/src/payments/online';
import { useTheme, spacing, font, radius } from '@/src/theme';
import { Card, Badge, formatMoney } from '@/components/ui';

// Kolejność funkcji w tabeli porównawczej.
const FEATURE_ORDER: FeatureKey[] = [
  'tactics',
  'stats',
  'development',
  'scouting',
  'proLeague',
  'onlinePayments',
  'reports',
  'multiCoach',
  'revenue',
  'whiteLabel',
  'prioritySupport',
];

export default function PlansScreen() {
  const c = useTheme();
  const { currentPlan, setPlan, trialActive, trialDaysLeft } = useStore();
  const online = isOnlinePaymentsEnabled();

  const choose = async (planId: string, name: string) => {
    const price = getPlan(planId as any).price;
    // Brak podłączonego P24 → aktywacja lokalna (demo).
    if (!online) {
      setPlan(planId as any);
      if (Platform.OS !== 'web') {
        Alert.alert('Plan wybrany', `Plan ${name} aktywny (demo). Płatności podłączymy przez Przelewy24.`);
      }
      return;
    }
    // P24 podłączone → uruchom płatność za plan.
    const res = await startSubscription(planId, price, 'platnik@coachdeck.app');
    if (res.ok) setPlan(planId as any);
    else if (Platform.OS !== 'web') Alert.alert('Płatność', res.message ?? 'Nie udało się.');
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Plany i cennik' }} />
      <ScrollView
        style={{ backgroundColor: c.background }}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
      >
        <View>
          <Text style={{ color: c.text, fontSize: font.h1, fontWeight: '900' }}>Wybierz plan</Text>
          <Text style={{ color: c.textMuted, fontSize: font.small, marginTop: 4 }}>
            Odblokuj pełnię możliwości CoachDeck. Anuluj w dowolnym momencie.
          </Text>
        </View>

        {/* Baner okresu próbnego */}
        {trialActive ? (
          <Card style={{ backgroundColor: c.accent }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <Ionicons name="gift-outline" size={26} color="#fff" />
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#fff', fontWeight: '800', fontSize: font.body }}>
                  Darmowy okres próbny: {trialDaysLeft} dni
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: font.small }}>
                  Pełny dostęp. Wybierz plan, aby korzystać dalej po jego zakończeniu.
                </Text>
              </View>
            </View>
          </Card>
        ) : currentPlan === null ? (
          <Card style={{ backgroundColor: c.danger }}>
            <Text style={{ color: '#fff', fontWeight: '800' }}>Okres próbny zakończony</Text>
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: font.small, marginTop: 2 }}>
              Wybierz plan, aby odblokować funkcje premium.
            </Text>
          </Card>
        ) : null}

        {PLANS.map((plan) => {
          const active = currentPlan === plan.id;
          return (
            <Card
              key={plan.id}
              style={{
                borderColor: plan.highlight || active ? plan.color : c.border,
                borderWidth: plan.highlight || active ? 2 : StyleSheetHairline(),
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                    <Text style={{ color: c.text, fontWeight: '900', fontSize: font.h3 }}>{plan.name}</Text>
                    {plan.highlight ? <Badge label="Popularny" color={plan.color} bg={plan.color + '22'} /> : null}
                    {active ? <Badge label="Aktywny" color={c.primary} bg={c.primarySoft} /> : null}
                  </View>
                  <Text style={{ color: c.textMuted, fontSize: font.small, marginTop: 2 }}>{plan.tagline}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: c.text, fontWeight: '900', fontSize: font.h2 }}>
                    {plan.price === 0 ? '0 zł' : formatMoney(plan.price)}
                  </Text>
                  <Text style={{ color: c.textMuted, fontSize: font.tiny }}>/ miesiąc</Text>
                </View>
              </View>

              {/* limity */}
              <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md, flexWrap: 'wrap' }}>
                <Badge label={plan.limits.teams === null ? 'Drużyny: bez limitu' : `Drużyny: ${plan.limits.teams}`} />
                <Badge
                  label={
                    plan.limits.playersPerTeam === null
                      ? 'Zawodnicy: bez limitu'
                      : `Zawodnicy: ${plan.limits.playersPerTeam}`
                  }
                />
                <Badge label={plan.limits.coaches === null ? 'Trenerzy: bez limitu' : `Trenerzy: ${plan.limits.coaches}`} />
              </View>

              {/* funkcje */}
              <View style={{ marginTop: spacing.md, gap: 6 }}>
                {FEATURE_ORDER.map((f) => {
                  const has = plan.unlocks.includes(f);
                  return (
                    <View key={f} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                      <Ionicons
                        name={has ? 'checkmark-circle' : 'close-circle'}
                        size={16}
                        color={has ? plan.color : c.tabInactive}
                      />
                      <Text style={{ color: has ? c.text : c.textMuted, fontSize: font.small }}>
                        {FEATURE_LABELS[f]}
                      </Text>
                    </View>
                  );
                })}
              </View>

              <Pressable
                onPress={() => choose(plan.id, plan.name)}
                disabled={active}
                style={{
                  marginTop: spacing.lg,
                  paddingVertical: spacing.md,
                  borderRadius: radius.md,
                  alignItems: 'center',
                  backgroundColor: active ? c.cardAlt : plan.color,
                }}
              >
                <Text style={{ color: active ? c.textMuted : '#fff', fontWeight: '800' }}>
                  {active ? 'Twój obecny plan' : plan.price === 0 ? 'Wybierz' : 'Wybierz plan'}
                </Text>
              </Pressable>
            </Card>
          );
        })}

        <Text style={{ color: c.textMuted, fontSize: font.tiny, textAlign: 'center' }}>
          Płatności cykliczne obsłuży Przelewy24 (uruchomią się po podłączeniu kluczy). Teraz wybór
          planu działa w trybie demo.
        </Text>
      </ScrollView>
    </>
  );
}

function StyleSheetHairline() {
  return 1;
}
