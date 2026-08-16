import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { TRAINING_SESSIONS, getExercise, CATEGORY_META, sessionMinutes } from '@/src/training';
import { useTheme, spacing, font, radius } from '@/src/theme';
import { Card, Badge, EmptyState } from '@/components/ui';

export default function TrainingDetail() {
  const c = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const session = TRAINING_SESSIONS.find((s) => s.id === id);

  if (!session) return <EmptyState icon="alert-circle-outline" text="Nie znaleziono konspektu." />;

  const total = sessionMinutes(session);
  let elapsed = 0;

  return (
    <>
      <Stack.Screen options={{ title: session.title }} />
      <ScrollView
        style={{ backgroundColor: c.background }}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
      >
        {/* Nagłówek */}
        <Card style={{ backgroundColor: c.primary }}>
          <Text style={{ color: '#fff', fontWeight: '900', fontSize: font.h2 }}>{session.title}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: font.small, marginTop: 2 }}>
            {session.focus}
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.lg, marginTop: spacing.md }}>
            <View>
              <Text style={{ color: '#fff', fontWeight: '900', fontSize: font.h3 }}>{total} min</Text>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: font.tiny }}>czas trwania</Text>
            </View>
            <View>
              <Text style={{ color: '#fff', fontWeight: '900', fontSize: font.h3 }}>{session.items.length}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: font.tiny }}>ćwiczeń</Text>
            </View>
            <View>
              <Text style={{ color: '#fff', fontWeight: '900', fontSize: font.h3 }}>{session.level}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: font.tiny }}>poziom</Text>
            </View>
          </View>
        </Card>

        {/* Oś czasu ćwiczeń */}
        <View style={{ gap: spacing.md }}>
          {session.items.map((exId, i) => {
            const ex = getExercise(exId);
            if (!ex) return null;
            const meta = CATEGORY_META[ex.category];
            const startAt = elapsed;
            elapsed += ex.minutes;
            return (
              <Card key={`${exId}-${i}`}>
                <View style={{ flexDirection: 'row', gap: spacing.md }}>
                  <View style={{ alignItems: 'center', width: 48 }}>
                    <Text style={{ color: c.textMuted, fontWeight: '800', fontSize: font.small }}>
                      {String(Math.floor(startAt)).padStart(2, '0')}'
                    </Text>
                    <View
                      style={{
                        marginTop: 6,
                        width: 34,
                        height: 34,
                        borderRadius: radius.sm,
                        backgroundColor: meta.color + '22',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Ionicons name={meta.icon as any} size={18} color={meta.color} />
                    </View>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: c.text, fontWeight: '700', fontSize: font.body }}>{ex.name}</Text>
                    <Text style={{ color: c.textMuted, fontSize: font.small, marginTop: 2 }}>{ex.description}</Text>
                    <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: 8 }}>
                      <Badge label={meta.label} color={meta.color} bg={meta.color + '22'} />
                      <Badge label={`${ex.minutes} min`} />
                    </View>
                  </View>
                </View>
              </Card>
            );
          })}
        </View>
      </ScrollView>
    </>
  );
}
