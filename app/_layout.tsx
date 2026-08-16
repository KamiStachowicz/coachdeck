import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { StoreProvider, useStore } from '@/src/store';
import { brand, useTheme } from '@/src/theme';
import { Onboarding } from '@/components/Onboarding';
import { ProfilePicker } from '@/components/ProfilePicker';
import { Landing } from '@/components/Landing';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

const CoachLight = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, primary: brand.primary, background: '#F5F7FA' },
};
const CoachDark = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, primary: brand.primary, background: '#0B1220', card: '#0F1826' },
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <StoreProvider>
      <ThemedApp />
    </StoreProvider>
  );
}

function ThemedApp() {
  const colorScheme = useColorScheme();
  const { themeMode } = useStore();
  const dark = themeMode === 'system' ? colorScheme === 'dark' : themeMode === 'dark';

  return (
    <ThemeProvider value={dark ? CoachDark : CoachLight}>
      <Stack
        screenOptions={{
          headerBackVisible: false,
          headerLeft: () => <HeaderBack />,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Dodaj' }} />
        <Stack.Screen name="team/[id]" options={{ title: 'Drużyna' }} />
        <Stack.Screen name="player/[id]" options={{ title: 'Zawodnik' }} />
        <Stack.Screen name="finances" options={{ title: 'Finanse i składki' }} />
        <Stack.Screen name="tactics/[teamId]" options={{ title: 'Taktyka' }} />
        <Stack.Screen name="league" options={{ title: 'Liga i wyniki' }} />
        <Stack.Screen name="result" options={{ title: 'Wynik meczu' }} />
        <Stack.Screen name="scouting" options={{ title: 'Skauting i transfery' }} />
        <Stack.Screen name="plans" options={{ title: 'Plany i cennik' }} />
        <Stack.Screen name="revenue" options={{ title: 'Panel przychodów' }} />
        <Stack.Screen name="card/[id]" options={{ title: 'Karta zawodnika' }} />
        <Stack.Screen name="attendance/[eventId]" options={{ title: 'Frekwencja' }} />
        <Stack.Screen name="awards" options={{ title: 'Nagrody i odznaki' }} />
        <Stack.Screen name="training" options={{ title: 'Plany treningowe' }} />
        <Stack.Screen name="training/[id]" options={{ title: 'Konspekt treningu' }} />
        <Stack.Screen name="registrations" options={{ title: 'Nabór i zapisy' }} />
        <Stack.Screen name="camps" options={{ title: 'Obozy i eventy' }} />
        <Stack.Screen name="messages" options={{ title: 'Komunikacja' }} />
        <Stack.Screen name="settings" options={{ title: 'Ustawienia' }} />
        <Stack.Screen name="reports" options={{ title: 'Raporty' }} />
      </Stack>
      <OnboardingGate />
    </ThemeProvider>
  );
}

function HeaderBack() {
  const router = useRouter();
  const c = useTheme();
  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  };
  return (
    <Pressable
      onPress={goBack}
      hitSlop={12}
      style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 8, marginLeft: -4 }}
    >
      <Ionicons name="chevron-back" size={26} color={c.primary} />
      <Text style={{ color: c.primary, fontSize: 16, fontWeight: '600' }}>Wstecz</Text>
    </Pressable>
  );
}

function OnboardingGate() {
  const { onboarded, completeOnboarding, coachProfile, profilePickerOpen, entered } = useStore();
  if (onboarded === false) return <Onboarding onDone={completeOnboarding} />;
  if (onboarded === true && (coachProfile === null || profilePickerOpen)) return <ProfilePicker />;
  if (onboarded === true && !entered) return <Landing />;
  return null;
}
