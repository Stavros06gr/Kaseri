import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text, Surface, TextInput } from 'react-native-paper';
import { Wallet, Tag, FileText, Calendar as CalendarIcon, ChevronDown } from 'lucide-react-native';
import { format } from 'date-fns';

interface Props {
  walletName: string;
  category: string;
  setCategory: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  date: Date;
  type: 'income' | 'expense' | 'transfer';
  onDatePress: () => void;
  locale: any;
  isDark: boolean;
  t: (key: string, defaultText: string) => string;
}

export default function EditDetailsCard({
  walletName, category, setCategory, description, setDescription, date, type, onDatePress, locale, isDark, t
}: Props) {
  const textColor = { color: isDark ? '#FFFFFF' : '#111827' };
  const labelColor = { color: isDark ? '#9CA3AF' : '#6B7280' };
  const borderColor = { borderColor: isDark ? '#2D2D2D' : '#E5E7EB' };

  return (
    <Surface style={[styles.card, { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }]} mode="flat">
      
      {/* WALLET DISPLAY (Read-only για ασφάλεια integrity των ιστορικών εγγραφών) */}
      <Text style={[styles.fieldLabel, labelColor]}>{t('transactions.walletLabel', 'Wallet')}</Text>
      <View style={[styles.disabledSelector, borderColor]}>
        <View style={styles.selectorLeft}>
          <Wallet size={18} color={isDark ? '#4B5563' : '#9CA3AF'} style={{ marginRight: 10 }} />
          <Text style={{ color: isDark ? '#6B7280' : '#9CA3AF' }}>{walletName}</Text>
        </View>
      </View>

      {/* CATEGORY (Εμφανίζεται μόνο αν δεν είναι transfer) */}
      {type !== 'transfer' && (
        <>
          <Text style={[styles.fieldLabel, labelColor, { marginTop: 16 }]}>{t('transactions.categoryLabel', 'Category')}</Text>
          <TextInput
            value={category}
            onChangeText={setCategory}
            mode="outlined"
            style={styles.formInput}
            outlineColor={isDark ? '#2D2D2D' : '#E5E7EB'}
            activeOutlineColor="#2563EB"
            textColor={textColor.color}
            left={<TextInput.Icon icon={() => <Tag size={18} color={isDark ? '#9CA3AF' : '#6B7280'} />} />}
          />
        </>
      )}

      {/* DESCRIPTION */}
      <Text style={[styles.fieldLabel, labelColor, { marginTop: 16 }]}>{t('transactions.descriptionLabel', 'Description')}</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        mode="outlined"
        style={styles.formInput}
        outlineColor={isDark ? '#2D2D2D' : '#E5E7EB'}
        activeOutlineColor="#2563EB"
        textColor={textColor.color}
        left={<TextInput.Icon icon={() => <FileText size={18} color={isDark ? '#9CA3AF' : '#6B7280'} />} />}
      />

      {/* DATE */}
      <Text style={[styles.fieldLabel, labelColor, { marginTop: 16 }]}>{t('transactions.dateLabel', 'Date')}</Text>
      <TouchableOpacity style={[styles.dateDisplayRow, borderColor]} onPress={onDatePress}>
        <View style={styles.selectorLeft}>
          <CalendarIcon size={18} color={isDark ? '#9CA3AF' : '#6B7280'} style={{ marginRight: 10 }} />
          <Text style={textColor}>{format(date, 'dd MMMM yyyy', { locale })}</Text>
        </View>
        <ChevronDown size={16} color="#9CA3AF" />
      </TouchableOpacity>

    </Surface>
  );
}

const styles = StyleSheet.create({
  card: { padding: 18, borderRadius: 20, marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '500', marginBottom: 6 },
  disabledSelector: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, height: 48, backgroundColor: 'rgba(0,0,0,0.02)' },
  selectorLeft: { flexDirection: 'row', alignItems: 'center' },
  formInput: { backgroundColor: 'transparent', height: 48 },
  dateDisplayRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, height: 48 }
});