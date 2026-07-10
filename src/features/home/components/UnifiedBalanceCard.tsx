import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { Eye, EyeOff, TrendingUp, TrendingDown } from 'lucide-react-native';
import { formatMoney } from '../../../utils/math';

interface Props {
  totalBalance: number;
  income30Days: number;
  expense30Days: number;
  hideBalance: boolean;
  onToggleHide: () => void;
  currency: string;
  isDark: boolean;
  t: (key: string, defaultText: string) => string; // <- Ενημέρωση του τύπου για ασφαλές fallback
}

export default function UnifiedBalanceCard({
  totalBalance, income30Days, expense30Days, hideBalance, onToggleHide, currency, isDark, t
}: Props) {
  const styles = getStyles(isDark);

  return (
    <Surface style={styles.card} mode="flat">
      <View style={styles.rowBetween}>
        <Text style={styles.balanceTitle}>{t('home.balance', 'Total Balance')}</Text>
        <TouchableOpacity onPress={onToggleHide} hitSlop={15}>
          {hideBalance ? <EyeOff size={20} color={styles.textMuted.color} /> : <Eye size={20} color={styles.textMuted.color} />}
        </TouchableOpacity>
      </View>
      
      <Text style={styles.balanceAmount}>
        {hideBalance ? '••••••' : `${formatMoney(totalBalance)} ${currency}`}
      </Text>

      <View style={styles.horizontalDivider} />

      <View style={styles.statsInlineRow}>
        <View style={styles.statColumn}>
          <View style={styles.statLabelRow}>
            <TrendingUp size={14} color="#10B981" style={{ marginRight: 4 }} />
            <Text style={styles.miniCardTitle}>{t('transactions.income', 'Income')}</Text>
          </View>
          <Text style={styles.incomeValue}>
            {hideBalance ? '•••' : `+${formatMoney(income30Days)}`}
          </Text>
        </View>
        
        <View style={styles.verticalDivider} />

        <View style={styles.statColumn}>
          <View style={styles.statLabelRow}>
            <TrendingDown size={14} color="#EF4444" style={{ marginRight: 4 }} />
            <Text style={styles.miniCardTitle}>{t('transactions.expense', 'Expense')}</Text>
          </View>
          <Text style={styles.expenseValue}>
            {hideBalance ? '•••' : `-${formatMoney(expense30Days)}`}
          </Text>
        </View>
      </View>
    </Surface>
  );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
  card: { padding: 20, borderRadius: 24, marginBottom: 24, backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  balanceTitle: { fontSize: 14, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5, color: isDark ? '#9CA3AF' : '#6B7280' },
  balanceAmount: { fontSize: 36, fontWeight: '700', marginTop: 6, letterSpacing: -0.5, color: isDark ? '#FFFFFF' : '#111827' },
  horizontalDivider: { height: 1, marginVertical: 18, backgroundColor: isDark ? '#2D2D2D' : '#F3F4F6' },
  statsInlineRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statColumn: { flex: 1 },
  statLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  miniCardTitle: { fontSize: 12, fontWeight: '500', color: isDark ? '#9CA3AF' : '#6B7280' },
  incomeValue: { fontSize: 17, fontWeight: '700', color: '#10B981' },
  expenseValue: { fontSize: 17, fontWeight: '700', color: '#EF4444' },
  verticalDivider: { width: 1, height: 35, marginHorizontal: 16, backgroundColor: isDark ? '#2D2D2D' : '#F3F4F6' },
  textMuted: { color: isDark ? '#9CA3AF' : '#6B7280' }
});