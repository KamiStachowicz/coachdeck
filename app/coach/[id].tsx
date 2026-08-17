import React, { useMemo, useState } from 'react';
import { ScrollView, View, Text, Share, Pressable, TextInput } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useStore } from '@/src/store';
import { DIRECTORY_COACHES, coachDaySlots } from '@/src/data';
import { useTheme, spacing, font, radius } from '@/src/theme';
import { Card, PrimaryButton, EmptyState, formatMoney, formatDate } from '@/components/ui';
import { P24Button } from '@/components/P24Button';
import { MonthCalendar, dayKey } from '@/components/MonthCalendar';
import { Stars } from '../directory';

const sameDay = (a: Date, b: Date) => dayKey(a) === dayKey(b);

export default function CoachDetail() {
  const c = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { reviewsFor, addReview, addBooking, isBooked, favorites, toggleFavorite } = useStore();

  const coach = DIRECTORY_COACHES.find((d) => d.id === id);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');

  if (!coach) return <EmptyState icon="alert-circle-outline" text="Nie znaleziono trenera." />;

  const reviews = reviewsFor(coach.id);
  const fav = favorites.includes(coach.id);
  const displayRating = reviews.length
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
    : coach.rating;

  const submit = () => {
    if (text.trim()) {
      addReview(coach.id, rating, text.trim());
      setText('');
      setRating(5);
    }
  };

  // Rezerwacja z kalendarza – realne wolne godziny trenera.
  const today = new Date();
  const [bookDay, setBookDay] = useState<Date>(today);

  // Dni z jakąkolwiek ofertą terminów (na potrzeby kropek w kalendarzu).
  const marks = useMemo(() => {
    const s = new Set<string>();
    for (let i = 0; i < 42; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      if (coachDaySlots(coach.id, d).length > 0) s.add(dayKey(d));
    }
    return s;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coach.id]);

  // Sloty wybranego dnia (dukrywamy godziny z przeszłości, jeśli to dziś).
  const daySlots = useMemo(() => {
    const isPast = bookDay < today && !sameDay(bookDay, today);
    if (isPast) return [];
    const nowH = today.getHours();
    return coachDaySlots(coach.id, bookDay).filter((sl) => !(sameDay(bookDay, today) && sl.hour <= nowH));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coach.id, bookDay]);

  return (
    <>
      <Stack.Screen options={{ title: coach.name }} />
      <ScrollView
        style={{ backgroundColor: c.background }}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
      >
        {/* Nagłówek */}
        <Card style={{ backgroundColor: coach.color }}>
          <Pressable onPress={() => toggleFavorite(coach.id)} style={{ position: 'absolute', top: spacing.md, right: spacing.md }} hitSlop={10}>
            <Ionicons name={fav ? 'heart' : 'heart-outline'} size={26} color="#fff" />
          </Pressable>
          <View style={{ alignItems: 'center', gap: spacing.sm }}>
            <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#fff', fontWeight: '900', fontSize: 24 }}>{coach.name.split(' ').map((w) => w[0]).join('')}</Text>
            </View>
            <Text style={{ color: '#fff', fontWeight: '900', fontSize: font.h2 }}>{coach.name}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: font.small }}>{coach.discipline} · {coach.city}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Stars rating={displayRating} size={18} />
              <Text style={{ color: '#fff', fontWeight: '800' }}>{displayRating}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: font.small }}>({reviews.length} opinii)</Text>
            </View>
          </View>
        </Card>

        {/* Cena + o mnie */}
        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: c.text, fontWeight: '700' }}>Stawka</Text>
            <Text style={{ color: c.primary, fontWeight: '900', fontSize: font.h3 }}>{formatMoney(coach.pricePerHour)} / godz.</Text>
          </View>
          <Text style={{ color: c.textMuted, fontSize: font.small, marginTop: spacing.sm }}>{coach.bio}</Text>
          <View style={{ marginTop: spacing.md }}>
            <P24Button
              amount={coach.pricePerHour}
              description={`Trening 1:1 – ${coach.name}`}
              label="Zapłać za sesję (Przelewy24)"
              returnPath="/directory"
            />
          </View>
        </Card>

        {/* Dostępne terminy – z kalendarza */}
        <View>
          <Text style={{ color: c.text, fontWeight: '800', fontSize: font.h3, marginBottom: spacing.md }}>Zarezerwuj termin</Text>
          <MonthCalendar selected={bookDay} onSelect={setBookDay} marks={marks} />

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.md, marginBottom: spacing.sm }}>
            <Text style={{ color: c.text, fontWeight: '800', fontSize: font.body }}>{formatDate(bookDay.toISOString())}</Text>
          </View>

          {daySlots.length === 0 ? (
            <Text style={{ color: c.textMuted, fontSize: font.small }}>Brak wolnych terminów tego dnia — wybierz inny.</Text>
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              {daySlots.map((sl) => {
                const key = `${dayKey(bookDay)}T${sl.hour}`;
                const mine = isBooked(coach.id, key);
                const taken = sl.booked && !mine; // zajęte przez kogoś innego
                const label = `${String(sl.hour).padStart(2, '0')}:00`;
                const bg = mine ? c.primary : taken ? c.cardAlt : c.card;
                const fg = mine ? c.onPrimary : taken ? c.textMuted : c.text;
                return (
                  <Pressable
                    key={sl.hour}
                    onPress={() => !taken && !mine && addBooking(coach.id, key)}
                    disabled={taken || mine}
                    style={{
                      minWidth: 84,
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.sm,
                      borderRadius: radius.md,
                      backgroundColor: bg,
                      borderWidth: 1,
                      borderColor: mine ? c.primary : c.border,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                    }}
                  >
                    {mine ? <Ionicons name="checkmark-circle" size={14} color={c.onPrimary} /> : taken ? <Ionicons name="lock-closed" size={12} color={c.textMuted} /> : null}
                    <Text style={{ color: fg, fontWeight: '700', fontSize: font.small }}>{label}</Text>
                  </Pressable>
                );
              })}
            </View>
          )}
          <Text style={{ color: c.textMuted, fontSize: font.tiny, marginTop: spacing.sm }}>
            Zielone = Twoja rezerwacja · szare z kłódką = termin zajęty. (demo — potwierdzenie po podłączeniu backendu)
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <PrimaryButton label="Napisz" icon="chatbubble-outline" onPress={() => {}} style={{ flex: 1 }} />
          <PrimaryButton
            label="Udostępnij"
            icon="share-social-outline"
            onPress={() => Share.share({ message: `${coach.name} – ${coach.discipline} (${displayRating}★) w CoachDeck` }).catch(() => {})}
            style={{ flex: 1, backgroundColor: c.info }}
          />
        </View>

        {/* Dodaj opinię */}
        <View>
          <Text style={{ color: c.text, fontWeight: '800', fontSize: font.h3, marginBottom: spacing.md }}>Dodaj opinię</Text>
          <Card style={{ gap: spacing.sm }}>
            <View style={{ flexDirection: 'row', gap: 4 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Pressable key={i} onPress={() => setRating(i)} hitSlop={4}>
                  <Ionicons name={rating >= i ? 'star' : 'star-outline'} size={28} color="#F59E0B" />
                </Pressable>
              ))}
            </View>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Napisz opinię…"
              placeholderTextColor={c.tabInactive}
              multiline
              style={{ backgroundColor: c.cardAlt, borderRadius: radius.md, padding: spacing.md, color: c.text, minHeight: 60, textAlignVertical: 'top' }}
            />
            <Pressable onPress={submit} style={{ backgroundColor: c.primary, borderRadius: radius.md, paddingVertical: spacing.md, alignItems: 'center' }}>
              <Text style={{ color: c.onPrimary, fontWeight: '800' }}>Dodaj opinię</Text>
            </Pressable>
          </Card>
        </View>

        {/* Opinie */}
        <View>
          <Text style={{ color: c.text, fontWeight: '800', fontSize: font.h3, marginBottom: spacing.md }}>Opinie ({reviews.length})</Text>
          {reviews.length === 0 ? (
            <EmptyState icon="chatbubbles-outline" text="Brak opinii. Bądź pierwszy!" />
          ) : (
            <View style={{ gap: spacing.md }}>
              {reviews.map((r) => (
                <Card key={r.id}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ color: c.text, fontWeight: '700' }}>{r.author}</Text>
                    <Stars rating={r.rating} />
                  </View>
                  <Text style={{ color: c.textMuted, fontSize: font.small, marginTop: 6 }}>{r.text}</Text>
                  <Text style={{ color: c.tabInactive, fontSize: font.tiny, marginTop: 6 }}>{formatDate(r.date)}</Text>
                </Card>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
}
