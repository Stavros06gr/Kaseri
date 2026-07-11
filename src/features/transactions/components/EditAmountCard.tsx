import React from 'react';
import { StyleSheet } from 'react-native';
import { Text, Surface, TextInput } from 'react-native-paper';

interface Props {
  amount: string;
  setAmount: (val: string) => void;
  currency: string;
  label: string;
  type: 'income' | 'expense' | 'transfer';
  isDark: boolean;
}

export default function EditAmountCard({ amount, setAmount, currency, label, type, isDark }: Props) {
  const getAmountColor = () => {
    if (type === 'income') return '#10B981';
    if (type === 'expense') return '#EF4444';
    return '#2563EB'; // Transfer
  };

  return (
    <Surface style={[styles.card, { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }]} mode="flat">
      <Text style={[styles.inputLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
        {label} ({currency})
      </Text>
      <TextInput
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        placeholder="0.00"
        placeholderTextColor={isDark ? '#4B5563' : '#9CA3AF'}
        mode="flat"
        style={[styles.amountInput, { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }]}
        underlineColor="transparent"
        activeUnderlineColor="transparent"
        textColor={getAmountColor()}
      />
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: { padding: 18, borderRadius: 20, marginBottom: 16 },
  inputLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  amountInput: { fontSize: 36, fontWeight: '700', paddingHorizontal: 0, height: 54 },
});