import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, TextInput, Alert, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useStore } from '@/src/store';
import { PLANS, FEATURE_LABELS, getPlan, priceWith, YEARLY_MONTHS_FREE, type FeatureKey } from '@/src/plans';
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
  const { currentPlan, setPlan, trialActive, trialDaysLeft, billingCycle, setBillingCycle, coupon, applyCoupon, clearCoupon } = useStore();
  const online = isOnlinePaymentsEnabled();
  const [code, setCode] = useState('');
  const yearly = billingCycle === 'yearly';

  const choose = async (planId: string, name: string) => {
    const price = priceWith(getPlan(planId as any).price, billingCycle, coupon);
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

        {/* Cykl rozliczeń */}
        <View style={{ flexDirection: 'row', backgroundColor: c.card, borderRadius: radius.pill, padding: 4, borderWidth: 1, borderColor: c.border }}>
          {([['monthly', 'Miesięcznie'], ['yearly', 'Rocznie']] as const).map(([cyc, label]) => {
            const active = billingCycle === cyc;
            return (
              <Pressable
                key={cyc}
                onPress={() => setBillingCycle(cyc)}
                style={{ flex: 1, alignItems: 'center', paddingVertical: spacing.sm, borderRadius: radius.pill, backgroundColor: active ? c.primary : 'transparent' }}
              >
                <Text style={{ color: active ? c.onPrimary : c.text, fontWeight: '700', fontSize: font.small }}>
                  {label}
                  {cyc === 'yearly' ? ` · ${YEARLY_MONTHS_FREE} mies. gratis` : ''}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Kupon */}
        <Card style={{ gap: spacing.sm }}>
          <Text style={{ color: c.textMuted, fontSize: font.small, fontWeight: '600' }}>Masz kod rabatowy?</Text>
          {coupon ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Badge label={`${coupon.code} · ${coupon.label}`} color={c.primary} bg={c.primarySoft} />
              <Pressable onPress={() => { clearCoupon(); setCode(''); }}>
                <Text style={{ color: c.danger, fontWeight: '700', fontSize: font.small }}>Usuń</Text>
              </Pressable>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <TextInput
                value={code}
                onChangeText={setCode}
                autoCapitalize="characters"
                placeholder="np. START20"
                placeholderTextColor={c.tabInactive}
                style={{ flex: 1, backgroundColor: c.cardAlt, borderRadius: radius.md, padding: spacing.md, color: c.text }}
              />
              <Pressable
                onPress={() => {
                  const ok = applyCoupon(code);
                  if (!ok && Platform.OS !== 'web') Alert.alert('Kupon', 'Nieprawidłowy kod.');
                }}
                style={{ paddingHorizontal: spacing.lg, justifyContent: 'center', borderRadius: radius.md, backgroundColor: c.primary }}
              >
                <Text style={{ color: c.onPrimary, fontWeight: '800' }}>Zastosuj</Text>
              </Pressable>
            </View>
          )}
        </Card>

        {PLANS.map((plan) => {
          const active = currentPlan === plan.id;
          const price = priceWith(plan.price, billingCycle, coupon);
          const base = yearly ? plan.price * 12 : plan.price;
          const discounted = price < base;
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
                  {discounted ? (
                    <Text style={{ color: c.textMuted, fontSize: font.tiny, textDecorationLine: 'line-through' }}>
                      {formatMoney(base)}
                    </Text>
                  ) : null}
                  <Text style={{ color: c.text, fontWeight: '900', fontSize: font.h2 }}>{formatMoney(price)}</Text>
                  <Text style={{ color: c.textMuted, fontSize: font.tiny }}>/ {yearly ? 'rok' : 'miesiąc'}</Text>
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
