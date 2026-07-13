import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { format } from 'date-fns';
import { el, enUS } from 'date-fns/locale';
import { formatMoney } from '../../../utils/math';
import { CreditCard } from 'lucide-react-native';

interface Props {
  transaction: any;
  textColor: string;
  subTextColor: string;
  hideBalance: boolean;
  currency: string;
  language: string;
}

export default function TripExpenseItem({
  transaction, textColor, subTextColor, hideBalance, currency, language
}: Props) {
  const currentLocale = language === 'gr' ? el : enUS;
  const displayAmount = hideBalance ? '****' : `-${formatMoney(transaction.amount)} ${currency}`;

  return (
    <View style={styles.container}>
      <View style={styles.leftRow}>
        <View style={styles.iconCircle}>
          <CreditCard size={16} color="#EF4444" />
        </View>
        <View style={styles.meta}>
          <Text style={[styles.note, { color: textColor }]} numberOfLines={1}>
            {transaction.notes || transaction.category || 'Trip Expense'}
          </Text>
          <Text style={[styles.date, { color: subTextColor }]}>
            {format(new Date(transaction.date), 'dd MMMM yyyy', { locale: currentLocale })}
          </Text>
        </View>
      </View>
      <Text style={styles.amount}>
        {displayAmount}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 4 },
  leftRow: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 },
  iconCircle: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(239, 68, 68, 0.08)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  meta: { flex: 1 },
  note: { fontSize: 14, fontWeight: '700' },
  date: { fontSize: 11, fontWeight: '500', marginTop: 2 },
  amount: { fontSize: 14, fontWeight: '800', color: '#EF4444' }
});