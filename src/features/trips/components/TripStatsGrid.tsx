import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { CalendarDays, TrendingUp } from 'lucide-react-native';
import { formatMoney } from '../../../utils/math';

interface Props {
  cardBg: string;
  textColor: string;
  subTextColor: string;
  startDate: Date;
  endDate: Date;
  totalSpent: number;
  hideBalance: boolean;
  currency: string;
  t: (key: string, defaultText: string) => string;
}

export default function TripStatsGrid({
  cardBg, textColor, subTextColor, startDate, endDate, totalSpent, hideBalance, currency, t
}: Props) {
  // Υπολογισμός ημερών ταξιδιού
  const diffTime = Math.abs(new Date(endDate).getTime() - new Date(startDate).getTime());
  const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

  // Υπολογισμός μέσου όρου ανά ημέρα
  const dailyAverage = totalSpent / totalDays;
  const displayAverage = hideBalance ? '****' : `${formatMoney(dailyAverage)} ${currency}`;

  return (
    <View style={styles.gridRow}>
      {/* CARD 1: DURATION */}
      <Surface style={[styles.statCard, { backgroundColor: cardBg }]} mode="flat">
        <View style={[styles.iconWrapper, { backgroundColor: 'rgba(37, 99, 235, 0.08)' }]}>
          <CalendarDays size={18} color="#2563EB" />
        </View>
        <Text style={[styles.statLabel, { color: subTextColor }]}>
          {t('trips.duration', 'Duration')}
        </Text>
        <Text style={[styles.statValue, { color: textColor }]}>
          {totalDays} {totalDays === 1 ? t('trips.day', 'Day') : t('trips.days', 'Days')}
        </Text>
      </Surface>

      {/* CARD 2: DAILY AVERAGE */}
      <Surface style={[styles.statCard, { backgroundColor: cardBg }]} mode="flat">
        <View style={[styles.iconWrapper, { backgroundColor: 'rgba(16, 185, 129, 0.08)' }]}>
          <TrendingUp size={18} color="#10B981" />
        </View>
        <Text style={[styles.statLabel, { color: subTextColor }]}>
          {t('trips.dailyAvg', 'Daily Average')}
        </Text>
        <Text style={[styles.statValue, { color: textColor }]}>
          {displayAverage}
        </Text>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  gridRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  statCard: { flex: 1, padding: 16, borderRadius: 20, marginHorizontal: 4, alignItems: 'flex-start' },
  iconWrapper: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  statLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 4 },
  statValue: { fontSize: 15, fontWeight: '800' }
});