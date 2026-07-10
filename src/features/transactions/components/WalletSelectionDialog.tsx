import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, Portal, Dialog, RadioButton, Button } from 'react-native-paper';
import WalletModel from '../../../database/models/Wallet';
import { formatMoney } from '../../../utils/math'; // Εισαγωγή του formatter σου

interface Props {
  visible: boolean;
  onDismiss: () => void;
  wallets: WalletModel[];
  selectedId: string;
  onSelect: (id: string) => void;
  isDark: boolean;
  cancelLabel: string;
  titleLabel: string;
  currency: string; // <- Προσθήκη του currency prop
}

export default function WalletSelectionDialog({
  visible, onDismiss, wallets, selectedId, onSelect, isDark, cancelLabel, titleLabel, currency
}: Props) {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={{ backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }}>
        <Dialog.Title style={{ color: isDark ? '#FFFFFF' : '#111827' }}>{titleLabel}</Dialog.Title>
        <Dialog.Content>
          <ScrollView style={{ maxHeight: 250 }}>
            <RadioButton.Group onValueChange={onSelect} value={selectedId}>
              {wallets.map((w) => (
                <View key={w.id} style={styles.radioRow}>
                  <RadioButton.Android value={w.id} color="#10B981" uncheckedColor={isDark ? '#4B5563' : '#9CA3AF'} />
                  <Text style={[styles.radioLabel, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                    {w.name}
                    {/* Έλεγχος: Αν είναι κρυφό δείχνει τελείες, αλλιώς δείχνει το balance δίπλα στο όνομα */}
                    {w.isHidden ? ' (••••••)' : ` (${formatMoney(w.balance)} ${currency})`}
                  </Text>
                </View>
              ))}
            </RadioButton.Group>
          </ScrollView>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss} textColor="#EF4444">{cancelLabel}</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  radioRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  radioLabel: { fontSize: 15, marginLeft: 8, flex: 1 }
});