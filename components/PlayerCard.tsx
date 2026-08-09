import React from 'react';
import { View, Text, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import type { Player } from '@/src/types';
import { getSport, overallOf } from '@/src/data';
import { useStore } from '@/src/store';

/** Skrót pozycji na kod (np. Napastnik → NA). */
function posCode(position?: string): string {
  if (!position) return '—';
  const map: Record<string, string> = {
    bramkarz: 'BR',
    obrońca: 'OB',
    pomocnik: 'PM',
    napastnik: 'NA',
    rozgrywający: 'RO',
    środkowy: 'ŚR',
    skrzydłowy: 'SK',
    atakujący: 'AT',
    przyjmujący: 'PR',
    libero: 'LI',
  };
  const key = position.toLowerCase();
  return map[key] ?? position.slice(0, 2).toUpperCase();
}

interface Tier {
  colors: [string, string, ...string[]];
  text: string;
  sub: string;
  label: string;
}

function tierFor(overall: number): Tier {
  if (overall >= 85)
    return { colors: ['#FFE9A8', '#F5C542', '#B8860B'], text: '#3A2A00', sub: '#5C4300', label: 'ZŁOTA' };
  if (overall >= 75)
    return { colors: ['#FCD34D', '#E0A81E', '#A9781A'], text: '#3A2A00', sub: '#5C4300', label: 'ZŁOTA' };
  if (overall >= 65)
    return { colors: ['#EEF2F5', '#C3CBD3', '#8E99A5'], text: '#1F2937', sub: '#4B5563', label: 'SREBRNA' };
  return { colors: ['#E7B892', '#C58748', '#8A5A2B'], text: '#3A1F00', sub: '#5C3A16', label: 'BRĄZOWA' };
}

export function PlayerCard({
  player,
  width = 300,
  style,
}: {
  player: Player;
  width?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const { getTeam } = useStore();
  const team = getTeam(player.teamId);
  const sport = team ? getSport(team.sport) : getSport('football');
  const ov = overallOf(player.ratings);
  const tier = tierFor(ov);
  const height = width * 1.42;

  const attrs: [string, number][] = [
    ['KON', player.ratings.fitness],
    ['TEC', player.ratings.technique],
    ['TAK', player.ratings.tactics],
    ['MEN', player.ratings.mentality],
  ];

  return (
    <LinearGradient
      colors={tier.colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        {
          width,
          height,
          borderRadius: 22,
          padding: 18,
          justifyContent: 'space-between',
          shadowColor: '#000',
          shadowOpacity: 0.3,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 },
          elevation: 8,
        },
        style,
      ]}
    >
      {/* Górna część: ocena + pozycja + dyscyplina */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View>
          <Text style={{ color: tier.text, fontSize: width * 0.19, fontWeight: '900', lineHeight: width * 0.19 }}>
            {ov}
          </Text>
          <Text style={{ color: tier.sub, fontSize: width * 0.07, fontWeight: '800', letterSpacing: 1 }}>
            {posCode(player.position)}
          </Text>
          <View style={{ height: 1, backgroundColor: tier.sub, opacity: 0.4, marginVertical: 6, width: width * 0.14 }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name={sport.icon as any} size={width * 0.06} color={tier.sub} />
            <Text style={{ color: tier.sub, fontSize: width * 0.05, fontWeight: '700' }}>
              {player.foot === 'both' ? 'L/P' : player.foot === 'L' ? 'L' : 'P'}
            </Text>
          </View>
        </View>

        {player.captain ? (
          <View
            style={{
              width: width * 0.11,
              height: width * 0.11,
              borderRadius: width * 0.055,
              borderWidth: 2,
              borderColor: tier.text,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: tier.text, fontWeight: '900', fontSize: width * 0.05 }}>C</Text>
          </View>
        ) : null}
      </View>

      {/* Środek: inicjały */}
      <View style={{ alignItems: 'center' }}>
        <View
          style={{
            width: width * 0.4,
            height: width * 0.4,
            borderRadius: width * 0.2,
            backgroundColor: 'rgba(255,255,255,0.35)',
            borderWidth: 3,
            borderColor: tier.text,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: tier.text, fontWeight: '900', fontSize: width * 0.16 }}>
            {player.firstName[0]}
            {player.lastName[0]}
          </Text>
        </View>
        {player.number ? (
          <Text style={{ color: tier.sub, fontWeight: '800', marginTop: 6, fontSize: width * 0.055 }}>
            #{player.number}
          </Text>
        ) : null}
      </View>

      {/* Nazwisko */}
      <Text
        numberOfLines={1}
        style={{
          color: tier.text,
          fontWeight: '900',
          fontSize: width * 0.085,
          textAlign: 'center',
          letterSpacing: 1,
          textTransform: 'uppercase',
        }}
      >
        {player.lastName}
      </Text>

      {/* Atrybuty */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: width * 0.02 }}>
        {attrs.map(([label, val]) => (
          <View key={label} style={{ alignItems: 'center' }}>
            <Text style={{ color: tier.text, fontWeight: '900', fontSize: width * 0.07 }}>{val}</Text>
            <Text style={{ color: tier.sub, fontWeight: '700', fontSize: width * 0.045 }}>{label}</Text>
          </View>
        ))}
      </View>
    </LinearGradient>
  );
}
