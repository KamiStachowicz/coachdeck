import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ViewStyle,
  StyleProp,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme, spacing, radius, font } from '@/src/theme';

/** Karta z tłem i cieniem. */
export function Card({
  children,
  style,
  onPress,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}) {
  const c = useTheme();
  const body = (
    <View
      style={[
        {
          backgroundColor: c.card,
          borderRadius: radius.lg,
          padding: spacing.lg,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: c.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
        {body}
      </Pressable>
    );
  }
  return body;
}

/** Nagłówek sekcji z opcjonalną akcją. */
export function SectionTitle({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  const c = useTheme();
  return (
    <View style={styles.sectionRow}>
      <Text style={{ fontSize: font.h3, fontWeight: '700', color: c.text }}>{title}</Text>
      {action ? (
        <Pressable onPress={onAction}>
          <Text style={{ color: c.primary, fontWeight: '600', fontSize: font.small }}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/** Kolorowa plakietka (status, kategoria itp.). */
export function Badge({
  label,
  color,
  bg,
}: {
  label: string;
  color?: string;
  bg?: string;
}) {
  const c = useTheme();
  return (
    <View
      style={{
        backgroundColor: bg ?? c.cardAlt,
        paddingHorizontal: spacing.sm,
        paddingVertical: 3,
        borderRadius: radius.pill,
        alignSelf: 'flex-start',
      }}
    >
      <Text style={{ color: color ?? c.textMuted, fontSize: font.tiny, fontWeight: '700' }}>
        {label}
      </Text>
    </View>
  );
}

/** Kafelek ze statystyką. */
export function StatTile({
  label,
  value,
  icon,
  tint,
}: {
  label: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  tint?: string;
}) {
  const c = useTheme();
  const accent = tint ?? c.primary;
  return (
    <Card style={{ flex: 1, padding: spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: radius.md,
            backgroundColor: accent + '22',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name={icon} size={18} color={accent} />
        </View>
        <View>
          <Text style={{ fontSize: font.h3, fontWeight: '800', color: c.text }}>{value}</Text>
          <Text style={{ fontSize: font.tiny, color: c.textMuted }}>{label}</Text>
        </View>
      </View>
    </Card>
  );
}

/** Awatar z inicjałami. */
export function Avatar({
  first,
  last,
  size = 44,
  color,
}: {
  first: string;
  last: string;
  size?: number;
  color?: string;
}) {
  const c = useTheme();
  const bg = color ?? c.primary;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: '#fff', fontWeight: '800', fontSize: size * 0.36 }}>
        {first[0]}
        {last[0]}
      </Text>
    </View>
  );
}

/** Główny przycisk. */
export function PrimaryButton({
  label,
  onPress,
  icon,
  style,
}: {
  label: string;
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
}) {
  const c = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          backgroundColor: c.primary,
          borderRadius: radius.md,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.sm,
          opacity: pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {icon ? <Ionicons name={icon} size={18} color={c.onPrimary} /> : null}
      <Text style={{ color: c.onPrimary, fontWeight: '700', fontSize: font.body }}>{label}</Text>
    </Pressable>
  );
}

/** Blokada funkcji premium (paywall). */
export function Paywall({
  feature,
  planName,
}: {
  feature: string;
  planName: string;
}) {
  const c = useTheme();
  const router = useRouter();
  return (
    <View style={{ alignItems: 'center', padding: spacing.xl, gap: spacing.md }}>
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          backgroundColor: c.primarySoft,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name="lock-closed" size={32} color={c.primary} />
      </View>
      <Text style={{ color: c.text, fontWeight: '800', fontSize: font.h3, textAlign: 'center' }}>
        {feature}
      </Text>
      <Text style={{ color: c.textMuted, textAlign: 'center', fontSize: font.small }}>
        Ta funkcja jest dostępna w planie {planName} i wyższych.
      </Text>
      <PrimaryButton label="Zobacz plany" icon="rocket-outline" onPress={() => router.push('/plans')} />
    </View>
  );
}

/** Pusty stan. */
export function EmptyState({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  const c = useTheme();
  return (
    <View style={{ alignItems: 'center', padding: spacing.xl, gap: spacing.sm }}>
      <Ionicons name={icon} size={40} color={c.tabInactive} />
      <Text style={{ color: c.textMuted, textAlign: 'center' }}>{text}</Text>
    </View>
  );
}

/** Cienki pasek postępu 0–100. */
export function ProgressBar({ value, color }: { value: number; color?: string }) {
  const c = useTheme();
  return (
    <View style={{ height: 6, backgroundColor: c.cardAlt, borderRadius: radius.pill, overflow: 'hidden' }}>
      <View
        style={{
          width: `${Math.max(0, Math.min(100, value))}%`,
          height: '100%',
          backgroundColor: color ?? c.primary,
          borderRadius: radius.pill,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
});

export const statusMeta: Record<
  'available' | 'injured' | 'suspended',
  { label: string; color: string; bg: string }
> = {
  available: { label: 'Dostępny', color: '#059669', bg: '#D1FAE5' },
  injured: { label: 'Kontuzja', color: '#DC2626', bg: '#FEE2E2' },
  suspended: { label: 'Zawieszony', color: '#D97706', bg: '#FEF3C7' },
};

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('pl-PL', { weekday: 'short', day: 'numeric', month: 'short' });
}
export function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
}
export function formatMoney(amount: number): string {
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 }).format(amount);
}

export const paymentStatusMeta: Record<
  'paid' | 'pending' | 'overdue',
  { label: string; color: string; bg: string }
> = {
  paid: { label: 'Zapłacone', color: '#059669', bg: '#D1FAE5' },
  pending: { label: 'Oczekuje', color: '#D97706', bg: '#FEF3C7' },
  overdue: { label: 'Zaległe', color: '#DC2626', bg: '#FEE2E2' },
};

export const moraleMeta: Record<
  'high' | 'ok' | 'low',
  { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  high: { label: 'Wysokie', color: '#059669', icon: 'happy-outline' },
  ok: { label: 'Stabilne', color: '#D97706', icon: 'remove-circle-outline' },
  low: { label: 'Niskie', color: '#DC2626', icon: 'sad-outline' },
};

/** Kolor oceny meczowej (1–10). */
export function ratingColor10(v: number): string {
  return v >= 7.5 ? '#059669' : v >= 6.5 ? '#F59E0B' : '#EF4444';
}

/** Ciąg kropek z ostatnią formą (oceny 1–10). */
export function FormDots({ form }: { form: number[] }) {
  return (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      {form.map((v, i) => (
        <View
          key={i}
          style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            backgroundColor: ratingColor10(v),
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>{Math.round(v)}</Text>
        </View>
      ))}
    </View>
  );
}

/** Mini-wykres słupkowy (rozwój oceny w czasie). */
export function MiniBars({
  points,
  color,
}: {
  points: { label: string; overall: number }[];
  color?: string;
}) {
  const c = useTheme();
  const vals = points.map((p) => p.overall);
  const min = Math.min(...vals) - 2;
  const max = Math.max(...vals) + 1;
  const range = Math.max(1, max - min);
  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 90 }}>
        {points.map((p, i) => {
          const h = 16 + ((p.overall - min) / range) * 66;
          return (
            <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
              <Text style={{ color: c.textMuted, fontSize: 10, fontWeight: '700' }}>{p.overall}</Text>
              <View
                style={{
                  width: '70%',
                  height: h,
                  backgroundColor: color ?? c.primary,
                  borderRadius: 6,
                }}
              />
            </View>
          );
        })}
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {points.map((p, i) => (
          <Text key={i} style={{ flex: 1, textAlign: 'center', color: c.textMuted, fontSize: 10 }}>
            {p.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

export { TextStyle };
