import React, { useMemo, useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useStore } from '@/src/store';
import { PAYMENT_KINDS } from '@/src/data';
import { useTheme, spacing, font, radius } from '@/src/theme';
import {
  Card,
  Badge,
  Avatar,
  PrimaryButton,
  EmptyState,
  ProgressBar,
  formatMoney,
  formatDate,
  paymentStatusMeta,
} from '@/components/ui';
import type { PaymentStatus } from '@/src/types';

type Filter = 'all' | PaymentStatus;

export default function FinancesScreen() {
  const c = useTheme();
  const router = useRouter();
  const { payments, getPlayer, getTeam, markPaid, markUnpaid, financeSummary } = useStore();
  const [filter, setFilter] = useState<Filter>('all');

  const sorted = useMemo(
    () =>
      [...payments].sort((a, b) => {
        const rank = { overdue: 0, pending: 1, paid: 2 } as const;
        if (rank[a.status] !== rank[b.status]) return rank[a.status] - rank[b.status];
        return a.dueDate.localeCompare(b.dueDate);
      }),
    [payments],
  );

  const filtered = filter === 'all' ? sorted : sorted.filter((p) => p.status === filter);

  const { collected, pending, overdue, total } = financeSummary;
  const grand = collected + total;
  const collectedPct = grand > 0 ? Math.round((collected / grand) * 100) : 0;

  const chips: { key: Filter; label: string }[] = [
    { key: 'all', label: 'Wszystkie' },
    { key: 'overdue', label: 'Zaległe' },
    { key: 'pending', label: 'Oczekujące' },
    { key: 'paid', label: 'Zapłacone' },
  ];

  return (
    <>
      <Stack.Screen options={{ title: 'Finanse i składki' }} />
      <ScrollView
        style={{ backgroundColor: c.background }}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
      >
        {/* Podsumowanie */}
        <Card style={{ gap: spacing.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <View>
              <Text style={{ color: c.textMuted, fontSize: font.small }}>Zebrano w tym okresie</Text>
              <Text style={{ color: c.text, fontSize: font.h1, fontWeight: '900' }}>
                {formatMoney(collected)}
              </Text>
            </View>
            <Text style={{ color: c.primary, fontWeight: '800', fontSize: font.h3 }}>{collectedPct}%</Text>
          </View>
          <ProgressBar value={collectedPct} />
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <MiniStat label="Oczekuje" value={formatMoney(pending)} color={c.warning} />
            <MiniStat label="Zaległe" value={formatMoney(overdue)} color={c.danger} />
            <MiniStat label="Do zebrania" value={formatMoney(total)} color={c.info} />
          </View>
        </Card>

        <PrimaryButton label="Dodaj opłatę" icon="add" onPress={() => router.push('/modal?type=payment')} />

        {/* Filtry */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
          {chips.map((ch) => {
            const active = filter === ch.key;
            return (
              <Pressable
                key={ch.key}
                onPress={() => setFilter(ch.key)}
                style={{
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  borderRadius: radius.pill,
                  backgroundColor: active ? c.primary : c.card,
                  borderWidth: 1,
                  borderColor: active ? c.primary : c.border,
                }}
              >
                <Text style={{ color: active ? c.onPrimary : c.text, fontWeight: '600', fontSize: font.small }}>
                  {ch.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Lista płatności */}
        {filtered.length === 0 ? (
          <EmptyState icon="wallet-outline" text="Brak płatności w tej kategorii." />
        ) : (
          <View style={{ gap: spacing.md }}>
            {filtered.map((pay) => {
              const player = getPlayer(pay.playerId);
              const team = getTeam(pay.teamId);
              const kind = PAYMENT_KINDS[pay.kind];
              const st = paymentStatusMeta[pay.status];
              const paid = pay.status === 'paid';
              return (
                <Card key={pay.id}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                    {player ? (
                      <Avatar first={player.firstName} last={player.lastName} color={kind.color} />
                    ) : null}
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: c.text, fontWeight: '700', fontSize: font.body }}>
                        {player ? `${player.firstName} ${player.lastName}` : 'Zawodnik'}
                      </Text>
                      <Text style={{ color: c.textMuted, fontSize: font.small }} numberOfLines={1}>
                        {pay.title} · {team?.name ?? ''}
                      </Text>
                      <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: 6, flexWrap: 'wrap' }}>
                        <Badge label={kind.label} color={kind.color} bg={kind.color + '22'} />
                        <Badge label={st.label} color={st.color} bg={st.bg} />
                        <Badge label={`termin ${formatDate(pay.dueDate)}`} />
                      </View>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: spacing.sm }}>
                      <Text style={{ color: c.text, fontWeight: '900', fontSize: font.h3 }}>
                        {formatMoney(pay.amount)}
                      </Text>
                      <Pressable
                        onPress={() => (paid ? markUnpaid(pay.id) : markPaid(pay.id))}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 4,
                          paddingHorizontal: spacing.sm,
                          paddingVertical: 6,
                          borderRadius: radius.pill,
                          backgroundColor: paid ? c.cardAlt : c.primary,
                        }}
                      >
                        <Ionicons
                          name={paid ? 'arrow-undo-outline' : 'checkmark-circle-outline'}
                          size={14}
                          color={paid ? c.textMuted : c.onPrimary}
                        />
                        <Text
                          style={{
                            color: paid ? c.textMuted : c.onPrimary,
                            fontWeight: '700',
                            fontSize: font.tiny,
                          }}
                        >
                          {paid ? 'Cofnij' : 'Zapłacono'}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>
    </>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
  const c = useTheme();
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ color, fontWeight: '800', fontSize: font.body }}>{value}</Text>
      <Text style={{ color: c.textMuted, fontSize: font.tiny }}>{label}</Text>
    </View>
  );
}
