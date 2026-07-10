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
  onWalletPress: () => void;
  onDatePress: () => void;
  locale: any;
  isDark: boolean;
  t: (key: string, defaultText: string) => string;
}

export default function ExpenseDetailsCard({
  walletName, category, setCategory, description, setDescription, date, onWalletPress, onDatePress, locale, isDark, t
}: Props) {
  const textColor = { color: isDark ? '#FFFFFF' : '#111827' };
  const labelColor = { color: isDark ? '#9CA3AF' : '#6B7280' };
  const borderColor = { borderColor: isDark ? '#2D2D2D' : '#E5E7EB' };

  return (
    <Surface style={[styles.card, { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }]} mode="flat">
      
      {/* WALLET SELECTOR */}
      <Text style={[styles.fieldLabel, labelColor]}>{t('transactions.selectWallet', 'Select Wallet')}</Text>
      <TouchableOpacity style={[styles.selectorTap, borderColor]} onPress={onWalletPress}>
        <View style={styles.selectorLeft}>
          <Wallet size={18} color={isDark ? '#9CA3AF' : '#6B7280'} style={{ marginRight: 10 }} />
          <Text style={textColor}>{walletName || t('transactions.chooseWallet', 'Choose a wallet...')}</Text>
        </View>
        <ChevronDown size={18} color="#9CA3AF" />
      </TouchableOpacity>

      {/* CATEGORY */}
      <Text style={[styles.fieldLabel, labelColor, { marginTop: 16 }]}>{t('transactions.categoryLabel', 'Category')}</Text>
      <TextInput
        value={category}
        onChangeText={setCategory}
        placeholder={t('transactions.expenseCategoryPlaceholder', 'e.g. Supermarket, Bills, Fuel')}
        mode="outlined"
        style={styles.formInput}
        outlineColor={isDark ? '#2D2D2D' : '#E5E7EB'}
        activeOutlineColor="#EF4444"
        textColor={textColor.color}
        left={<TextInput.Icon icon={() => <Tag size={18} color={isDark ? '#9CA3AF' : '#6B7280'} />} />}
      />

      {/* DESCRIPTION */}
      <Text style={[styles.fieldLabel, labelColor, { marginTop: 16 }]}>{t('transactions.descriptionLabel', 'Description (Optional)')}</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder={t('transactions.descriptionPlaceholder', 'Add more info...')}
        mode="outlined"
        style={styles.formInput}
        outlineColor={isDark ? '#2D2D2D' : '#E5E7EB'}
        activeOutlineColor="#EF4444"
        textColor={textColor.color}
        left={<TextInput.Icon icon={() => <FileText size={18} color={isDark ? '#9CA3AF' : '#6B7280'} />} />}
      />

      {/* INTERACTIVE DATE ROW */}
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
  selectorTap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, height: 48 },
  selectorLeft: { flexDirection: 'row', alignItems: 'center' },
  formInput: { backgroundColor: 'transparent', height: 48 },
  dateDisplayRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, height: 48 }
});