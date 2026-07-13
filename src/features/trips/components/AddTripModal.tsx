import React, { useState } from 'react';
import { StyleSheet, View, Modal, TouchableOpacity, Alert } from 'react-native';
import { Text, Surface, TextInput, Button } from 'react-native-paper';
import { X, Calendar } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

interface Props {
  visible: boolean;
  onDismiss: () => void;
  onCreate: (name: string, budget: number, start: Date, end: Date) => Promise<void>;
  currency: string;
  isDark: boolean;
  currentLocale: any;
  t: (key: string, defaultText: string) => string;
}

export default function AddTripModal({ visible, onDismiss, onCreate, currency, isDark, currentLocale, t }: Props) {
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', t('trips.nameRequired', 'Please enter a trip name'));
      return;
    }
    if (endDate.getTime() < startDate.getTime()) {
      Alert.alert('Error', t('trips.invalidDates', 'End date cannot be before start date'));
      return;
    }

    try {
      setLoading(true);
      const parsedBudget = parseFloat(budget) || 0;
      await onCreate(name.trim(), parsedBudget, startDate, endDate);
      
      // Reset Form
      setName('');
      setBudget('');
      setStartDate(new Date());
      setEndDate(new Date());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const cardBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#111827';

  return (
    <Modal 
      visible={visible} 
      /* 🛠️ ΑΛΛΑΓΗ: fade αντί για slide για πιο φυσικό κεντραρισμένο εφέ */
      animationType="fade" 
      transparent={true} 
      onRequestClose={onDismiss}
    >
      <View style={styles.modalOverlay}>
        <Surface style={[styles.modalContent, { backgroundColor: cardBg }]} mode="flat">
          
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: textColor }]}>{t('trips.newTrip', 'Create New Trip')}</Text>
            <TouchableOpacity onPress={onDismiss} hitSlop={10}>
              <X size={22} color={isDark ? '#9CA3AF' : '#4B5563'} />
            </TouchableOpacity>
          </View>

          <TextInput
            label={t('trips.nameLabel', 'Trip Destination / Name')}
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
            activeOutlineColor="#2563EB"
            textColor={textColor}
          />

          <TextInput
            label={`${t('trips.budgetLabel', 'Total Budget')} (${currency})`}
            value={budget}
            onChangeText={setBudget}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
            activeOutlineColor="#2563EB"
            textColor={textColor}
          />

          {/* DATE PICKERS ROW */}
          <View style={styles.datesRow}>
            <TouchableOpacity style={[styles.dateBlock, { borderColor: isDark ? '#4B5563' : '#D1D5DB' }]} onPress={() => setShowStartPicker(true)}>
              <Text style={styles.dateLabel}>{t('trips.start', 'Start')}</Text>
              <View style={styles.dateValueRow}>
                <Calendar size={14} color="#2563EB" style={{ marginRight: 6 }} />
                <Text style={{ color: textColor, fontWeight: '600', fontSize: 12 }} numberOfLines={1}>
                  {format(startDate, 'dd MMM yy', { locale: currentLocale })}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.dateBlock, { borderColor: isDark ? '#4B5563' : '#D1D5DB' }]} onPress={() => setShowEndPicker(true)}>
              <Text style={styles.dateLabel}>{t('trips.end', 'End')}</Text>
              <View style={styles.dateValueRow}>
                <Calendar size={14} color="#EF4444" style={{ marginRight: 6 }} />
                <Text style={{ color: textColor, fontWeight: '600', fontSize: 12 }} numberOfLines={1}>
                  {format(endDate, 'dd MMM yy', { locale: currentLocale })}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <Button
            mode="contained"
            onPress={handleSave}
            loading={loading}
            disabled={loading}
            style={styles.submitBtn}
            buttonColor="#2563EB"
            labelStyle={styles.submitBtnLabel}
          >
            {t('trips.createBtn', 'Let\'s Go!')}
          </Button>

        </Surface>
      </View>

      {showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onValueChange={(e, d) => { setShowStartPicker(false); if (d) setStartDate(d); }}
        />
      )}

      {showEndPicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onValueChange={(e, d) => { setShowEndPicker(false); if (d) setEndDate(d); }}
        />
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  /* 🛠️ ΑΛΛΑΓΗ: Κεντράρισμα του overlay σε όλη την οθόνη */
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.6)', // Ελαφρώς πιο σκούρο backdrop για καλύτερη αντίθεση
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 20
  },
  /* 🛠️ ΑΛΛΑΓΗ: Στρογγυλεμένες γωνίες παντού και περιορισμός πλάτους */
  modalContent: { 
    borderRadius: 24, 
    padding: 24, 
    width: '100%',
    maxWidth: 360, // Ιδανικό πλάτος για να φαίνεται σωστά σε κάθε συσκευή
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', letterSpacing: -0.4 },
  input: { marginBottom: 16, backgroundColor: 'transparent' },
  datesRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  /* Μειώσαμε ελάχιστα το padding για να χωράνε άνετα οι ημερομηνίες σε μικρότερα κινητά */
  dateBlock: { flex: 1, borderWidth: 1, borderRadius: 14, padding: 10, marginHorizontal: 4 },
  dateLabel: { fontSize: 11, color: '#6B7280', fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  dateValueRow: { flexDirection: 'row', alignItems: 'center' },
  submitBtn: { height: 50, borderRadius: 16, justifyContent: 'center' },
  submitBtnLabel: { fontSize: 15, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 }
});