import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useStore } from '@/src/store';
import { useTheme, spacing, font, radius } from '@/src/theme';
import { EmptyState } from '@/components/ui';

function timeLabel(ts: number): string {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function ChatThreadScreen() {
  const c = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { chatThreads, sendChat } = useStore();
  const [text, setText] = useState('');

  const thread = chatThreads.find((t) => t.id === id);
  if (!thread) return <EmptyState icon="alert-circle-outline" text="Nie znaleziono rozmowy." />;

  const send = () => {
    const t = text.trim();
    if (!t) return;
    sendChat(thread.id, t, 'coach');
    setText('');
  };

  return (
    <>
      <Stack.Screen options={{ title: thread.name }} />
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: c.background }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm }}>
          <Text style={{ color: c.textMuted, fontSize: font.tiny, textAlign: 'center', marginBottom: spacing.sm }}>
            {thread.role}
          </Text>
          {thread.messages.map((m) => {
            const mine = m.from === 'coach';
            return (
              <View
                key={m.id}
                style={{
                  alignSelf: mine ? 'flex-end' : 'flex-start',
                  maxWidth: '82%',
                  backgroundColor: mine ? c.primary : c.card,
                  borderWidth: mine ? 0 : 1,
                  borderColor: c.border,
                  borderRadius: radius.lg,
                  borderBottomRightRadius: mine ? 4 : radius.lg,
                  borderBottomLeftRadius: mine ? radius.lg : 4,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                }}
              >
                <Text style={{ color: mine ? c.onPrimary : c.text, fontSize: font.body }}>{m.text}</Text>
                <Text
                  style={{
                    color: mine ? 'rgba(255,255,255,0.75)' : c.tabInactive,
                    fontSize: 10,
                    marginTop: 3,
                    textAlign: 'right',
                  }}
                >
                  {timeLabel(m.ts)}
                </Text>
              </View>
            );
          })}
        </ScrollView>

        {/* Pole wpisywania */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            gap: spacing.sm,
            padding: spacing.md,
            borderTopWidth: 1,
            borderTopColor: c.border,
            backgroundColor: c.card,
          }}
        >
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Napisz wiadomość…"
            placeholderTextColor={c.tabInactive}
            multiline
            onSubmitEditing={send}
            style={{
              flex: 1,
              maxHeight: 120,
              backgroundColor: c.cardAlt,
              borderRadius: radius.lg,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              color: c.text,
              fontSize: font.body,
            }}
          />
          <Pressable
            onPress={send}
            disabled={!text.trim()}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: text.trim() ? c.primary : c.cardAlt,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="send" size={18} color={text.trim() ? c.onPrimary : c.textMuted} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}
