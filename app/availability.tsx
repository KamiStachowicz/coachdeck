import React, { useMemo, useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useStore } from '@/src/store';
import { useTheme, spacing, font, radius } from '@/src/theme';
import { Card, formatDate } from '@/components/ui';
import { MonthCalendar, dayKey } from '@/components/MonthCalendar';

const HOURS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

export default function AvailabilityScreen() {
  const c = useTheme();
  const { availability, toggleAvailability, setDayAvailability, slotBookings, isSlotBooked, bookingFor } = useStore();
  const [day, setDay] = useState<Date>(new Date());

  const dk = dayKey(day);
  const slotKey = (h: number) => `${dk}T${h}`;

  // Dni z zaznaczoną dostępnością lub rezerwacją – kropki w kalendarzu.
  const marks = useMemo(() => {
    const s = new Set<string>();
    for (const k of availability) s.add(k.split('T')[0]);
    for (const b of slotBookings) s.add(b.slotKey.split('T')[0]);
    return s;
  }, [availability, slotBookings]);

  const dayFreeCount = HOURS.filter((h) => availability.includes(slotKey(h)) && !isSlotBooked(slotKey(h))).length;
  const dayBookedCount = HOURS.filter((h) => isSlotBooked(slotKey(h))).length;
  const allFreeSelected = HOURS.every((h) => isSlotBooked(slotKey(h)) || availability.includes(slotKey(h)));

  return (
    <>
      <Stack.Screen options={{ title: 'Moja dostępność' }} />
      <ScrollView
        style={{ backgroundColor: c.background }}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
      >
        <Card style={{ gap: 6 }}>
          <Text style={{ color: c.text, fontWeight: '800', fontSize: font.body }}>Grafik dostępności</Text>
          <Text style={{ color: c.textMuted, fontSize: font.small }}>
            Zaznacz godziny, w których przyjmujesz. Terminy zaklepane przez klientów są szare i zablokowane.
          </Text>
        </Card>

        <MonthCalendar selected={day} onSelect={setDay} marks={marks} />

        {/* Legenda */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
          <Legend color={c.primary} text="Wolne" />
          <Legend color={c.cardAlt} border={c.border} text="Zaklepane (zajęte)" />
          <Legend color={c.card} border={c.border} text="Nieoznaczone" />
        </View>

        {/* Nagłówek dnia + szybkie akcje */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ color: c.text, fontWeight: '800', fontSize: font.body }}>{formatDate(day.toISOString())}</Text>
            <Text style={{ color: c.textMuted, fontSize: font.small }}>
              Wolne: {dayFreeCount} · Zajęte: {dayBookedCount}
            </Text>
          </View>
          <Pressable
            onPress={() => setDayAvailability(HOURS.map(slotKey), !allFreeSelected)}
            style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, backgroundColor: c.primary }}
          >
            <Text style={{ color: c.onPrimary, fontWeight: '700', fontSize: font.small }}>
              {allFreeSelected ? 'Wyczyść dzień' : 'Zaznacz cały dzień'}
            </Text>
          </Pressable>
        </View>

        {/* Siatka godzin */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {HOURS.map((h) => {
            const key = slotKey(h);
            const booked = isSlotBooked(key);
            const free = availability.includes(key);
            const label = `${String(h).padStart(2, '0')}:00`;
            const bg = booked ? c.cardAlt : free ? c.primary : c.card;
            const fg = booked ? c.textMuted : free ? c.onPrimary : c.text;
            return (
              <Pressable
                key={h}
                disabled={booked}
                onPress={() => toggleAvailability(key)}
                style={{
                  width: '31%',
                  flexGrow: 1,
                  minHeight: 58,
                  paddingVertical: spacing.sm,
                  paddingHorizontal: spacing.sm,
                  borderRadius: radius.md,
                  backgroundColor: bg,
                  borderWidth: 1,
                  borderColor: booked ? c.border : free ? c.primary : c.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  {booked ? <Ionicons name="lock-closed" size={12} color={c.textMuted} /> : free ? <Ionicons name="checkmark-circle" size={13} color={c.onPrimary} /> : null}
                  <Text style={{ color: fg, fontWeight: '800', fontSize: font.small }}>{label}</Text>
                </View>
                {booked ? (
                  <Text style={{ color: c.textMuted, fontSize: font.tiny, marginTop: 2 }} numberOfLines={1}>
                    {bookingFor(key)}
                  </Text>
                ) : (
                  <Text style={{ color: free ? 'rgba(255,255,255,0.85)' : c.textMuted, fontSize: font.tiny, marginTop: 2 }}>
                    {free ? 'wolne' : 'dodaj'}
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>

        <Text style={{ color: c.textMuted, fontSize: font.tiny, textAlign: 'center' }}>
          Klienci widzą tylko Twoje wolne godziny. Po podłączeniu backendu rezerwacja od razu zablokuje termin.
        </Text>
      </ScrollView>
    </>
  );
}

function Legend({ color, border, text }: { color: string; border?: string; text: string }) {
  const c = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 16, height: 16, borderRadius: 4, backgroundColor: color, borderWidth: border ? 1 : 0, borderColor: border }} />
      <Text style={{ color: c.textMuted, fontSize: font.small }}>{text}</Text>
    </View>
  );
}
