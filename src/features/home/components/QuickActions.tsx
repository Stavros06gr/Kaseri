import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { PlusCircle, MinusCircle, ArrowLeftRight } from 'lucide-react-native';

interface Props {
  onIncome: () => void;
  onExpense: () => void;
  onTransfer: () => void;
  isDark: boolean;
  t: (key: string) => string;
}

export default function QuickActions({ onIncome, onExpense, onTransfer, isDark, t }: Props) {
  const colorMain = isDark ? '#FFFFFF' : '#111827';

  return (
    <View style={styles.actionRow}>
      <TouchableOpacity style={styles.actionButton} onPress={onIncome}>
        <View style={[styles.iconWrapper, { backgroundColor: '#E6F4EA' }]}>
          <PlusCircle size={24} color="#10B981" />
        </View>
        <Text style={[styles.actionText, { color: colorMain }]}>{t('transactions.income')}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionButton} onPress={onExpense}>
        <View style={[styles.iconWrapper, { backgroundColor: '#FCE8E6' }]}>
          <MinusCircle size={24} color="#EF4444" />
        </View>
        <Text style={[styles.actionText, { color: colorMain }]}>{t('transactions.expense')}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionButton} onPress={onTransfer}>
        <View style={[styles.iconWrapper, { backgroundColor: '#E8F0FE' }]}>
          <ArrowLeftRight size={22} color="#2563EB" />
        </View>
        <Text style={[styles.actionText, { color: colorMain }]}>{t('transactions.transfer')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  actionRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 24 },
  actionButton: { alignItems: 'center', flex: 1 },
  iconWrapper: { width: 54, height: 54, borderRadius: 27, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  actionText: { fontSize: 12, fontWeight: '600' }
});