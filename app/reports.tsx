import React from 'react';
import { ScrollView, View, Text, Share, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';

import { useStore } from '@/src/store';
import { useTheme, spacing, font } from '@/src/theme';
import { Card, SectionTitle, PrimaryButton, StatTile, formatMoney } from '@/components/ui';

export default function ReportsScreen() {
  const c = useTheme();
  const { players, financeSummary, attendanceStats, clubName, profile } = useStore();

  const withAtt = players
    .map((p) => ({ p, ...attendanceStats(p.id) }))
    .filter((x) => x.total > 0);
  const avgAtt = withAtt.length
    ? Math.round(withAtt.reduce((s, x) => s + x.pct, 0) / withAtt.length)
    : 0;

  const club = clubName ?? 'CoachDeck';
  const dateStr = new Date().toLocaleDateString('pl-PL');

  const rows = withAtt
    .sort((a, b) => b.pct - a.pct)
    .map((x) => `<tr><td>${x.p.firstName} ${x.p.lastName}</td><td style="text-align:right">${x.present}/${x.total}</td><td style="text-align:right">${x.pct}%</td></tr>`)
    .join('');

  const html = `
  <html><head><meta charset="utf-8"><style>
    body{font-family:-apple-system,Segoe UI,Roboto,sans-serif;padding:28px;color:#0F172A}
    h1{color:#059669;margin:0 0 4px} .sub{color:#64748B;margin:0 0 24px}
    .cards{display:flex;gap:12px;margin:16px 0}
    .card{flex:1;border:1px solid #E2E8F0;border-radius:12px;padding:14px}
    .card b{font-size:22px;display:block} .card span{color:#64748B;font-size:12px}
    table{width:100%;border-collapse:collapse;margin-top:8px}
    th,td{padding:8px;border-bottom:1px solid #E2E8F0;font-size:14px}
    th{text-align:left;color:#64748B}
  </style></head><body>
    <h1>${club}</h1>
    <p class="sub">Raport · ${dateStr} · ${profile.name}</p>
    <h3>Finanse</h3>
    <div class="cards">
      <div class="card"><b>${formatMoney(financeSummary.collected)}</b><span>Zebrane</span></div>
      <div class="card"><b>${formatMoney(financeSummary.pending)}</b><span>Oczekujące</span></div>
      <div class="card"><b>${formatMoney(financeSummary.overdue)}</b><span>Zaległe</span></div>
    </div>
    <h3>Frekwencja (średnia ${avgAtt}%)</h3>
    <table><thead><tr><th>Zawodnik</th><th style="text-align:right">Obecność</th><th style="text-align:right">%</th></tr></thead>
    <tbody>${rows || '<tr><td colspan="3">Brak danych frekwencji</td></tr>'}</tbody></table>
    <p class="sub" style="margin-top:24px">Wygenerowano w CoachDeck</p>
  </body></html>`;

  const printPdf = async () => {
    try {
      await Print.printAsync({ html });
    } catch {
      /* anulowano */
    }
  };

  const shareText = async () => {
    const lines = [
      `${club} – raport (${dateStr})`,
      `Finanse: zebrane ${formatMoney(financeSummary.collected)}, zaległe ${formatMoney(financeSummary.overdue)}`,
      `Frekwencja średnia: ${avgAtt}%`,
      ...withAtt.map((x) => `• ${x.p.firstName} ${x.p.lastName}: ${x.pct}%`),
      'Wygenerowano w CoachDeck',
    ];
    try {
      await Share.share({ message: lines.join('\n') });
    } catch {
      /* anulowano */
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Raporty' }} />
      <ScrollView
        style={{ backgroundColor: c.background }}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
      >
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <StatTile label="Zebrane" value={formatMoney(financeSummary.collected)} icon="cash-outline" />
          <StatTile label="Śr. frekwencja" value={`${avgAtt}%`} icon="checkmark-done-outline" tint={c.info} />
        </View>

        <Card>
          <Text style={{ color: c.text, fontWeight: '700', fontSize: font.body }}>Raport klubu</Text>
          <Text style={{ color: c.textMuted, fontSize: font.small, marginTop: 2 }}>
            Podsumowanie finansów i frekwencji ({new Date().toLocaleDateString('pl-PL')}).
          </Text>
        </Card>

        <SectionTitle title="Frekwencja zawodników" />
        <Card style={{ gap: spacing.sm }}>
          {withAtt.length === 0 ? (
            <Text style={{ color: c.textMuted, fontSize: font.small }}>Brak danych frekwencji.</Text>
          ) : (
            withAtt
              .sort((a, b) => b.pct - a.pct)
              .map((x) => (
                <View key={x.p.id} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: c.text, fontSize: font.small }}>
                    {x.p.firstName} {x.p.lastName}
                  </Text>
                  <Text style={{ color: c.text, fontWeight: '800', fontSize: font.small }}>
                    {x.present}/{x.total} · {x.pct}%
                  </Text>
                </View>
              ))
          )}
        </Card>

        <PrimaryButton label={Platform.OS === 'web' ? 'Drukuj / zapisz PDF' : 'Zapisz PDF'} icon="document-text-outline" onPress={printPdf} />
        <PrimaryButton label="Udostępnij podsumowanie" icon="share-social-outline" onPress={shareText} style={{ backgroundColor: c.info }} />
      </ScrollView>
    </>
  );
}
