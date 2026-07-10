import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Text, Surface, TextInput, Button, Portal, Dialog, RadioButton } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowDownLeft, Wallet, Tag, FileText, Calendar as CalendarIcon, ChevronDown } from 'lucide-react-native';
import { format } from 'date-fns';
import { el, enUS } from 'date-fns/locale';

import { database } from '../../database';
import { useAppStore } from '../../store/useAppStore';
import { RootStackParamList } from '../../navigation/types';
import WalletModel from '../../database/models/Wallet';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

export default function IncomeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();

  const { currency, theme, language } = useAppStore();
  const isDark = theme === 'dark';
  const currentLocale = language === 'gr' ? el : enUS;

  // Form States
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [selectedWalletId, setSelectedWalletId] = useState<string>('');
  const [selectedWalletName, setSelectedWalletName] = useState('');
  const [date] = useState(new Date()); // Προεπιλογή η τρέχουσα ημερομηνία

  // UI States
  const [wallets, setWallets] = useState<WalletModel[]>([]);
  const [isWalletDialogVisible, setIsWalletDialogVisible] = useState(false);

  useEffect(() => {
    if (isFocused) {
      loadWallets();
    }
  }, [isFocused]);

  const loadWallets = async () => {
    try {
      const walletRecords = (await database.get('wallets').query().fetch()) as WalletModel[];
      setWallets(walletRecords);
      
      // Αν υπάρχει έστω και ένα πορτοφόλι, το επιλέγουμε αυτόματα ως προεπιλογή
      if (walletRecords.length > 0 && !selectedWalletId) {
        setSelectedWalletId(walletRecords[0].id);
        setSelectedWalletName(walletRecords[0].name);
      }
    } catch (error) {
      console.error('Error loading wallets for income:', error);
    }
  };

  // Αποθήκευση Συναλλαγής & Ενημέρωση Πορτοφολιού
  const handleSaveIncome = async () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Error', t('transactions.invalidAmount', 'Please enter a valid amount'));
      return;
    }
    if (!selectedWalletId) {
      Alert.alert('Error', t('transactions.selectWalletError', 'Please select a wallet'));
      return;
    }

    try {
      // Εκτέλεση εγγραφής στη WatermelonDB
      await database.write(async () => {
        // 1. Δημιουργία της Transaction
        await database.get('transactions').create((tx: any) => {
          tx.amount = parsedAmount;
          tx.type = 'income';
          tx.walletId = selectedWalletId;
          tx.category = category.trim() || t('transactions.defaultIncomeCat', 'Salary');
          tx.description = description.trim();
          tx.date = date.getTime();
        });

        // 2. Εύρεση και ενημέρωση του Wallet (Προσθέτουμε το ποσό στο balance)
        const wallet = (await database.get('wallets').find(selectedWalletId)) as WalletModel;
        await wallet.update((w: any) => {
          w.balance += parsedAmount;
        });
      });

      // Επιστροφή στην προηγούμενη οθόνη με επιτυχία
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save income transaction:', error);
      Alert.alert('Error', 'Could not save transaction.');
    }
  };

  const dynamicStyles = {
    bg: { backgroundColor: isDark ? '#121212' : '#F9FAFB' },
    card: { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' },
    textMain: { color: isDark ? '#FFFFFF' : '#111827' },
    textMuted: { color: isDark ? '#9CA3AF' : '#6B7280' },
    inputBg: { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' },
    dialogBg: { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }
  };

  return (
    <View style={[styles.container, dynamicStyles.bg, { paddingTop: insets.top + 16 }]}>
      
      {/* HEADER ROW */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.iconBadge}>
            <ArrowDownLeft size={22} color="#10B981" />
          </View>
          <Text style={[styles.screenTitle, dynamicStyles.textMain]}>
            {t('transactions.addIncome', 'Add Income')}
          </Text>
        </View>
        <Button mode="text" onPress={() => navigation.goBack()} textColor="#EF4444">
          {t('common.cancel', 'Cancel')}
        </Button>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        
        {/* AMOUNT INPUT CARD */}
        <Surface style={[styles.card, dynamicStyles.card]} mode="flat">
          <Text style={[styles.inputLabel, dynamicStyles.textMuted]}>
            {t('transactions.amountLabel', 'Amount')} ({currency})
          </Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="0.00"
            placeholderTextColor={isDark ? '#4B5563' : '#9CA3AF'}
            mode="flat"
            style={[styles.amountInput, dynamicStyles.inputBg]}
            underlineColor="transparent"
            activeUnderlineColor="transparent"
            textColor="#10B981"
          />
        </Surface>

        {/* DETAILS FORM CARD */}
        <Surface style={[styles.card, dynamicStyles.card]} mode="flat">
          
          {/* CUSTOM WALLET SELECTOR */}
          <Text style={[styles.fieldLabel, dynamicStyles.textMuted]}>
            {t('transactions.selectWallet', 'Select Wallet')}
          </Text>
          <TouchableOpacity 
            style={[styles.selectorTap, { borderColor: isDark ? '#2D2D2D' : '#E5E7EB' }]}
            onPress={() => setIsWalletDialogVisible(true)}
          >
            <View style={styles.selectorLeft}>
              <Wallet size={18} color={isDark ? '#9CA3AF' : '#6B7280'} style={{ marginRight: 10 }} />
              <Text style={dynamicStyles.textMain}>
                {selectedWalletName || t('transactions.chooseWallet', 'Choose a wallet...')}
              </Text>
            </View>
            <ChevronDown size={18} color="#9CA3AF" />
          </TouchableOpacity>

          {/* CATEGORY INPUT */}
          <Text style={[styles.fieldLabel, dynamicStyles.textMuted, { marginTop: 16 }]}>
            {t('transactions.categoryLabel', 'Category')}
          </Text>
          <TextInput
            value={category}
            onChangeText={setCategory}
            placeholder={t('transactions.categoryPlaceholder', 'e.g. Salary, Freelance')}
            mode="outlined"
            style={styles.formInput}
            outlineColor={isDark ? '#2D2D2D' : '#E5E7EB'}
            activeOutlineColor="#10B981"
            textColor={dynamicStyles.textMain.color}
            left={<TextInput.Icon icon={() => <Tag size={18} color={isDark ? '#9CA3AF' : '#6B7280'} />} />}
          />

          {/* DESCRIPTION INPUT */}
          <Text style={[styles.fieldLabel, dynamicStyles.textMuted, { marginTop: 16 }]}>
            {t('transactions.descriptionLabel', 'Description (Optional)')}
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder={t('transactions.descriptionPlaceholder', 'Add more info...')}
            mode="outlined"
            style={styles.formInput}
            outlineColor={isDark ? '#2D2D2D' : '#E5E7EB'}
            activeOutlineColor="#10B981"
            textColor={dynamicStyles.textMain.color}
            left={<TextInput.Icon icon={() => <FileText size={18} color={isDark ? '#9CA3AF' : '#6B7280'} />} />}
          />

          {/* STATIC DATE ROW (For UX Simplicity) */}
          <Text style={[styles.fieldLabel, dynamicStyles.textMuted, { marginTop: 16 }]}>
            {t('transactions.dateLabel', 'Date')}
          </Text>
          <View style={[styles.dateDisplayRow, { borderColor: isDark ? '#2D2D2D' : '#E5E7EB' }]}>
            <View style={styles.selectorLeft}>
              <CalendarIcon size={18} color={isDark ? '#9CA3AF' : '#6B7280'} style={{ marginRight: 10 }} />
              <Text style={dynamicStyles.textMuted}>
                {format(date, 'dd MMMM yyyy', { locale: currentLocale })}
              </Text>
            </View>
          </View>

        </Surface>

        {/* SAVE BUTTON */}
        <Button 
          mode="contained" 
          onPress={handleSaveIncome}
          style={styles.saveButton}
          contentStyle={styles.saveButtonContent}
          buttonColor="#10B981"
          disabled={!amount}
        >
          {t('transactions.saveIncomeBtn', 'Save Income')}
        </Button>

      </ScrollView>

      {/* WALLET SELECTION MODAL/DIALOG */}
      <Portal>
        <Dialog 
          visible={isWalletDialogVisible} 
          onDismiss={() => setIsWalletDialogVisible(false)}
          style={dynamicStyles.dialogBg}
        >
          <Dialog.Title style={dynamicStyles.textMain}>
            {t('transactions.selectWallet', 'Select Wallet')}
          </Dialog.Title>
          <Dialog.Content>
            <ScrollView style={{ maxHeight: 250 }}>
              <RadioButton.Group 
                onValueChange={(value) => {
                  setSelectedWalletId(value);
                  const found = wallets.find(w => w.id === value);
                  if (found) setSelectedWalletName(found.name);
                  setIsWalletDialogVisible(false);
                }} 
                value={selectedWalletId}
              >
                {wallets.map((w) => (
                  <View key={w.id} style={styles.radioRow}>
                    <RadioButton.Android value={w.id} color="#10B981" uncheckedColor={isDark ? '#4B5563' : '#9CA3AF'} />
                    <Text style={[styles.radioLabel, dynamicStyles.textMain]}>{w.name}</Text>
                  </View>
                ))}
              </RadioButton.Group>
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIsWalletDialogVisible(false)} textColor="#EF4444">
              {t('common.cancel', 'Cancel')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBadge: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(16, 185, 129, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  screenTitle: { fontSize: 22, fontWeight: '700', letterSpacing: -0.5 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  card: { padding: 18, borderRadius: 20, marginBottom: 16 },
  inputLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  amountInput: { fontSize: 36, fontWeight: '700', paddingHorizontal: 0, height: 54 },
  fieldLabel: { fontSize: 13, fontWeight: '500', marginBottom: 6 },
  selectorTap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, height: 48 },
  selectorLeft: { flexDirection: 'row', alignItems: 'center' },
  formInput: { backgroundColor: 'transparent', height: 48 },
  dateDisplayRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, height: 48, backgroundColor: 'rgba(0,0,0,0.02)' },
  saveButton: { borderRadius: 14, marginTop: 8 },
  saveButtonContent: { height: 50 },
  radioRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  radioLabel: { fontSize: 15, marginLeft: 8 }
});