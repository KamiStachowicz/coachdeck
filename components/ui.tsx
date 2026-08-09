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

export { TextStyle };
