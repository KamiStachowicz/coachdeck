import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { StoreProvider, useStore } from '@/src/store';
import { brand } from '@/src/theme';
import { Onboarding } from '@/components/Onboarding';

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
  const colorScheme = useColorScheme();

  return (
    <StoreProvider>
      <ThemeProvider value={colorScheme === 'dark' ? CoachDark : CoachLight}>
        <Stack>
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
        </Stack>
        <OnboardingGate />
      </ThemeProvider>
    </StoreProvider>
  );
}

function OnboardingGate() {
  const { onboarded, completeOnboarding } = useStore();
  if (onboarded !== false) return null;
  return <Onboarding onDone={completeOnboarding} />;
}
