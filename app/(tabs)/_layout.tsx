import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { ColorValue } from 'react-native';

import { useTheme } from '@/src/theme';
import { useStore } from '@/src/store';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

function tabIcon(name: keyof typeof Ionicons.glyphMap) {
  return ({ color }: { color: ColorValue }) => (
    <Ionicons name={name} size={24} color={color as string} />
  );
}

export default function TabLayout() {
  const c = useTheme();
  const { profile } = useStore();

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
      <Tabs.Screen name="index" options={{ title: 'Pulpit', tabBarIcon: tabIcon('grid-outline') }} />
      <Tabs.Screen name="teams" options={{ title: profile.labels.teamsTab, tabBarIcon: tabIcon('shield-outline') }} />
      <Tabs.Screen name="calendar" options={{ title: 'Kalendarz', tabBarIcon: tabIcon('calendar-outline') }} />
      <Tabs.Screen name="players" options={{ title: profile.labels.playersTab, tabBarIcon: tabIcon('people-outline') }} />
      <Tabs.Screen name="more" options={{ title: 'Więcej', tabBarIcon: tabIcon('ellipsis-horizontal') }} />
    </Tabs>
  );
}
