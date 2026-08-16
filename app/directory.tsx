import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, TextInput } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useStore } from '@/src/store';
import { DIRECTORY_COACHES, getSport } from '@/src/data';
import { useTheme, spacing, font, radius } from '@/src/theme';
import { Card, formatMoney } from '@/components/ui';
import type { DirectoryCoach } from '@/src/types';

export function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 1 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons
          key={i}
          name={rating >= i ? 'star' : rating >= i - 0.5 ? 'star-half' : 'star-outline'}
          size={size}
          color="#F59E0B"
        />
      ))}
    </View>
  );
}

export default function DirectoryScreen() {
  const c = useTheme();
  const router = useRouter();
  const {
    listedInDirectory, setListed, coachSport, coachSpecs, coachProfile, clubName, brandColor,
    listingCity, listingPrice, listingBio, setListing, reviewsFor,
  } = useStore();
  const [filter, setFilter] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'rating' | 'price'>('rating');
  const [editing, setEditing] = useState(false);
  const [eCity, setECity] = useState(listingCity);
  const [ePrice, setEPrice] = useState(String(listingPrice));
  const [eBio, setEBio] = useState(listingBio);

  const myDiscipline =
    coachProfile === 'personal'
      ? coachSpecs.slice(0, 2).join(', ') || 'Trener personalny'
      : coachSport
        ? getSport(coachSport).name
        : 'Trener';

  const myReviews = reviewsFor('you');
  const myRating = myReviews.length ? myReviews.reduce((s, r) => s + r.rating, 0) / myReviews.length : 0;
  const myCoach: DirectoryCoach = {
    id: 'you',
    name: clubName ?? 'Twoja wizytówka',
    discipline: myDiscipline,
    city: listingCity,
    rating: Math.round(myRating * 10) / 10,
    reviewsCount: myReviews.length,
    pricePerHour: listingPrice,
    bio: listingBio,
    color: brandColor ?? c.primary,
    you: true,
  };

  const all: DirectoryCoach[] = [...(listedInDirectory ? [myCoach] : []), ...DIRECTORY_COACHES];
  const disciplines = Array.from(new Set(DIRECTORY_COACHES.map((d) => d.discipline)));
  const q = query.trim().toLowerCase();
  const shown = all
    .filter((d) => (filter ? d.discipline === filter : true))
    .filter((d) => (q ? (d.name + d.city + d.discipline).toLowerCase().includes(q) : true))
    .sort((a, b) => (a.you ? -1 : b.you ? 1 : sort === 'rating' ? b.rating - a.rating : a.pricePerHour - b.pricePerHour));

  return (
    <>
      <Stack.Screen options={{ title: 'Znajdź trenera' }} />
      <ScrollView
        style={{ backgroundColor: c.background }}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
      >
        {/* Twoja wizytówka */}
        <Card style={{ backgroundColor: listedInDirectory ? c.primary : c.card, gap: spacing.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <Ionicons name="storefront-outline" size={24} color={listedInDirectory ? '#fff' : c.primary} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: listedInDirectory ? '#fff' : c.text, fontWeight: '800', fontSize: font.body }}>
                Twoja wizytówka
              </Text>
              <Text style={{ color: listedInDirectory ? 'rgba(255,255,255,0.85)' : c.textMuted, fontSize: font.small }}>
                {listedInDirectory ? `${myDiscipline} · ${listingCity} · ${formatMoney(listingPrice)}/godz.` : 'Pokaż się klientom z okolicy'}
              </Text>
            </View>
            <Pressable
              onPress={() => setListed(!listedInDirectory)}
              style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, backgroundColor: listedInDirectory ? 'rgba(255,255,255,0.2)' : c.primary }}
            >
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: font.small }}>
                {listedInDirectory ? 'Ukryj' : 'Wystaw się'}
              </Text>
            </Pressable>
          </View>
          {listedInDirectory ? (
            editing ? (
              <View style={{ gap: spacing.sm }}>
                <TextInput value={eCity} onChangeText={setECity} placeholder="Miasto/okolica" placeholderTextColor="rgba(255,255,255,0.6)" style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: radius.md, padding: spacing.sm, color: '#fff' }} />
                <TextInput value={ePrice} onChangeText={setEPrice} placeholder="Cena/godz." keyboardType="numeric" placeholderTextColor="rgba(255,255,255,0.6)" style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: radius.md, padding: spacing.sm, color: '#fff' }} />
                <TextInput value={eBio} onChangeText={setEBio} placeholder="O mnie" placeholderTextColor="rgba(255,255,255,0.6)" style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: radius.md, padding: spacing.sm, color: '#fff' }} />
                <Pressable
                  onPress={() => { setListing(eCity.trim() || 'Warszawa', Number(ePrice) || 100, eBio.trim() || listingBio); setEditing(false); }}
                  style={{ backgroundColor: '#fff', borderRadius: radius.md, paddingVertical: spacing.sm, alignItems: 'center' }}
                >
                  <Text style={{ color: c.primary, fontWeight: '800' }}>Zapisz wizytówkę</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable onPress={() => setEditing(true)}>
                <Text style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '700', fontSize: font.small }}>Edytuj wizytówkę</Text>
              </Pressable>
            )
          ) : null}
        </Card>

        {/* Szukaj */}
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: c.card, borderRadius: radius.md, borderWidth: 1, borderColor: c.border, paddingHorizontal: spacing.md }}>
          <Ionicons name="search" size={18} color={c.tabInactive} />
          <TextInput value={query} onChangeText={setQuery} placeholder="Szukaj trenera, miasta…" placeholderTextColor={c.tabInactive} style={{ flex: 1, padding: spacing.md, color: c.text }} />
        </View>

        {/* Sort */}
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {([['rating', 'Najlepiej oceniani'], ['price', 'Najtańsi']] as const).map(([s, label]) => (
            <Pressable
              key={s}
              onPress={() => setSort(s)}
              style={{ flex: 1, alignItems: 'center', paddingVertical: spacing.sm, borderRadius: radius.md, backgroundColor: sort === s ? c.primary : c.card, borderWidth: 1, borderColor: sort === s ? c.primary : c.border }}
            >
              <Text style={{ color: sort === s ? c.onPrimary : c.text, fontWeight: '700', fontSize: font.small }}>{label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Filtry dyscyplin */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
          <Chip label="Wszyscy" active={!filter} onPress={() => setFilter(null)} />
          {disciplines.map((d) => (
            <Chip key={d} label={d} active={filter === d} onPress={() => setFilter(d)} />
          ))}
        </ScrollView>

        {/* Lista trenerów */}
        <View style={{ gap: spacing.md }}>
          {shown.map((coach) => (
            <Card key={coach.id} onPress={coach.you ? undefined : () => router.push(`/coach/${coach.id}`)}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: coach.color, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#fff', fontWeight: '800' }}>{coach.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={{ color: c.text, fontWeight: '800', fontSize: font.body }}>{coach.name}</Text>
                    {coach.you ? (
                      <View style={{ backgroundColor: c.primary + '22', paddingHorizontal: 6, borderRadius: radius.pill }}>
                        <Text style={{ color: c.primary, fontSize: 10, fontWeight: '800' }}>TY</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={{ color: c.textMuted, fontSize: font.small }} numberOfLines={1}>
                    {coach.discipline} · {coach.city}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 4 }}>
                    <Stars rating={coach.rating} />
                    <Text style={{ color: c.text, fontWeight: '700', fontSize: font.small }}>
                      {coach.reviewsCount > 0 ? coach.rating : '—'}
                    </Text>
                    <Text style={{ color: c.textMuted, fontSize: font.tiny }}>({coach.reviewsCount})</Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: c.primary, fontWeight: '900' }}>{formatMoney(coach.pricePerHour)}</Text>
                  <Text style={{ color: c.textMuted, fontSize: font.tiny }}>/ godz.</Text>
                </View>
              </View>
            </Card>
          ))}
        </View>

        <Text style={{ color: c.textMuted, fontSize: font.tiny, textAlign: 'center' }}>
          Katalog demonstracyjny. Realne profile i rezerwacje po podłączeniu backendu.
        </Text>
      </ScrollView>
    </>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const c = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, backgroundColor: active ? c.primary : c.card, borderWidth: 1, borderColor: active ? c.primary : c.border }}
    >
      <Text style={{ color: active ? c.onPrimary : c.text, fontWeight: '600', fontSize: font.small }}>{label}</Text>
    </Pressable>
  );
}
