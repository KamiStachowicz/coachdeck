import React, { useMemo, useState } from 'react';
import { ScrollView, View, Text, TextInput, Pressable, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useStore } from '@/src/store';
import { getSport, PAYMENT_KINDS } from '@/src/data';
import { useTheme, spacing, font, radius } from '@/src/theme';
import { PrimaryButton } from '@/components/ui';
import type { PaymentKind } from '@/src/types';

type Mode = 'player' | 'event' | 'payment';

export default function AddModal() {
  const c = useTheme();
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type?: string }>();
  const mode: Mode = type === 'event' ? 'event' : type === 'payment' ? 'payment' : 'player';
  const { teams, players, addPlayer, addEvent, addPayment } = useStore();

  const [teamId, setTeamId] = useState(teams[0]?.id ?? '');

  // pola zawodnika
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [number, setNumber] = useState('');
  const [position, setPosition] = useState('');

  // pola wydarzenia
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState<'training' | 'match'>('training');
  const [opponent, setOpponent] = useState('');
  const [location, setLocation] = useState('');

  // pola płatności
  const [playerId, setPlayerId] = useState('');
  const [payKind, setPayKind] = useState<PaymentKind>('dues');
  const [payTitle, setPayTitle] = useState('');
  const [amount, setAmount] = useState('');

  const teamPlayers = useMemo(() => players.filter((p) => p.teamId === teamId), [players, teamId]);

  const inputStyle = {
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: radius.md,
    padding: spacing.md,
    color: c.text,
    fontSize: font.body,
  } as const;

  const Label = ({ children }: { children: string }) => (
    <Text style={{ color: c.textMuted, fontSize: font.small, fontWeight: '600', marginBottom: 6 }}>
      {children}
    </Text>
  );

  const canSave =
    mode === 'event'
      ? title.trim().length > 0
      : mode === 'payment'
        ? !!playerId && Number(amount) > 0
        : !!firstName.trim() && !!lastName.trim();

  const save = () => {
    if (!canSave) return;
    if (mode === 'event') {
      const date = new Date();
      date.setDate(date.getDate() + 1);
      date.setHours(18, 0, 0, 0);
      addEvent({
        teamId,
        type: eventType,
        title: title.trim(),
        date: date.toISOString(),
        location: location.trim() || undefined,
        opponent: eventType === 'match' ? opponent.trim() || undefined : undefined,
      });
    } else if (mode === 'payment') {
      const due = new Date();
      due.setDate(due.getDate() + 14);
      addPayment({
        playerId,
        teamId,
        kind: payKind,
        title: payTitle.trim() || PAYMENT_KINDS[payKind].label,
        amount: Number(amount),
        dueDate: due.toISOString(),
        status: 'pending',
      });
    } else {
      addPlayer({
        teamId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        number: number ? Number(number) : undefined,
        position: position.trim() || undefined,
        ratings: { fitness: 60, technique: 60, tactics: 60, mentality: 60 },
        status: 'available',
      });
    }
    router.back();
  };

  const screenTitle =
    mode === 'event' ? 'Nowe wydarzenie' : mode === 'payment' ? 'Nowa opłata' : 'Nowy zawodnik';

  return (
    <>
      <Stack.Screen options={{ title: screenTitle }} />
      <ScrollView
        style={{ backgroundColor: c.background }}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
      >
        {/* Wybór drużyny */}
        <View>
          <Label>Drużyna</Label>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
            {teams.map((t) => {
              const active = teamId === t.id;
              const sport = getSport(t.sport);
              return (
                <Pressable
                  key={t.id}
                  onPress={() => {
                    setTeamId(t.id);
                    setPlayerId('');
                  }}
                  style={{
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                    borderRadius: radius.pill,
                    backgroundColor: active ? sport.color : c.card,
                    borderWidth: 1,
                    borderColor: active ? sport.color : c.border,
                  }}
                >
                  <Text style={{ color: active ? '#fff' : c.text, fontWeight: '600', fontSize: font.small }}>
                    {t.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {mode === 'event' ? (
          <>
            <View>
              <Label>Typ</Label>
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                {(['training', 'match'] as const).map((et) => {
                  const active = eventType === et;
                  return (
                    <Pressable
                      key={et}
                      onPress={() => setEventType(et)}
                      style={{
                        flex: 1,
                        alignItems: 'center',
                        paddingVertical: spacing.md,
                        borderRadius: radius.md,
                        backgroundColor: active ? c.primary : c.card,
                        borderWidth: 1,
                        borderColor: active ? c.primary : c.border,
                      }}
                    >
                      <Text style={{ color: active ? '#fff' : c.text, fontWeight: '700' }}>
                        {et === 'training' ? 'Trening' : 'Mecz'}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
            <View>
              <Label>Tytuł</Label>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="np. Trening – taktyka"
                placeholderTextColor={c.tabInactive}
                style={inputStyle}
              />
            </View>
            {eventType === 'match' ? (
              <View>
                <Label>Przeciwnik</Label>
                <TextInput
                  value={opponent}
                  onChangeText={setOpponent}
                  placeholder="np. Legia II"
                  placeholderTextColor={c.tabInactive}
                  style={inputStyle}
                />
              </View>
            ) : null}
            <View>
              <Label>Miejsce</Label>
              <TextInput
                value={location}
                onChangeText={setLocation}
                placeholder="np. Stadion miejski"
                placeholderTextColor={c.tabInactive}
                style={inputStyle}
              />
            </View>
            <Text style={{ color: c.textMuted, fontSize: font.tiny }}>
              Wydarzenie zostanie dodane na jutro, 18:00 (wybór daty w kolejnej wersji).
            </Text>
          </>
        ) : mode === 'payment' ? (
          <>
            <View>
              <Label>Zawodnik</Label>
              {teamPlayers.length === 0 ? (
                <Text style={{ color: c.textMuted, fontSize: font.small }}>
                  Brak zawodników w tej drużynie.
                </Text>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
                  {teamPlayers.map((p) => {
                    const active = playerId === p.id;
                    return (
                      <Pressable
                        key={p.id}
                        onPress={() => setPlayerId(p.id)}
                        style={{
                          paddingHorizontal: spacing.md,
                          paddingVertical: spacing.sm,
                          borderRadius: radius.pill,
                          backgroundColor: active ? c.primary : c.card,
                          borderWidth: 1,
                          borderColor: active ? c.primary : c.border,
                        }}
                      >
                        <Text style={{ color: active ? '#fff' : c.text, fontWeight: '600', fontSize: font.small }}>
                          {p.firstName} {p.lastName}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              )}
            </View>

            <View>
              <Label>Rodzaj opłaty</Label>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                {(Object.keys(PAYMENT_KINDS) as PaymentKind[]).map((k) => {
                  const meta = PAYMENT_KINDS[k];
                  const active = payKind === k;
                  return (
                    <Pressable
                      key={k}
                      onPress={() => setPayKind(k)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                        paddingHorizontal: spacing.md,
                        paddingVertical: spacing.sm,
                        borderRadius: radius.pill,
                        backgroundColor: active ? meta.color : c.card,
                        borderWidth: 1,
                        borderColor: active ? meta.color : c.border,
                      }}
                    >
                      <Ionicons name={meta.icon as any} size={15} color={active ? '#fff' : meta.color} />
                      <Text style={{ color: active ? '#fff' : c.text, fontWeight: '600', fontSize: font.small }}>
                        {meta.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View>
              <Label>Opis (opcjonalnie)</Label>
              <TextInput
                value={payTitle}
                onChangeText={setPayTitle}
                placeholder="np. Składka – marzec 2026"
                placeholderTextColor={c.tabInactive}
                style={inputStyle}
              />
            </View>

            <View>
              <Label>Kwota (PLN)</Label>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="np. 120"
                keyboardType="numeric"
                placeholderTextColor={c.tabInactive}
                style={inputStyle}
              />
            </View>
            <Text style={{ color: c.textMuted, fontSize: font.tiny }}>
              Termin płatności zostanie ustawiony na 14 dni od dziś (wybór daty w kolejnej wersji).
            </Text>
          </>
        ) : (
          <>
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <View style={{ flex: 1 }}>
                <Label>Imię</Label>
                <TextInput
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="Imię"
                  placeholderTextColor={c.tabInactive}
                  style={inputStyle}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Label>Nazwisko</Label>
                <TextInput
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Nazwisko"
                  placeholderTextColor={c.tabInactive}
                  style={inputStyle}
                />
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <View style={{ width: 90 }}>
                <Label>Numer</Label>
                <TextInput
                  value={number}
                  onChangeText={setNumber}
                  placeholder="#"
                  keyboardType="number-pad"
                  placeholderTextColor={c.tabInactive}
                  style={inputStyle}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Label>Pozycja</Label>
                <TextInput
                  value={position}
                  onChangeText={setPosition}
                  placeholder="np. Napastnik"
                  placeholderTextColor={c.tabInactive}
                  style={inputStyle}
                />
              </View>
            </View>
          </>
        )}

        <PrimaryButton label="Zapisz" icon="checkmark" onPress={save} style={{ opacity: canSave ? 1 : 0.5 }} />

        <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
      </ScrollView>
    </>
  );
}
