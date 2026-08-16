import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { ColorValue } from 'react-native';

import { useTheme } from '@/src/theme';
import { useStore } from '@/src/store';
import { useT } from '@/src/i18n';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

function tabIcon(name: keyof typeof Ionicons.glyphMap) {
  return ({ color }: { color: ColorValue }) => (
    <Ionicons name={name} size={24} color={color as string} />
  );
}

export default function TabLayout() {
  const c = useTheme();
  const { profile } = useStore();
  const t = useT();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.tabInactive,
        headerShown: useClientOnlyValue(false, true),
        headerStyle: { backgroundColor: c.card },
        headerTitleStyle: { color: c.text, fontWeight: '800' },
        tabBarStyle: { backgroundColor: c.tabBar, borderTopColor: c.border },
        sceneStyle: { backgroundColor: c.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t('tab.home'), tabBarIcon: tabIcon('grid-outline') }} />
      {/* Trener personalny (praca 1:1) nie ma zakładki drużyn */}
      <Tabs.Screen
        name="teams"
        options={{
          title: profile.labels.teamsTab,
          tabBarIcon: tabIcon('shield-outline'),
          href: profile.id === 'personal' ? null : undefined,
        }}
      />
      <Tabs.Screen name="calendar" options={{ title: t('tab.calendar'), tabBarIcon: tabIcon('calendar-outline') }} />
      <Tabs.Screen
        name="players"
        options={{
          title: profile.labels.playersTab,
          tabBarIcon: tabIcon(profile.id === 'personal' ? 'person-outline' : 'people-outline'),
        }}
      />
      <Tabs.Screen name="more" options={{ title: t('tab.more'), tabBarIcon: tabIcon('ellipsis-horizontal') }} />
    </Tabs>
  );
}
