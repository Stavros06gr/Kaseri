import React, { useState } from 'react';
import { StyleSheet, Alert } from 'react-native';
import { Portal, Dialog, TextInput, Button } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

interface Props {
  visible: boolean;
  onDismiss: () => void;
  onCreate: (name: string, target: number, date: Date) => Promise<void>;
  currency: string;
  isDark: boolean;
  currentLocale: any;
  t: (key: string, defaultText: string) => string;
}

export default function AddGoalModal({
  visible,
  onDismiss,
  onCreate,
  currency,
  isDark,
  currentLocale,
  t,
}: Props) {
  // 🔒 Τα states της φόρμας απομονώθηκαν εδώ για μέγιστη απόδοση
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSubmit = async () => {
    const parsedTarget = parseFloat(target);
    if (!name.trim() || isNaN(parsedTarget) || parsedTarget <= 0) {
      Alert.alert('Error', t('goals.invalidFields', 'Please enter a valid name and target amount'));
      return;
    }

    await onCreate(name.trim(), parsedTarget, date);
    
    // Καθαρισμός φόρμας μετά την επιτυχία
    setName('');
    setTarget('');
    setDate(new Date());
  };

  const handleCancel = () => {
    setName('');
    setTarget('');
    setDate(new Date());
    onDismiss();
  };

  return (
    <>
      <Portal>
        <Dialog 
          visible={visible} 
          onDismiss={handleCancel} 
          style={{ backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF', borderRadius: 24 }}
        >
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
            
            <Button 
              mode="outlined" 
              onPress={() => setShowDatePicker(true)}
              style={[styles.datePickerBtn, { borderColor: isDark ? '#4B5563' : '#D1D5DB' }]}
              textColor={isDark ? '#FFFFFF' : '#111827'}
            >
              {format(date, 'dd MMMM yyyy', { locale: currentLocale })}
            </Button>
          </Dialog.Content>
          
          <Dialog.Actions>
            <Button onPress={handleCancel} textColor={isDark ? '#9CA3AF' : '#6B7280'}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button 
              onPress={handleSubmit} 
              textColor="#2563EB" 
              labelStyle={{ fontWeight: '700' }} 
              disabled={!name || !target}
            >
              {t('common.create', 'Create')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {showDatePicker && (
        <DateTimePicker
          value={date}
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
  datePickerBtn: { marginTop: 16, borderRadius: 12, height: 48, justifyContent: 'center' }
});