import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useStore } from '@/src/store';
import { PLATFORM_SUBSCRIPTIONS, getPlan, serviceFee, SERVICE_FEE } from '@/src/plans';
import { useTheme, spacing, font, radius } from '@/src/theme';
import { Card, SectionTitle, StatTile, Paywall, formatMoney } from '@/components/ui';

export default function RevenueScreen() {
  const c = useTheme();
  const { hasFeature, payments } = useStore();

  if (!hasFeature('revenue')) {
    return (
      <>
        <Stack.Screen options={{ title: 'Panel przychodów' }} />
        <View style={{ flex: 1, backgroundColor: c.background, justifyContent: 'center' }}>
          <Paywall feature="Panel przychodów" planName="Klub" />
        </View>
      </>
    );
  }

  // MRR z subskrypcji (demo).
  const byPlan: Record<string, number> = {};
  let mrr = 0;
  for (const s of PLATFORM_SUBSCRIPTIONS) {
    const price = getPlan(s.plan).price;
    mrr += price;
    byPlan[s.plan] = (byPlan[s.plan] ?? 0) + 1;
  }
  const paidClubs = PLATFORM_SUBSCRIPTIONS.filter((s) => getPlan(s.plan).price > 0).length;

  // Prowizja ze składek (realna z danych klubu).
  const paidPayments = payments.filter((p) => p.status === 'paid');
  const commission = paidPayments.reduce((s, p) => s + serviceFee(p.amount), 0);
  const processed = paidPayments.reduce((s, p) => s + p.amount, 0);

  const total = mrr + commission;

  return (
    <>
      <Stack.Screen options={{ title: 'Panel przychodów' }} />
      <ScrollView
        style={{ backgroundColor: c.background }}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
      >
        {/* Suma */}
        <Card style={{ backgroundColor: c.primary }}>
          <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: font.small }}>
            Przychód miesięczny (MRR + prowizje)
          </Text>
          <Text style={{ color: '#fff', fontSize: 34, fontWeight: '900', marginTop: 4 }}>
            {formatMoney(total)}
          </Text>
        </Card>

        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <StatTile label="Subskrypcje MRR" value={formatMoney(mrr)} icon="repeat-outline" />
          <StatTile label="Prowizje" value={formatMoney(commission)} icon="cash-outline" tint={c.accent} />
        </View>
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <StatTile label="Płacące kluby" value={paidClubs} icon="business-outline" tint={c.info} />
          <StatTile label="Wpłaty online" value={formatMoney(processed)} icon="card-outline" tint={c.primary} />
        </View>

        {/* Subskrypcje wg planu */}
        <View>
          <SectionTitle title="Subskrypcje wg planu" />
          <Card style={{ gap: spacing.md }}>
            {Object.entries(byPlan).map(([planId, count]) => {
              const plan = getPlan(planId as any);
              return (
                <View key={planId} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: plan.color }} />
                  <Text style={{ flex: 1, color: c.text, fontWeight: '600' }}>{plan.name}</Text>
                  <Text style={{ color: c.textMuted, fontSize: font.small }}>{count} klub.</Text>
                  <Text style={{ color: c.text, fontWeight: '800', width: 90, textAlign: 'right' }}>
                    {formatMoney(plan.price * count)}
                  </Text>
                </View>
              );
            })}
          </Card>
        </View>

        {/* Prowizja info */}
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <Ionicons name="information-circle-outline" size={22} color={c.info} />
            <Text style={{ flex: 1, color: c.textMuted, fontSize: font.small }}>
              Prowizja serwisowa: {SERVICE_FEE.percent}% od każdej wpłaty online (min. {SERVICE_FEE.min} zł).
              Rośnie wraz z liczbą klubów przetwarzających składki.
            </Text>
          </View>
        </Card>

        <Text style={{ color: c.textMuted, fontSize: font.tiny, textAlign: 'center' }}>
          Dane subskrypcji demonstracyjne. Prowizje liczone z realnych opłaconych składek w aplikacji.
        </Text>
      </ScrollView>
    </>
  );
}
