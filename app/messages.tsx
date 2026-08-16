import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput, Pressable } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useStore } from '@/src/store';
import { getSport } from '@/src/data';
import { useTheme, spacing, font, radius } from '@/src/theme';
import { Card, Badge, SectionTitle, EmptyState, formatDate } from '@/components/ui';

export default function MessagesScreen() {
  const c = useTheme();
  const { announcements, teams, getTeam, addAnnouncement, deleteAnnouncement, togglePin } = useStore();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [teamId, setTeamId] = useState<string | undefined>(undefined);

  const sorted = [...announcements].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.date.localeCompare(a.date);
  });

  const send = () => {
    if (title.trim() && body.trim()) {
      addAnnouncement({ title: title.trim(), body: body.trim(), teamId });
      setTitle('');
      setBody('');
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Komunikacja' }} />
      <ScrollView
        style={{ backgroundColor: c.background }}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
      >
        {/* Nowe ogłoszenie */}
        <View>
          <SectionTitle title="Nowe ogłoszenie" />
          <Card style={{ gap: spacing.sm }}>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Tytuł"
              placeholderTextColor={c.tabInactive}
              style={{ backgroundColor: c.cardAlt, borderRadius: radius.md, padding: spacing.md, color: c.text, fontWeight: '700' }}
            />
            <TextInput
              value={body}
              onChangeText={setBody}
              placeholder="Treść wiadomości do drużyny / rodziców…"
              placeholderTextColor={c.tabInactive}
              multiline
              style={{ backgroundColor: c.cardAlt, borderRadius: radius.md, padding: spacing.md, color: c.text, minHeight: 80, textAlignVertical: 'top' }}
            />
            {/* odbiorca */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
              <Pressable
                onPress={() => setTeamId(undefined)}
                style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, backgroundColor: teamId === undefined ? c.primary : c.cardAlt }}
              >
                <Text style={{ color: teamId === undefined ? c.onPrimary : c.text, fontWeight: '600', fontSize: font.small }}>Wszyscy</Text>
              </Pressable>
              {teams.map((tm) => {
                const active = teamId === tm.id;
                const sport = getSport(tm.sport);
                return (
                  <Pressable
                    key={tm.id}
                    onPress={() => setTeamId(tm.id)}
                    style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, backgroundColor: active ? sport.color : c.cardAlt }}
                  >
                    <Text style={{ color: active ? '#fff' : c.text, fontWeight: '600', fontSize: font.small }}>{tm.name}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <Pressable
              onPress={send}
              style={{ alignItems: 'center', paddingVertical: spacing.md, borderRadius: radius.md, backgroundColor: c.primary }}
            >
              <Text style={{ color: c.onPrimary, fontWeight: '800' }}>Wyślij ogłoszenie</Text>
            </Pressable>
          </Card>
        </View>

        {/* Lista */}
        <View>
          <SectionTitle title={`Ogłoszenia (${announcements.length})`} />
          {sorted.length === 0 ? (
            <EmptyState icon="chatbubbles-outline" text="Brak ogłoszeń." />
          ) : (
            <View style={{ gap: spacing.md }}>
              {sorted.map((a) => {
                const team = a.teamId ? getTeam(a.teamId) : null;
                return (
                  <Card key={a.id} style={a.pinned ? { borderColor: c.accent, borderWidth: 1 } : undefined}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                      {a.pinned ? <Ionicons name="pin" size={16} color={c.accent} /> : null}
                      <Text style={{ flex: 1, color: c.text, fontWeight: '800', fontSize: font.body }}>{a.title}</Text>
                      <Pressable onPress={() => togglePin(a.id)} hitSlop={8}>
                        <Ionicons name={a.pinned ? 'pin' : 'pin-outline'} size={18} color={a.pinned ? c.accent : c.tabInactive} />
                      </Pressable>
                      <Pressable onPress={() => deleteAnnouncement(a.id)} hitSlop={8}>
                        <Ionicons name="trash-outline" size={18} color={c.danger} />
                      </Pressable>
                    </View>
                    <Text style={{ color: c.text, fontSize: font.small, marginTop: 6 }}>{a.body}</Text>
                    <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
                      <Badge label={team ? team.name : 'Wszyscy'} color={c.info} bg={c.info + '22'} />
                      <Badge label={formatDate(a.date)} />
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
