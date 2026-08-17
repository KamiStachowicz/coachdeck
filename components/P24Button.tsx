import React, { useState } from 'react';
import { Pressable, Text, ActivityIndicator, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme, spacing, font, radius } from '@/src/theme';
import { formatMoney } from '@/components/ui';
import { isOnlinePaymentsEnabled } from '@/src/config';
import { startCheckout } from '@/src/payments/online';

/** Marka Przelewy24 – czerwień, żeby przycisk był rozpoznawalny. */
export const P24_RED = '#D0111B';

function notify(msg: string) {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') window.alert(msg);
  } else {
    Alert.alert('Przelewy24', msg);
  }
}

/**
 * Przycisk płatności Przelewy24 z widoczną ceną.
 * - Gdy backend + klucze P24 są ustawione → prawdziwa płatność (startCheckout).
 * - W trybie demo → informuje, że płatność ruszy po podłączeniu P24,
 *   i wywołuje onPaid (żeby dokończyć przepływ w demie).
 */
export function P24Button({
  amount,
  description,
  label = 'Zapłać przez Przelewy24',
  email = 'platnik@coachdeck.app',
  returnPath = '/finances',
  onPaid,
  disabled,
}: {
  amount: number;
  description: string;
  label?: string;
  email?: string;
  returnPath?: string;
  onPaid?: () => void;
  disabled?: boolean;
}) {
  const c = useTheme();
  const [busy, setBusy] = useState(false);
  const enabled = isOnlinePaymentsEnabled();

  const onPress = async () => {
    if (disabled || busy) return;
    if (!enabled) {
      notify(
        `Płatność ${formatMoney(amount)} przez Przelewy24 uruchomi się po podłączeniu kluczy P24 w Supabase. (tryb demo)`,
      );
      onPaid?.();
      return;
    }
    setBusy(true);
    try {
      const res = await startCheckout({ amount, description, email, returnPath });
      if (res.ok) onPaid?.();
      else notify(res.message ?? 'Nie udało się rozpocząć płatności.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || busy}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: radius.md,
        backgroundColor: disabled ? c.cardAlt : P24_RED,
        opacity: busy ? 0.7 : 1,
      }}
    >
      {busy ? (
        <ActivityIndicator color={disabled ? c.textMuted : '#fff'} />
      ) : (
        <Ionicons name="card" size={16} color={disabled ? c.textMuted : '#fff'} />
      )}
      <Text style={{ color: disabled ? c.textMuted : '#fff', fontWeight: '800', fontSize: font.small }}>
        {label} · {formatMoney(amount)}
      </Text>
    </Pressable>
  );
}
