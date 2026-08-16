import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { spacing, font, radius } from '@/src/theme';

interface Slide {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  text: string;
  colors: [string, string, ...string[]];
}

const SLIDES: Slide[] = [
  {
    icon: 'shield-half-outline',
    title: 'Zarządzaj klubem',
    text: 'Drużyny, zawodnicy, treningi i mecze — wszystko w jednym miejscu, dla każdej dyscypliny.',
    colors: ['#059669', '#047857'],
  },
  {
    icon: 'trophy-outline',
    title: 'Trenuj jak w Football Managerze',
    text: 'Taktyka i skład na boisku, statystyki, forma, rozwój i skauting zawodników.',
    colors: ['#2563EB', '#1E40AF'],
  },
  {
    icon: 'card-outline',
    title: 'Składki bez stresu',
    text: 'Ewidencja i płatności online (Przelewy24), przypomnienia i pełna kontrola finansów.',
    colors: ['#F97316', '#C2410C'],
  },
];

export function Onboarding({ onDone }: { onDone: () => void }) {
  const { width, height } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const ref = useRef<ScrollView>(null);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== index) setIndex(i);
  };

  const next = () => {
    if (index < SLIDES.length - 1) {
      ref.current?.scrollTo({ x: (index + 1) * width, animated: true });
      setIndex(index + 1);
    } else {
      onDone();
    }
  };

  const current = SLIDES[index];

  return (
    <LinearGradient colors={current.colors} style={{ position: 'absolute', width, height, zIndex: 100 }}>
      {/* Pomiń */}
      <Pressable onPress={onDone} style={{ position: 'absolute', top: 56, right: 20, zIndex: 2 }}>
        <Text style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '700' }}>Pomiń</Text>
      </Pressable>

      <ScrollView
        ref={ref}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        style={{ flex: 1 }}
      >
        {SLIDES.map((s) => (
          <View key={s.title} style={{ width, alignItems: 'center', justifyContent: 'center', padding: spacing.xl }}>
            <View
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: 'rgba(255,255,255,0.2)',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: spacing.xl,
              }}
            >
              <Ionicons name={s.icon} size={58} color="#fff" />
            </View>
            <Text style={{ color: '#fff', fontSize: 28, fontWeight: '900', textAlign: 'center', marginBottom: spacing.md }}>
              {s.title}
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.92)', fontSize: font.body, textAlign: 'center', lineHeight: 24 }}>
              {s.text}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Dolny pasek: kropki + przycisk */}
      <View style={{ paddingHorizontal: spacing.xl, paddingBottom: 48, gap: spacing.xl }}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={{
                width: i === index ? 24 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: i === index ? '#fff' : 'rgba(255,255,255,0.5)',
              }}
            />
          ))}
        </View>
        <Pressable
          onPress={next}
          style={{
            backgroundColor: '#fff',
            borderRadius: radius.md,
            paddingVertical: spacing.md,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.sm,
          }}
        >
          <Text style={{ color: current.colors[1], fontWeight: '800', fontSize: font.body }}>
            {index === SLIDES.length - 1 ? 'Rozpocznij' : 'Dalej'}
          </Text>
          <Ionicons name="arrow-forward" size={18} color={current.colors[1]} />
        </Pressable>
      </View>
    </LinearGradient>
  );
}
