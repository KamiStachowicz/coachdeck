import React from 'react';
import { View, Text, Pressable, ScrollView, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { useStore } from '@/src/store';
import { PROFILES } from '@/src/profiles';
import { useTheme, spacing, font, radius } from '@/src/theme';

export function ProfilePicker() {
  const c = useTheme();
  const { setProfile, coachProfile, closeProfilePicker } = useStore();
  const { width, height } = useWindowDimensions();

  return (
    <View style={{ position: 'absolute', width, height, backgroundColor: c.background, zIndex: 90 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        {/* Nagłówek */}
        <LinearGradient
          colors={['#059669', '#0891B2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: 56, paddingBottom: spacing.xl, paddingHorizontal: spacing.lg }}
        >
          {/* Wstecz – tylko gdy profil już wybrany (można anulować) */}
          {coachProfile !== null ? (
            <Pressable
              onPress={closeProfilePicker}
              hitSlop={12}
              style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}
            >
              <Ionicons name="chevron-back" size={24} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Wstecz</Text>
            </Pressable>
          ) : null}
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: font.body, fontWeight: '700' }}>
            CoachDeck
          </Text>
          <Text style={{ color: '#fff', fontSize: 28, fontWeight: '900', marginTop: 4 }}>
            Kim jesteś jako trener?
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: font.small, marginTop: 6 }}>
            Wybierz profil, a dopasujemy aplikację do Twojej pracy.
          </Text>
        </LinearGradient>

        {/* Karty profili */}
        <View style={{ padding: spacing.lg, gap: spacing.md }}>
          {PROFILES.map((p) => {
            const active = coachProfile === p.id;
            return (
            <Pressable
              key={p.id}
              onPress={() => setProfile(p.id)}
              style={({ pressed }) => ({
                backgroundColor: c.card,
                borderRadius: radius.lg,
                padding: spacing.lg,
                borderWidth: active ? 2 : 1,
                borderColor: active ? p.color : c.border,
                opacity: pressed ? 0.85 : 1,
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.md,
              })}
            >
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: radius.md,
                  backgroundColor: p.color + '22',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name={p.icon as any} size={28} color={p.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: c.text, fontWeight: '800', fontSize: font.h3 }}>{p.name}</Text>
                <Text style={{ color: c.textMuted, fontSize: font.small, marginTop: 2 }}>{p.tagline}</Text>
              </View>
              <Ionicons name={active ? 'checkmark-circle' : 'chevron-forward'} size={22} color={p.color} />
            </Pressable>
            );
          })}
        </View>

        <Text style={{ color: c.textMuted, fontSize: font.tiny, textAlign: 'center', paddingHorizontal: spacing.lg }}>
          Profil zmienisz później w zakładce „Więcej".
        </Text>
      </ScrollView>
    </View>
  );
}
