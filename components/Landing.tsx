import React from 'react';
import { View, Text, Pressable, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { useStore } from '@/src/store';
import { useT } from '@/src/i18n';
import { spacing, font, radius } from '@/src/theme';

export function Landing() {
  const { enterApp, profile, openProfilePicker, clubName, clubEmoji } = useStore();
  const t = useT();
  const { width, height } = useWindowDimensions();

  const FEATURES: { icon: keyof typeof Ionicons.glyphMap; text: string }[] = [
    { icon: 'people-outline', text: t('landing.f1') },
    { icon: 'stats-chart-outline', text: t('landing.f2') },
    { icon: 'card-outline', text: t('landing.f3') },
  ];

  return (
    <LinearGradient
      colors={['#0B3D2E', '#059669', '#0891B2']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ position: 'absolute', width, height, zIndex: 80, paddingHorizontal: spacing.xl }}
    >
      <View style={{ flex: 1, justifyContent: 'center', gap: spacing.xl }}>
        {/* Logo / nazwa */}
        <View style={{ alignItems: 'center', gap: spacing.md }}>
          <View
            style={{
              width: 96,
              height: 96,
              borderRadius: 28,
              backgroundColor: 'rgba(255,255,255,0.18)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {clubEmoji ? (
              <Text style={{ fontSize: 52 }}>{clubEmoji}</Text>
            ) : (
              <Ionicons name="shield-half" size={54} color="#fff" />
            )}
          </View>
          <Text style={{ color: '#fff', fontSize: 40, fontWeight: '900', letterSpacing: 0.5 }}>
            {clubName ?? 'CoachDeck'}
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: font.body, textAlign: 'center' }}>
            {t('landing.tagline')}
          </Text>
        </View>

        {/* Cechy */}
        <View style={{ gap: spacing.md }}>
          {FEATURES.map((f) => (
            <View key={f.text} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: radius.md,
                  backgroundColor: 'rgba(255,255,255,0.18)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name={f.icon} size={20} color="#fff" />
              </View>
              <Text style={{ color: 'rgba(255,255,255,0.95)', fontSize: font.body, flex: 1 }}>{f.text}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Akcje na dole */}
      <View style={{ paddingBottom: 48, gap: spacing.md }}>
        <Pressable
          onPress={enterApp}
          style={({ pressed }) => ({
            backgroundColor: '#fff',
            borderRadius: radius.md,
            paddingVertical: spacing.lg,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.sm,
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <Text style={{ color: '#059669', fontWeight: '800', fontSize: font.h3 }}>{t('landing.enter')}</Text>
          <Ionicons name="arrow-forward" size={20} color="#059669" />
        </Pressable>
        <Pressable onPress={openProfilePicker} style={{ alignItems: 'center', paddingVertical: spacing.sm }}>
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '600' }}>
            {t('landing.profile')}: {profile.name} · {t('landing.change')}
          </Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}
