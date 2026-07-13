import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';
import { PlusCircle, MinusCircle } from 'lucide-react-native';

interface Props {
  onAction: (type: 'deposit' | 'withdraw') => void;
  t: (key: string, defaultText: string) => string;
}

export default function GoalActionButtons({ onAction, t }: Props) {
  return (
    <View style={styles.actionButtonsRow}>
      <Button 
        mode="contained-tonal" 
        onPress={() => onAction('withdraw')} 
        style={[styles.actionBtn, { flex: 1, marginRight: 8 }]}
        buttonColor="rgba(239, 68, 68, 0.1)"
        textColor="#EF4444"
        icon={() => <MinusCircle size={18} color="#EF4444" />}
      >
        {t('goals.withdraw', 'Withdraw')}
      </Button>
      <Button 
        mode="contained" 
        onPress={() => onAction('deposit')} 
        style={[styles.actionBtn, { flex: 1, marginLeft: 8 }]}
        buttonColor="#10B981"
        textColor="#FFFFFF"
        icon={() => <PlusCircle size={18} color="#FFFFFF" />}
      >
        {t('goals.deposit', 'Add Funds')}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  actionButtonsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 26 },
  actionBtn: { borderRadius: 14, height: 48, justifyContent: 'center' }
});