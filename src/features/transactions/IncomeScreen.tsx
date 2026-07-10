import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { el, enUS } from 'date-fns/locale';

import { database } from '../../database';
import { useAppStore } from '../../store/useAppStore';
import { RootStackParamList } from '../../navigation/types';
import WalletModel from '../../database/models/Wallet';

import IncomeHeader from './components/IncomeHeader';
import AmountInputCard from './components/AmountInputCard';
import DetailsFormCard from './components/DetailsFormCard';
import WalletSelectionDialog from './components/WalletSelectionDialog';

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
  const [date, setDate] = useState(new Date());

  // UI Visibility States
  const [wallets, setWallets] = useState<WalletModel[]>([]);
  const [isWalletDialogVisible, setIsWalletDialogVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (isFocused) {
      loadWallets();
    }
  }, [isFocused]);

  const loadWallets = async () => {
    try {
      const walletRecords = (await database.get('wallets').query().fetch()) as WalletModel[];
      setWallets(walletRecords);
      
      if (walletRecords.length > 0 && !selectedWalletId) {
        setSelectedWalletId(walletRecords[0].id);
        setSelectedWalletName(walletRecords[0].name);
      }
    } catch (error) {
      console.error('Error loading wallets for income:', error);
    }
  };

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
      await database.write(async () => {
        await database.get('transactions').create((tx: any) => {
          tx.amount = parsedAmount;
          tx.type = 'income';
          tx.walletId = selectedWalletId;
          tx.category = category.trim() || t('transactions.defaultIncomeCat', 'Salary');
          tx.description = description.trim();
          tx.date = date.getTime();
        });

        const wallet = (await database.get('wallets').find(selectedWalletId)) as WalletModel;
        await wallet.update((w: any) => {
          w.balance += parsedAmount;
        });
      });

      navigation.goBack();
    } catch (error) {
      console.error('Failed to save income transaction:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F9FAFB', paddingTop: insets.top + 16 }]}>
      
      <IncomeHeader 
        title={t('transactions.addIncome', 'Add Income')}
        cancelLabel={t('common.cancel', 'Cancel')}
        onCancel={() => navigation.goBack()}
        isDark={isDark}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        
        <AmountInputCard 
          amount={amount}
          setAmount={setAmount}
          currency={currency}
          label={t('transactions.amountLabel', 'Amount')}
          isDark={isDark}
        />

        <DetailsFormCard 
          walletName={selectedWalletName}
          category={category}
          setCategory={setCategory}
          description={description}
          setDescription={setDescription}
          date={date}
          onWalletPress={() => setIsWalletDialogVisible(true)}
          onDatePress={() => setShowDatePicker(true)}
          locale={currentLocale}
          isDark={isDark}
          t={t}
        />

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

      {/* MODAL ΕΠΙΛΟΓΗΣ ΠΟΡΤΟΦΟΛΙΟΥ */}
      <WalletSelectionDialog 
        visible={isWalletDialogVisible}
        onDismiss={() => setIsWalletDialogVisible(false)}
        wallets={wallets}
        selectedId={selectedWalletId}
        isDark={isDark}
        currency={currency} // <- Περνάμε το currency εδώ
        titleLabel={t('transactions.selectWallet', 'Select Wallet')}
        cancelLabel={t('common.cancel', 'Cancel')}
        onSelect={(value) => {
          setSelectedWalletId(value);
          const found = wallets.find(w => w.id === value);
          if (found) setSelectedWalletName(found.name);
          setIsWalletDialogVisible(false);
        }}
      />

      {/* NATIVE DATE PICKER (Με τη νέα, μη-deprecated σύνταξη) */}
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onValueChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setDate(selectedDate);
            }
          }}
          onDismiss={() => setShowDatePicker(false)}
        />
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  saveButton: { borderRadius: 14, marginTop: 8 },
  saveButtonContent: { height: 50 }
});