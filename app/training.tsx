import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import {
  TRAINING_SESSIONS,
  EXERCISES,
  CATEGORY_META,
  sessionMinutes,
  type ExerciseCategory,
} from '@/src/training';
import { useTheme, spacing, font, radius } from '@/src/theme';
import { Card, Badge, SectionTitle } from '@/components/ui';

export default function TrainingScreen() {
  const c = useTheme();
  const router = useRouter();

  const categories = Object.keys(CATEGORY_META) as ExerciseCategory[];

  return (
    <>
      <Stack.Screen options={{ title: 'Plany treningowe' }} />
      <ScrollView
        style={{ backgroundColor: c.background }}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
      >
        {/* Gotowe konspekty */}
        <View>
          <SectionTitle title="Gotowe konspekty" />
          <View style={{ gap: spacing.md }}>
            {TRAINING_SESSIONS.map((s) => (
              <Card key={s.id} onPress={() => router.push(`/training/${s.id}`)}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                  <View
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: radius.md,
                      backgroundColor: c.primary + '22',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name="clipboard-outline" size={22} color={c.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: c.text, fontWeight: '700', fontSize: font.body }}>{s.title}</Text>
                    <Text style={{ color: c.textMuted, fontSize: font.small }}>{s.focus}</Text>
                    <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: 6 }}>
                      <Badge label={`${sessionMinutes(s)} min`} color={c.primary} bg={c.primary + '22'} />
                      <Badge label={s.level} />
                      <Badge label={`${s.items.length} ćwiczeń`} />
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={c.tabInactive} />
                </View>
              </Card>
            ))}
          </View>
        </View>

        {/* Biblioteka ćwiczeń */}
        <View>
          <SectionTitle title="Biblioteka ćwiczeń" />
          <View style={{ gap: spacing.lg }}>
            {categories.map((cat) => {
              const meta = CATEGORY_META[cat];
              const list = EXERCISES.filter((e) => e.category === cat);
              if (list.length === 0) return null;
              return (
                <View key={cat} style={{ gap: spacing.sm }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name={meta.icon as any} size={16} color={meta.color} />
                    <Text style={{ color: c.text, fontWeight: '800', fontSize: font.body }}>{meta.label}</Text>
                  </View>
                  {list.map((ex) => (
                    <Card key={ex.id} style={{ padding: spacing.md }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: c.text, fontWeight: '700', fontSize: font.small }}>{ex.name}</Text>
                          <Text style={{ color: c.textMuted, fontSize: font.tiny, marginTop: 2 }}>{ex.description}</Text>
                        </View>
                        <Badge label={`${ex.minutes} min`} color={meta.color} bg={meta.color + '22'} />
                      </View>
                    </Card>
                  ))}
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </>
  );
}
