import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { TrendingUp } from 'lucide-react-native';
import { formatMoney } from '../../../utils/math';

interface Props {
  cardBg: string;
  subTextColor: string;
  isDark: boolean;
  remaining: number;
  currency: string;
  paceText: string | null;
  t: (key: string, defaultText: string) => string;
}

export default function GoalAnalyticsGrid({ cardBg, subTextColor, isDark, remaining, currency, paceText, t }: Props) {
  return (
    <View style={styles.statsGrid}>
      <Surface style={[styles.miniCard, { backgroundColor: cardBg }]} mode="flat">
        <Text style={[styles.miniCardLabel, { color: subTextColor }]}>{t('goals.missing', 'Remaining')}</Text>
        <Text style={[styles.miniCardValue, { color: remaining === 0 ? '#10B981' : (isDark ? '#FFFFFF' : '#111827') }]}>
          {formatMoney(remaining)} {currency}
        </Text>
      </Surface>

      {paceText && (
        <Surface style={[styles.miniCard, { backgroundColor: cardBg }]} mode="flat">
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <TrendingUp size={14} color="#10B981" style={{ marginRight: 4 }} />
            <Text style={[styles.miniCardLabel, { color: subTextColor }]}>{t('goals.suggestedPace', 'Target Pace')}</Text>
          </View>
          <Text style={[styles.miniCardValue, { color: '#10B981', fontSize: 14 }]} numberOfLines={1}>
            {paceText}
          </Text>
        </Surface>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  miniCard: { flex: 1, padding: 14, borderRadius: 16, marginHorizontal: 4, minHeight: 68, justifyContent: 'center' },
  miniCardLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.2 },
  miniCardValue: { fontSize: 16, fontWeight: '700', marginTop: 4 }
});