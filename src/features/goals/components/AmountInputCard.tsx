import React from 'react';
import { StyleSheet } from 'react-native';
import { Surface, TextInput } from 'react-native-paper';

interface Props {
  cardBg: string;
  textColor: string;
  amount: string;
  setAmount: (val: string) => void;
  transferType: string;
  currency: string;
  t: (key: string, defaultText: string) => string;
}

export default function AmountInputCard({ cardBg, textColor, amount, setAmount, transferType, currency, t }: Props) {
  return (
    <Surface style={[styles.card, { backgroundColor: cardBg }]} mode="flat">
      <TextInput
        label={`${t('transactions.amountLabel', 'Amount')} (${currency})`}
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        mode="outlined"
        outlineStyle={styles.inputOutline}
        activeOutlineColor={transferType === 'deposit' ? '#10B981' : '#EF4444'}
        style={styles.amountInput}
        textColor={textColor}
      />
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: 24, marginBottom: 14 },
  amountInput: { backgroundColor: 'transparent', fontSize: 22, fontWeight: '700' },
  inputOutline: { borderRadius: 16 }
});