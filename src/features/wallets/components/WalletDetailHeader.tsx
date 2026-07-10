import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { Eye, EyeOff, Edit2, TrendingUp, TrendingDown } from 'lucide-react-native';
import { formatMoney } from '../../../utils/math';

interface Props {
  walletName: string;
  balance: number;
  income30Days: number;
  expense30Days: number;
  hideBalance: boolean;
  onToggleHide: () => void;
  onEditBalance: () => void;
  currency: string;
  isDark: boolean;
  t: (key: string) => string;
}

export default function WalletDetailHeader({
  walletName, balance, income30Days, expense30Days, hideBalance, onToggleHide, onEditBalance, currency, isDark, t
}: Props) {
  const styles = getStyles(isDark);

  return (
    <View style={styles.container}>
      {/* WALLET NAME & ACTIONS */}
      <View style={styles.headerTopRow}>
        <Text style={styles.walletName}>{walletName}</Text>
        <View style={styles.actionsWrapper}>
          <TouchableOpacity onPress={onEditBalance} style={styles.actionIconClick} hitSlop={10}>
            <Edit2 size={18} color={styles.textMuted.color} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onToggleHide} style={styles.actionIconClick} hitSlop={10}>
            {hideBalance ? <EyeOff size={19} color={styles.textMuted.color} /> : <Eye size={19} color={styles.textMuted.color} />}
          </TouchableOpacity>
        </View>
      </View>

      {/* UNIFIED BALANCE SURFACE */}
      <Surface style={styles.card} mode="flat">
        <Text style={styles.balanceTitle}>{t('wallets.balanceTitle')}</Text>
        <Text style={styles.balanceAmount}>
          {hideBalance ? '••••••' : `${formatMoney(balance)} ${currency}`}
        </Text>

        <View style={styles.horizontalDivider} />

        <View style={styles.statsInlineRow}>
          <View style={styles.statColumn}>
            <View style={styles.statLabelRow}>
              <TrendingUp size={14} color="#10B981" style={{ marginRight: 4 }} />
              <Text style={styles.miniCardTitle}>{t('transactions.income')}</Text>
            </View>
            <Text style={styles.incomeValue}>
              {hideBalance ? '•••' : `+${formatMoney(income30Days)}`}
            </Text>
          </View>
          
          <View style={styles.verticalDivider} />

          <View style={styles.statColumn}>
            <View style={styles.statLabelRow}>
              <TrendingDown size={14} color="#EF4444" style={{ marginRight: 4 }} />
              <Text style={styles.miniCardTitle}>{t('transactions.expense')}</Text>
            </View>
            <Text style={styles.expenseValue}>
              {hideBalance ? '•••' : `-${formatMoney(expense30Days)}`}
            </Text>
          </View>
        </View>
      </Surface>

      <Text style={styles.historyTitle}>{t('wallets.historyTitle')}</Text>
    </View>
  );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: { marginBottom: 8 },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 4 },
  walletName: { fontSize: 24, fontWeight: '700', color: isDark ? '#FFFFFF' : '#111827', letterSpacing: -0.5 },
  actionsWrapper: { flexDirection: 'row', alignItems: 'center' },
  actionIconClick: { marginLeft: 16, padding: 4 },
  card: { padding: 20, borderRadius: 24, marginBottom: 24, backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' },
  balanceTitle: { fontSize: 13, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5, color: isDark ? '#9CA3AF' : '#6B7280' },
  balanceAmount: { fontSize: 32, fontWeight: '700', marginTop: 4, letterSpacing: -0.5, color: isDark ? '#FFFFFF' : '#111827' },
  horizontalDivider: { height: 1, marginVertical: 16, backgroundColor: isDark ? '#2D2D2D' : '#F3F4F6' },
  statsInlineRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statColumn: { flex: 1 },
  statLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  miniCardTitle: { fontSize: 12, fontWeight: '500', color: isDark ? '#9CA3AF' : '#6B7280' },
  incomeValue: { fontSize: 16, fontWeight: '700', color: '#10B981' },
  expenseValue: { fontSize: 16, fontWeight: '700', color: '#EF4444' },
  verticalDivider: { width: 1, height: 32, marginHorizontal: 16, backgroundColor: isDark ? '#2D2D2D' : '#F3F4F6' },
  historyTitle: { fontSize: 16, fontWeight: '700', color: isDark ? '#FFFFFF' : '#111827', paddingHorizontal: 4, marginBottom: 8 },
  textMuted: { color: isDark ? '#9CA3AF' : '#6B7280' }
});