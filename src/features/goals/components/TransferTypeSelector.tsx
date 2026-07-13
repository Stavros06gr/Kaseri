import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SegmentedButtons } from 'react-native-paper';

interface Props {
  value: string;
  onChange: (val: string) => void;
  t: (key: string, defaultText: string) => string;
}

export default function TransferTypeSelector({ value, onChange, t }: Props) {
  return (
    <View style={styles.container}>
      <SegmentedButtons
        value={value}
        onValueChange={onChange}
        buttons={[
          /* 🛠️ Withdraw στα αριστερά, Deposit στα δεξιά */
          { 
            value: 'withdraw', 
            label: t('goals.withdraw', 'Withdraw'), 
            checkedColor: '#FFFFFF', 
            style: value === 'withdraw' ? { backgroundColor: '#EF4444' } : {} 
          },
          { 
            value: 'deposit', 
            label: t('goals.deposit', 'Deposit'), 
            checkedColor: '#FFFFFF', 
            style: value === 'deposit' ? { backgroundColor: '#10B981' } : {} 
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 }
});