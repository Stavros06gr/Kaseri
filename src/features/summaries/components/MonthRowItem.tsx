import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { formatMoney } from '../../../utils/math';

interface Props {
  monthName: string;
  income: number;
  expense: number;
  currency: string;
  hideBalance: boolean;
  isDark: boolean;
  onPress: () => void; // 👈 Προσθήκη onPress prop
}

export default function MonthRowItem({ monthName, income, expense, currency, hideBalance, isDark, onPress }: Props) {
  const net = income - expense;
  const textColor = isDark ? '#FFFFFF' : '#111827';
  const borderBottomColor = isDark ? '#1C1C1E' : '#F3F4F6';

  return (
    /* 🛠️ Μετατροπή από View σε TouchableOpacity */
    <TouchableOpacity style={[styles.row, { borderBottomColor }]} onPress={onPress} activeOpacity={0.6}>
      <View style={styles.leftCol}>
        <Text style={[styles.monthName, { color: textColor }]}>{monthName}</Text>
        <View style={styles.miniStats}>
          <Text style={styles.incomeMini}>+{formatMoney(income)}</Text>
          <Text style={styles.separator}>|</Text>
          <Text style={styles.expenseMini}>-{formatMoney(expense)}</Text>
        </View>
      </View>
      <View style={styles.rightCol}>
        <Text style={[styles.netText, { color: net >= 0 ? '#10B981' : '#EF4444' }]}>
          {hideBalance ? '•••' : `${net >= 0 ? '+' : ''}${formatMoney(net)} ${currency}`}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, paddingHorizontal: 4 },
  leftCol: { flex: 1 },
  monthName: { fontSize: 15, fontWeight: '600', textTransform: 'capitalize' },
  miniStats: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  incomeMini: { fontSize: 11, color: '#10B981', fontWeight: '500' },
  expenseMini: { fontSize: 11, color: '#EF4444', fontWeight: '500' },
  separator: { fontSize: 10, color: '#9CA3AF', marginHorizontal: 6 },
  rightCol: { alignItems: 'flex-end' },
  netText: { fontSize: 14, fontWeight: '700' }
});