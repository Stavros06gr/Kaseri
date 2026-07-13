import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react-native';
import { format } from 'date-fns';
import { formatMoney } from '../../../utils/math';

interface Props {
  item: any;
  cardBg: string;
  isDark: boolean;
  subTextColor: string;
  currentLocale: any;
  currency: string;
  t: (key: string, defaultText: string) => string;
}

export default function ContributionHistoryItem({ item, cardBg, isDark, subTextColor, currentLocale, currency, t }: Props) {
  const isDeposit = item.type === 'deposit';
  return (
    <Surface style={[styles.historyRow, { backgroundColor: cardBg }]} mode="flat">
      <View style={styles.historyLeft}>
        <View style={[styles.iconWrapper, { backgroundColor: isDeposit ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }]}>
          {isDeposit ? <ArrowUpRight size={16} color="#10B981" /> : <ArrowDownLeft size={16} color="#EF4444" />}
        </View>
        <View>
          <Text style={[styles.historyType, { color: isDark ? '#FFFFFF' : '#111827' }]}>
            {isDeposit ? t('goals.deposit', 'Deposit') : t('goals.withdraw', 'Withdrawal')}
          </Text>
          <Text style={[styles.historyDate, { color: subTextColor }]}>
            {item.date ? format(new Date(item.date), 'dd MMM yyyy, HH:mm', { locale: currentLocale }) : ''}
          </Text>
        </View>
      </View>
      <Text style={[styles.historyAmount, { color: isDeposit ? '#10B981' : '#EF4444' }]}>
        {isDeposit ? '+' : '-'} {formatMoney(item.amount)} {currency}
      </Text>
    </Surface>
  );
}

const styles = StyleSheet.create({
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 16, marginBottom: 8 },
  historyLeft: { flexDirection: 'row', alignItems: 'center' },
  iconWrapper: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  historyType: { fontSize: 14, fontWeight: '600' },
  historyDate: { fontSize: 11, marginTop: 2 },
  historyAmount: { fontSize: 15, fontWeight: '700' }
});