import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, TextInput } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useStore, type ThemeMode } from '@/src/store';
import { useT } from '@/src/i18n';
import { BRAND_COLORS, CLUB_EMOJIS } from '@/src/data';
import { useTheme, spacing, font, radius, brand } from '@/src/theme';
import { Card, SectionTitle } from '@/components/ui';
import type { Lang } from '@/src/i18n';

export default function SettingsScreen() {
  const c = useTheme();
  const t = useT();
  const {
    themeMode, setThemeMode, lang, setLang,
    brandColor, setBrandColor, clubName, setClubName, clubEmoji, setClubEmoji,
  } = useStore();
  const [name, setName] = useState(clubName ?? '');

  const themeOptions: { id: ThemeMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { id: 'light', label: t('settings.light'), icon: 'sunny-outline' },
    { id: 'dark', label: t('settings.dark'), icon: 'moon-outline' },
    { id: 'system', label: t('settings.system'), icon: 'phone-portrait-outline' },
  ];

  return (
    <>
      <Stack.Screen options={{ title: t('settings.title') }} />
      <ScrollView
        style={{ backgroundColor: c.background }}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
      >
        {/* Wygląd – motyw */}
        <View>
          <SectionTitle title={t('settings.appearance')} />
          <Card style={{ gap: spacing.md }}>
            <Text style={{ color: c.textMuted, fontSize: font.small, fontWeight: '600' }}>{t('settings.theme')}</Text>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              {themeOptions.map((o) => {
                const active = themeMode === o.id;
                return (
                  <Pressable
                    key={o.id}
                    onPress={() => setThemeMode(o.id)}
                    style={{
                      flex: 1,
                      alignItems: 'center',
                      gap: 4,
                      paddingVertical: spacing.md,
                      borderRadius: radius.md,
                      backgroundColor: active ? c.primary : c.cardAlt,
                    }}
                  >
                    <Ionicons name={o.icon} size={20} color={active ? c.onPrimary : c.text} />
                    <Text style={{ color: active ? c.onPrimary : c.text, fontWeight: '700', fontSize: font.small }}>
                      {o.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Język */}
            <Text style={{ color: c.textMuted, fontSize: font.small, fontWeight: '600', marginTop: spacing.sm }}>
              {t('settings.language')}
            </Text>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              {(['pl', 'en'] as Lang[]).map((l) => {
                const active = lang === l;
                return (
                  <Pressable
                    key={l}
                    onPress={() => setLang(l)}
                    style={{
                      flex: 1,
                      alignItems: 'center',
                      paddingVertical: spacing.md,
                      borderRadius: radius.md,
                      backgroundColor: active ? c.primary : c.cardAlt,
                    }}
                  >
                    <Text style={{ color: active ? c.onPrimary : c.text, fontWeight: '700' }}>
                      {l === 'pl' ? '🇵🇱 Polski' : '🇬🇧 English'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Card>
        </View>

        {/* Branding klubu */}
        <View>
          <SectionTitle title={t('settings.branding')} />
          <Card style={{ gap: spacing.md }}>
            {/* Nazwa klubu */}
            <Text style={{ color: c.textMuted, fontSize: font.small, fontWeight: '600' }}>{t('settings.clubName')}</Text>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <TextInput
                value={name}
                onChangeText={setName}
                onBlur={() => name.trim() && setClubName(name.trim())}
                onSubmitEditing={() => name.trim() && setClubName(name.trim())}
                placeholder="np. KS Orły"
                placeholderTextColor={c.tabInactive}
                style={{ flex: 1, backgroundColor: c.cardAlt, borderRadius: radius.md, padding: spacing.md, color: c.text }}
              />
              <Pressable
                onPress={() => name.trim() && setClubName(name.trim())}
                style={{ paddingHorizontal: spacing.lg, justifyContent: 'center', borderRadius: radius.md, backgroundColor: c.primary }}
              >
                <Ionicons name="checkmark" size={20} color={c.onPrimary} />
              </Pressable>
            </View>

            {/* Logo emoji */}
            <Text style={{ color: c.textMuted, fontSize: font.small, fontWeight: '600', marginTop: spacing.sm }}>
              {t('settings.logo')}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              {CLUB_EMOJIS.map((e) => {
                const active = clubEmoji === e;
                return (
                  <Pressable
                    key={e}
                    onPress={() => setClubEmoji(e)}
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: radius.md,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: active ? c.primarySoft : c.cardAlt,
                      borderWidth: active ? 2 : 0,
                      borderColor: c.primary,
                    }}
                  >
                    <Text style={{ fontSize: 24 }}>{e}</Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Kolor przewodni */}
            <Text style={{ color: c.textMuted, fontSize: font.small, fontWeight: '600', marginTop: spacing.sm }}>
              {t('settings.accent')}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              {BRAND_COLORS.map((col) => {
                const active = (brandColor ?? brand.primary) === col;
                return (
                  <Pressable
                    key={col}
                    onPress={() => setBrandColor(col)}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: col,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: active ? 3 : 0,
                      borderColor: c.text,
                    }}
                  >
                    {active ? <Ionicons name="checkmark" size={18} color="#fff" /> : null}
                  </Pressable>
                );
              })}
            </View>
            {brandColor ? (
              <Pressable onPress={() => setBrandColor(null)}>
                <Text style={{ color: c.textMuted, fontSize: font.small, textAlign: 'center', marginTop: spacing.sm }}>
                  {t('settings.reset')}
                </Text>
              </Pressable>
            ) : null}
          </Card>
        </View>

        <Text style={{ color: c.textMuted, fontSize: font.tiny, textAlign: 'center' }}>
          CoachDeck · v1.0.0
        </Text>
      </ScrollView>
    </>
  );
}
