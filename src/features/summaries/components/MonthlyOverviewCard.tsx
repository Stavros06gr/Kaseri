import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { TrendingUp, TrendingDown } from 'lucide-react-native';
import { formatMoney } from '../../../utils/math';

interface Props {
  income: number;
  expense: number;
  currency: string;
  hideBalance: boolean;
  isDark: boolean;
  t: (key: string, defaultText: string) => string;
}

export default function MonthlyOverviewCard({ income, expense, currency, hideBalance, isDark, t }: Props) {
  const net = income - expense;
  const subTextColor = isDark ? '#9CA3AF' : '#6B7280';

  return (
    <Surface style={[styles.card, { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }]} mode="flat">
      <Text style={[styles.title, { color: subTextColor }]}>{t('summaries.monthlyNet', 'Monthly Net Savings')}</Text>
      <Text style={[styles.netAmount, { color: net >= 0 ? '#10B981' : '#EF4444' }]}>
        {hideBalance ? '••••••' : `${net >= 0 ? '+' : ''}${formatMoney(net)} ${currency}`}
      </Text>

      <View style={[styles.divider, { backgroundColor: isDark ? '#2D2D2D' : '#F3F4F6' }]} />

      <View style={styles.statsRow}>
        <View style={styles.statCol}>
          <View style={styles.labelRow}>
            <TrendingUp size={14} color="#10B981" style={{ marginRight: 4 }} />
            <Text style={[styles.statLabel, { color: subTextColor }]}>{t('transactions.income', 'Income')}</Text>
          </View>
          <Text style={[styles.statValue, { color: '#10B981' }]}>
            {hideBalance ? '•••' : formatMoney(income)}
          </Text>
        </View>

        <View style={styles.statCol}>
          <View style={styles.labelRow}>
            <TrendingDown size={14} color="#EF4444" style={{ marginRight: 4 }} />
            <Text style={[styles.statLabel, { color: subTextColor }]}>{t('transactions.expense', 'Expense')}</Text>
          </View>
          <Text style={[styles.statValue, { color: '#EF4444' }]}>
            {hideBalance ? '•••' : formatMoney(expense)}
          </Text>
        </View>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: { padding: 20, borderRadius: 24, marginHorizontal: 20, marginBottom: 20 },
  title: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  netAmount: { fontSize: 26, fontWeight: '700', marginTop: 4 },
  divider: { height: 1, marginVertical: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statCol: { flex: 1 },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  statLabel: { fontSize: 12, fontWeight: '500' },
  statValue: { fontSize: 16, fontWeight: '700' }
});