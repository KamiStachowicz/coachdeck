import React from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme, spacing, font, radius } from '@/src/theme';
import { Card } from '@/components/ui';
import { SPORTS } from '@/src/data';

const MENU: { icon: keyof typeof Ionicons.glyphMap; label: string; hint: string }[] = [
  { icon: 'stats-chart-outline', label: 'Statystyki', hint: 'Analizy formy i frekwencji' },
  { icon: 'clipboard-outline', label: 'Plany treningowe', hint: 'Biblioteka ćwiczeń' },
  { icon: 'chatbubbles-outline', label: 'Komunikacja', hint: 'Wiadomości do drużyny' },
  { icon: 'card-outline', label: 'Składki', hint: 'Opłaty i finanse klubu' },
  { icon: 'settings-outline', label: 'Ustawienia', hint: 'Konto i preferencje' },
];

export default function MoreScreen() {
  const c = useTheme();
  return (
    <ScrollView
      style={{ backgroundColor: c.background }}
      contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
    >
      {/* Profil */}
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: c.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="person" size={26} color="#fff" />
          </View>
          <View>
            <Text style={{ color: c.text, fontWeight: '800', fontSize: font.h3 }}>Trener</Text>
            <Text style={{ color: c.textMuted, fontSize: font.small }}>Konto demonstracyjne</Text>
          </View>
        </View>
      </Card>

      {/* Menu */}
      <View style={{ gap: spacing.md }}>
        {MENU.map((m) => (
          <Card key={m.label}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: radius.md,
                  backgroundColor: c.cardAlt,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name={m.icon} size={20} color={c.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: c.text, fontWeight: '700', fontSize: font.body }}>{m.label}</Text>
                <Text style={{ color: c.textMuted, fontSize: font.small }}>{m.hint}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={c.tabInactive} />
            </View>
          </Card>
        ))}
      </View>

      {/* Obsługiwane dyscypliny */}
      <View>
        <Text style={{ color: c.text, fontWeight: '800', fontSize: font.h3, marginBottom: spacing.md }}>
          Obsługiwane dyscypliny
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {SPORTS.map((s) => (
            <View
              key={s.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                borderRadius: radius.pill,
                backgroundColor: s.color + '22',
              }}
            >
              <Ionicons name={s.icon as any} size={16} color={s.color} />
              <Text style={{ color: s.color, fontWeight: '600', fontSize: font.small }}>{s.name}</Text>
            </View>
          ))}
        </View>
      </View>

      <Text style={{ color: c.textMuted, fontSize: font.tiny, textAlign: 'center', marginTop: spacing.md }}>
        CoachDeck · wersja 1.0.0 (MVP)
      </Text>
    </ScrollView>
  );
}
