import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, spacing, font, radius } from '@/src/theme';

const MONTHS = [
  'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
  'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień',
];
const WEEKDAYS = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];

export function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/** Kalendarz miesięczny z wyborem dnia i kropkami dla dni z wydarzeniami. */
export function MonthCalendar({
  selected,
  onSelect,
  marks,
}: {
  selected: Date | null;
  onSelect: (d: Date) => void;
  marks?: Set<string>;
}) {
  const c = useTheme();
  const init = selected ?? new Date();
  const [view, setView] = useState({ y: init.getFullYear(), m: init.getMonth() });

  const first = new Date(view.y, view.m, 1);
  const startWeekday = (first.getDay() + 6) % 7; // poniedziałek = 0
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const today = new Date();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const changeMonth = (delta: number) => {
    const m = view.m + delta;
    const y = view.y + Math.floor(m / 12);
    setView({ y, m: ((m % 12) + 12) % 12 });
  };

  const selKey = selected ? dayKey(selected) : null;

  return (
    <View style={{ backgroundColor: c.card, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: c.border }}>
      {/* Nagłówek: miesiąc + strzałki */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md }}>
        <Pressable onPress={() => changeMonth(-1)} hitSlop={10} style={{ padding: 4 }}>
          <Ionicons name="chevron-back" size={22} color={c.primary} />
        </Pressable>
        <Text style={{ color: c.text, fontWeight: '800', fontSize: font.body }}>
          {MONTHS[view.m]} {view.y}
        </Text>
        <Pressable onPress={() => changeMonth(1)} hitSlop={10} style={{ padding: 4 }}>
          <Ionicons name="chevron-forward" size={22} color={c.primary} />
        </Pressable>
      </View>

      {/* Dni tygodnia */}
      <View style={{ flexDirection: 'row' }}>
        {WEEKDAYS.map((w) => (
          <Text key={w} style={{ flex: 1, textAlign: 'center', color: c.textMuted, fontSize: font.tiny, fontWeight: '700' }}>
            {w}
          </Text>
        ))}
      </View>

      {/* Siatka dni */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }}>
        {cells.map((d, i) => {
          if (d === null) return <View key={i} style={{ width: `${100 / 7}%`, height: 42 }} />;
          const date = new Date(view.y, view.m, d);
          const key = dayKey(date);
          const isSel = key === selKey;
          const isToday = key === dayKey(today);
          const marked = marks?.has(key);
          return (
            <Pressable
              key={i}
              onPress={() => onSelect(date)}
              style={{ width: `${100 / 7}%`, height: 42, alignItems: 'center', justifyContent: 'center' }}
            >
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isSel ? c.primary : isToday ? c.primarySoft : 'transparent',
                }}
              >
                <Text
                  style={{
                    color: isSel ? c.onPrimary : c.text,
                    fontWeight: isSel || isToday ? '800' : '500',
                    fontSize: font.small,
                  }}
                >
                  {d}
                </Text>
              </View>
              {marked ? (
                <View style={{ position: 'absolute', bottom: 4, width: 5, height: 5, borderRadius: 3, backgroundColor: isSel ? c.onPrimary : c.accent }} />
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
