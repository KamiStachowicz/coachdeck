import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { useStore } from '@/src/store';
import { PROFILES, type CoachProfile } from '@/src/profiles';
import { sportsForProfile, SPECIALIZATIONS } from '@/src/data';
import { useTheme, spacing, font, radius } from '@/src/theme';
import type { SportId } from '@/src/types';

export function ProfilePicker() {
  const c = useTheme();
  const { setProfile, coachProfile, closeProfilePicker, coachSport, setCoachSport, coachSpecs, toggleSpec } =
    useStore();
  const { width, height } = useWindowDimensions();
  const [pending, setPending] = useState<CoachProfile | null>(coachProfile);

  const step = pending ? 2 : 1;
  const pendingConfig = PROFILES.find((p) => p.id === pending);
  const isPersonal = pending === 'personal';

  const finish = () => {
    if (pending) setProfile(pending); // zamyka picker
  };

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
          {step === 2 ? (
            <Pressable onPress={() => setPending(null)} hitSlop={12} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
              <Ionicons name="chevron-back" size={24} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Wstecz</Text>
            </Pressable>
          ) : coachProfile !== null ? (
            <Pressable onPress={closeProfilePicker} hitSlop={12} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
              <Ionicons name="chevron-back" size={24} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Wstecz</Text>
            </Pressable>
          ) : null}
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: font.body, fontWeight: '700' }}>CoachDeck</Text>
          <Text style={{ color: '#fff', fontSize: 28, fontWeight: '900', marginTop: 4 }}>
            {step === 1 ? 'Kim jesteś jako trener?' : isPersonal ? 'Twoje specjalizacje' : 'Twoja dyscyplina'}
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: font.small, marginTop: 6 }}>
            {step === 1
              ? 'Wybierz profil, a dopasujemy aplikację do Twojej pracy.'
              : isPersonal
                ? 'Zaznacz, w czym się specjalizujesz.'
                : 'Wybierz dyscyplinę, którą trenujesz.'}
          </Text>
        </LinearGradient>

        {step === 1 ? (
          /* KROK 1: typ trenera */
          <View style={{ padding: spacing.lg, gap: spacing.md }}>
            {PROFILES.map((p) => {
              const active = coachProfile === p.id;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => setPending(p.id)}
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
                  <View style={{ width: 56, height: 56, borderRadius: radius.md, backgroundColor: p.color + '22', alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name={p.icon as any} size={28} color={p.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: c.text, fontWeight: '800', fontSize: font.h3 }}>{p.name}</Text>
                    <Text style={{ color: c.textMuted, fontSize: font.small, marginTop: 2 }}>{p.tagline}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={22} color={p.color} />
                </Pressable>
              );
            })}
          </View>
        ) : (
          /* KROK 2: dyscyplina / specjalizacje */
          <View style={{ padding: spacing.lg, gap: spacing.lg }}>
            {isPersonal ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                {SPECIALIZATIONS.map((s) => {
                  const active = coachSpecs.includes(s);
                  return (
                    <Pressable
                      key={s}
                      onPress={() => toggleSpec(s)}
                      style={{
                        paddingHorizontal: spacing.md,
                        paddingVertical: spacing.md,
                        borderRadius: radius.pill,
                        backgroundColor: active ? (pendingConfig?.color ?? c.primary) : c.card,
                        borderWidth: 1,
                        borderColor: active ? (pendingConfig?.color ?? c.primary) : c.border,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      {active ? <Ionicons name="checkmark" size={16} color="#fff" /> : null}
                      <Text style={{ color: active ? '#fff' : c.text, fontWeight: '600', fontSize: font.small }}>{s}</Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
                {sportsForProfile(pending).map((s) => {
                  const active = coachSport === s.id;
                  return (
                    <Pressable
                      key={s.id}
                      onPress={() => setCoachSport(s.id as SportId)}
                      style={{
                        width: '47%',
                        flexGrow: 1,
                        backgroundColor: c.card,
                        borderRadius: radius.lg,
                        padding: spacing.md,
                        borderWidth: active ? 2 : 1,
                        borderColor: active ? s.color : c.border,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: spacing.sm,
                      }}
                    >
                      <View style={{ width: 38, height: 38, borderRadius: radius.md, backgroundColor: s.color + '22', alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name={s.icon as any} size={20} color={s.color} />
                      </View>
                      <Text style={{ color: c.text, fontWeight: '700', fontSize: font.small, flex: 1 }}>{s.name}</Text>
                      {active ? <Ionicons name="checkmark-circle" size={18} color={s.color} /> : null}
                    </Pressable>
                  );
                })}
              </View>
            )}

            <Pressable
              onPress={finish}
              style={{ backgroundColor: c.primary, borderRadius: radius.md, paddingVertical: spacing.lg, alignItems: 'center' }}
            >
              <Text style={{ color: c.onPrimary, fontWeight: '800', fontSize: font.h3 }}>Gotowe</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
