import React, { useState } from 'react';
import { StyleSheet, Alert, View } from 'react-native';
import { Portal, Dialog, TextInput, Button, IconButton } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { XCircle } from 'lucide-react-native';

interface Props {
  visible: boolean;
  onDismiss: () => void;
  onCreate: (name: string, target: number, date: Date | null) => Promise<void>; // 👈 Date ή null
  currency: string;
  isDark: boolean;
  currentLocale: any;
  t: (key: string, defaultText: string) => string;
}

export default function AddGoalModal({ visible, onDismiss, onCreate, currency, isDark, currentLocale, t }: Props) {
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [date, setDate] = useState<Date | null>(null); // 🛠️ Default null (Προαιρετικό)
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSubmit = async () => {
    const parsedTarget = parseFloat(target);
    if (!name.trim() || isNaN(parsedTarget) || parsedTarget <= 0) {
      Alert.alert('Error', t('goals.invalidFields', 'Please enter a valid name and target amount'));
      return;
    }

    await onCreate(name.trim(), parsedTarget, date);
    handleReset();
  };

  const handleReset = () => {
    setName('');
    target && setTarget('');
    setDate(null);
    onDismiss();
  };

  return (
    <>
      <Portal>
        <Dialog visible={visible} onDismiss={handleReset} style={{ backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF', borderRadius: 24 }}>
          <Dialog.Title style={{ color: isDark ? '#FFFFFF' : '#111827', fontWeight: '700' }}>
            {t('goals.createTitle', 'Create Saving Goal')}
          </Dialog.Title>
          
          <Dialog.Content>
            <TextInput
              label={t('goals.namePlaceholder', 'Goal Name (e.g. Vacation)')}
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
              activeOutlineColor="#2563EB"
              textColor={isDark ? '#FFFFFF' : '#111827'}
            />
            
            <TextInput
              label={`${t('goals.targetPlaceholder', 'Target Amount')} (${currency})`}
              value={target}
              onChangeText={setTarget}
              keyboardType="numeric"
              mode="outlined"
              style={[styles.input, { marginTop: 12 }]}
              activeOutlineColor="#2563EB"
              textColor={isDark ? '#FFFFFF' : '#111827'}
            />
            
            {/* 🛠️ Row με έξυπνη επιλογή / αφαίρεση ημερομηνίας */}
            <View style={styles.dateRow}>
              <Button 
                mode="outlined" 
                onPress={() => setShowDatePicker(true)}
                style={[styles.datePickerBtn, { borderColor: isDark ? '#4B5563' : '#D1D5DB' }]}
                textColor={date ? (isDark ? '#FFFFFF' : '#111827') : '#9CA3AF'}
              >
                {date ? format(date, 'dd MMMM yyyy', { locale: currentLocale }) : t('goals.noDate', 'No End Date (Optional)')}
              </Button>
              {date && (
                <IconButton 
                  /* 🛠️ Η ΔΙΟΡΘΩΣΗ: Χρήση της Lucide αντί για string */
                  icon={({ color, size }) => <XCircle size={size} color={color} />} 
                  iconColor="#EF4444" 
                  size={24} 
                  onPress={() => setDate(null)} 
                  style={styles.clearDateBtn}
                />
              )}
            </View>
          </Dialog.Content>
          
          <Dialog.Actions>
            <Button onPress={handleReset} textColor={isDark ? '#9CA3AF' : '#6B7280'}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button onPress={handleSubmit} textColor="#2563EB" labelStyle={{ fontWeight: '700' }} disabled={!name || !target}>
              {t('common.create', 'Create')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {showDatePicker && (
        <DateTimePicker
          value={date || new Date()}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onValueChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setDate(selectedDate);
          }}
          onDismiss={() => setShowDatePicker(false)}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  input: { backgroundColor: 'transparent' },
  dateRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  datePickerBtn: { flex: 1, borderRadius: 12, height: 48, justifyContent: 'center' },
  clearDateBtn: { margin: 0, marginLeft: 4 }
});