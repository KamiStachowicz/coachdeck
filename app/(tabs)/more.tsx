import React from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTheme, spacing, font, radius } from '@/src/theme';
import { Card, Badge, formatMoney } from '@/components/ui';
import { SPORTS, getSport } from '@/src/data';
import { useStore } from '@/src/store';
import { getPlan } from '@/src/plans';

const MENU: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  hint: string;
  route?: string;
}[] = [
  { icon: 'card-outline', label: 'Finanse i składki', hint: 'Opłaty, składki, zajęcia', route: '/finances' },
  { icon: 'person-add-outline', label: 'Nabór i zapisy', hint: 'Zgłoszenia i wpisowe', route: '/registrations' },
  { icon: 'bonfire-outline', label: 'Obozy i eventy', hint: 'Rezerwacje i zaliczki', route: '/camps' },
  { icon: 'trophy-outline', label: 'Liga i wyniki', hint: 'Tabela ligowa i mecze', route: '/league' },
  { icon: 'search-outline', label: 'Skauting i transfery', hint: 'Obserwuj i podpisuj zawodników', route: '/scouting' },
  { icon: 'medal-outline', label: 'Nagrody i odznaki', hint: 'Zawodnik miesiąca, rankingi', route: '/awards' },
  { icon: 'search-circle-outline', label: 'Znajdź trenera', hint: 'Katalog trenerów z okolicy + oceny', route: '/directory' },
  { icon: 'bar-chart-outline', label: 'Panel przychodów', hint: 'Subskrypcje i prowizje', route: '/revenue' },
  { icon: 'notifications-outline', label: 'Powiadomienia', hint: 'Przypomnienia i alerty', route: '/notifications' },
  { icon: 'megaphone-outline', label: 'Komunikacja', hint: 'Ogłoszenia do drużyny/rodziców', route: '/messages' },
  { icon: 'document-text-outline', label: 'Raporty', hint: 'Frekwencja i finanse (PDF)', route: '/reports' },
  { icon: 'clipboard-outline', label: 'Plany treningowe', hint: 'Konspekty i biblioteka ćwiczeń', route: '/training' },
  { icon: 'stats-chart-outline', label: 'Statystyki', hint: 'Analizy formy i frekwencji' },
  { icon: 'settings-outline', label: 'Ustawienia', hint: 'Motyw, język, branding', route: '/settings' },
];

export default function MoreScreen() {
  const c = useTheme();
  const router = useRouter();
  const { financeSummary, currentPlan, trialActive, trialDaysLeft, profile, openProfilePicker, backToStart, coachSport, coachSpecs, coachProfile } = useStore();
  const disciplineLabel =
    coachProfile === 'personal'
      ? coachSpecs.slice(0, 3).join(', ')
      : coachSport
        ? getSport(coachSport).name
        : '';
  const plan = currentPlan ? getPlan(currentPlan) : null;
  const menu = MENU.filter((m) => {
    if (m.route === '/league') return profile.show.league;
    if (m.route === '/scouting') return profile.show.scouting;
    return true;
  });
  const planLabel = trialActive
    ? `Okres próbny · ${trialDaysLeft} dni`
    : plan
      ? `Plan: ${plan.name}`
      : 'Brak aktywnego planu';
  const planColor = trialActive ? c.accent : plan ? plan.color : c.danger;
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
          <View style={{ flex: 1 }}>
            <Text style={{ color: c.text, fontWeight: '800', fontSize: font.h3 }}>{profile.name}</Text>
            {disciplineLabel ? (
              <Text style={{ color: c.textMuted, fontSize: font.small, marginTop: 2 }} numberOfLines={1}>
                {disciplineLabel}
              </Text>
            ) : null}
            <View style={{ flexDirection: 'row', marginTop: 4 }}>
              <Badge label={planLabel} color={planColor} bg={planColor + '22'} />
            </View>
          </View>
          <Pressable onPress={openProfilePicker} hitSlop={10}>
            <Text style={{ color: c.primary, fontWeight: '700', fontSize: font.small }}>Zmień</Text>
          </Pressable>
        </View>
      </Card>

      {/* Upsell planu */}
      <Card onPress={() => router.push('/plans')} style={{ backgroundColor: c.accent }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <Ionicons name="rocket-outline" size={26} color="#fff" />
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: font.body }}>
              {trialActive
                ? `Okres próbny: ${trialDaysLeft} dni`
                : currentPlan === 'premium'
                  ? 'Masz najwyższy plan 🎉'
                  : 'Wybierz plan, by kontynuować'}
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: font.small }}>
              Plany i cennik · taktyka, płatności, skauting
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#fff" />
        </View>
      </Card>

      {/* Skrót finansów */}
      <Card onPress={() => router.push('/finances')} style={{ backgroundColor: c.primary }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <Ionicons name="wallet-outline" size={26} color="#fff" />
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: font.body }}>Do zebrania</Text>
            <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: font.small }}>
              Składki i opłaty za zajęcia
            </Text>
          </View>
          <Text style={{ color: '#fff', fontWeight: '900', fontSize: font.h3 }}>
            {formatMoney(financeSummary.total)}
          </Text>
        </View>
      </Card>

      {/* Menu */}
      <View style={{ gap: spacing.md }}>
        {menu.map((m) => (
          <Card key={m.label} onPress={m.route ? () => router.push(m.route as any) : undefined}>
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

        {/* Strona startowa */}
        <Card onPress={backToStart}>
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
              <Ionicons name="home-outline" size={20} color={c.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.text, fontWeight: '700', fontSize: font.body }}>Strona startowa</Text>
              <Text style={{ color: c.textMuted, fontSize: font.small }}>Wróć do ekranu powitalnego</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={c.tabInactive} />
          </View>
        </Card>
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
