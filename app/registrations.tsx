import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput, Pressable } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useStore } from '@/src/store';
import { getSport } from '@/src/data';
import { useTheme, spacing, font, radius } from '@/src/theme';
import { Card, Badge, StatTile, SectionTitle, EmptyState, formatMoney, formatDate } from '@/components/ui';
import { P24Button } from '@/components/P24Button';

export default function RegistrationsScreen() {
  const c = useTheme();
  const { registrations, teams, getTeam, addRegistration, acceptRegistration, toggleRegPaid } = useStore();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [contact, setContact] = useState('');
  const [fee, setFee] = useState('150');
  const [teamId, setTeamId] = useState(teams[0]?.id ?? '');

  const input = {
    backgroundColor: c.cardAlt,
    borderRadius: radius.md,
    padding: spacing.md,
    color: c.text,
  } as const;

  const newCount = registrations.filter((r) => r.status === 'new').length;
  const collected = registrations.filter((r) => r.paid).reduce((s, r) => s + r.fee, 0);

  const save = () => {
    if (firstName.trim() && lastName.trim() && teamId) {
      addRegistration({ teamId, firstName: firstName.trim(), lastName: lastName.trim(), contact: contact.trim() || undefined, fee: Number(fee) || 0 });
      setFirstName('');
      setLastName('');
      setContact('');
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Nabór i zapisy' }} />
      <ScrollView
        style={{ backgroundColor: c.background }}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
      >
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <StatTile label="Nowe zgłoszenia" value={newCount} icon="person-add-outline" />
          <StatTile label="Wpisowe zebrane" value={formatMoney(collected)} icon="cash-outline" tint={c.primary} />
        </View>

        {/* Nowe zgłoszenie */}
        <View>
          <SectionTitle title="Dodaj zgłoszenie" />
          <Card style={{ gap: spacing.sm }}>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <TextInput value={firstName} onChangeText={setFirstName} placeholder="Imię" placeholderTextColor={c.tabInactive} style={[input, { flex: 1 }]} />
              <TextInput value={lastName} onChangeText={setLastName} placeholder="Nazwisko" placeholderTextColor={c.tabInactive} style={[input, { flex: 1 }]} />
            </View>
            <TextInput value={contact} onChangeText={setContact} placeholder="Kontakt (tel./e-mail opiekuna)" placeholderTextColor={c.tabInactive} style={input} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
              {teams.map((t) => {
                const active = teamId === t.id;
                const sport = getSport(t.sport);
                return (
                  <Pressable
                    key={t.id}
                    onPress={() => setTeamId(t.id)}
                    style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, backgroundColor: active ? sport.color : c.cardAlt }}
                  >
                    <Text style={{ color: active ? '#fff' : c.text, fontWeight: '600', fontSize: font.small }}>{t.name}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <TextInput value={fee} onChangeText={setFee} placeholder="Wpisowe (zł)" keyboardType="numeric" placeholderTextColor={c.tabInactive} style={[input, { flex: 1 }]} />
              <Pressable onPress={save} style={{ paddingHorizontal: spacing.lg, justifyContent: 'center', borderRadius: radius.md, backgroundColor: c.primary }}>
                <Text style={{ color: c.onPrimary, fontWeight: '800' }}>Dodaj</Text>
              </Pressable>
            </View>
          </Card>
        </View>

        {/* Lista zgłoszeń */}
        <View>
          <SectionTitle title={`Zgłoszenia (${registrations.length})`} />
          {registrations.length === 0 ? (
            <EmptyState icon="clipboard-outline" text="Brak zgłoszeń." />
          ) : (
            <View style={{ gap: spacing.md }}>
              {registrations.map((r) => {
                const team = getTeam(r.teamId);
                const accepted = r.status === 'accepted';
                return (
                  <Card key={r.id}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: c.text, fontWeight: '700' }}>
                          {r.firstName} {r.lastName}
                        </Text>
                        <Text style={{ color: c.textMuted, fontSize: font.small }}>
                          {team?.name} · {formatDate(r.date)}
                          {r.contact ? ` · ${r.contact}` : ''}
                        </Text>
                        <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: 6 }}>
                          <Badge label={`Wpisowe ${formatMoney(r.fee)}`} />
                          <Badge label={r.paid ? 'Opłacone' : 'Nieopłacone'} color={r.paid ? c.primary : c.danger} bg={(r.paid ? c.primary : c.danger) + '22'} />
                          {accepted ? <Badge label="W kadrze" color={c.info} bg={c.info + '22'} /> : null}
                        </View>
                      </View>
                    </View>
                    {!r.paid && r.fee > 0 ? (
                      <View style={{ marginTop: spacing.md }}>
                        <P24Button
                          amount={r.fee}
                          description={`Wpisowe – ${r.firstName} ${r.lastName}`}
                          label="Zapłać wpisowe (Przelewy24)"
                          returnPath="/registrations"
                          onPaid={() => toggleRegPaid(r.id)}
                        />
                      </View>
                    ) : null}
                    <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
                      <Pressable
                        onPress={() => toggleRegPaid(r.id)}
                        style={{ flex: 1, alignItems: 'center', paddingVertical: spacing.sm, borderRadius: radius.md, backgroundColor: c.cardAlt }}
                      >
                        <Text style={{ color: c.text, fontWeight: '700', fontSize: font.small }}>
                          {r.paid ? 'Cofnij opłatę' : 'Oznacz opłacone'}
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => acceptRegistration(r.id)}
                        disabled={accepted}
                        style={{ flex: 1, alignItems: 'center', paddingVertical: spacing.sm, borderRadius: radius.md, backgroundColor: accepted ? c.cardAlt : c.primary }}
                      >
                        <Text style={{ color: accepted ? c.textMuted : c.onPrimary, fontWeight: '700', fontSize: font.small }}>
                          {accepted ? 'Przyjęty' : 'Przyjmij do kadry'}
                        </Text>
                      </Pressable>
                    </View>
                  </Card>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
}
