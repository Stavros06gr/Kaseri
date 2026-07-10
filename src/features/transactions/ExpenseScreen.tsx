import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Q } from '@nozbe/watermelondb';
import { el, enUS } from 'date-fns/locale';

import { database } from '../../database';
import { useAppStore } from '../../store/useAppStore';
import { RootStackParamList } from '../../navigation/types';
import WalletModel from '../../database/models/Wallet';
import TransactionModel from '../../database/models/Transaction';

// Imports των νέων Expense Components
import ExpenseHeader from './components/ExpenseHeader';
import ExpenseAmountCard from './components/ExpenseAmountCard';
import ExpenseDetailsCard from './components/ExpenseDetailsCard';
import ExpenseWalletDialog from './components/ExpenseWalletDialog';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

export default function ExpenseScreen() {
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
      // 1. Φόρτωση και ταξινόμηση από το μεγαλύτερο balance στο μικρότερο
      const walletRecords = (await database.get('wallets').query().fetch()) as WalletModel[];
      const sortedWallets = walletRecords.sort((a, b) => b.balance - a.balance);
      setWallets(sortedWallets);
      
      if (sortedWallets.length > 0 && !selectedWalletId) {
        // 2. Εύρεση της last χρησιμοποιημένης συσκευής/πορτοφολιού
        const lastTransactions = (await database.get('transactions')
          .query(Q.sortBy('date', Q.desc), Q.take(1))
          .fetch()) as TransactionModel[];

        let targetWallet = sortedWallets[0];

        if (lastTransactions.length > 0) {
          const lastWalletId = lastTransactions[0].walletId;
          const foundLastWallet = sortedWallets.find(w => w.id === lastWalletId);
          if (foundLastWallet) targetWallet = foundLastWallet;
        }

        setSelectedWalletId(targetWallet.id);
        setSelectedWalletName(targetWallet.name);
      }
    } catch (error) {
      console.error('Error loading wallets for expense:', error);
    }
  };

  const handleSaveExpense = async () => {
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
        // 1. Δημιουργία της συναλλαγής εξόδου
        await database.get('transactions').create((tx: any) => {
          tx.amount = parsedAmount;
          tx.type = 'expense';
          tx.walletId = selectedWalletId;
          tx.category = category.trim() || t('transactions.defaultExpenseCat', 'General');
          tx.description = description.trim();
          tx.date = date.getTime();
        });

        // 2. Ενημέρωση πορτοφολιού (Αφαίρεση ποσού)
        const wallet = (await database.get('wallets').find(selectedWalletId)) as WalletModel;
        await wallet.update((w: any) => {
          w.balance -= parsedAmount; // Αφαίρεση χρημάτων
        });
      });

      navigation.goBack();
    } catch (error) {
      console.error('Failed to save expense transaction:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F9FAFB', paddingTop: insets.top + 16 }]}>
      
      <ExpenseHeader 
        title={t('transactions.addExpense', 'Add Expense')}
        cancelLabel={t('common.cancel', 'Cancel')}
        onCancel={() => navigation.goBack()}
        isDark={isDark}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        
        <ExpenseAmountCard 
          amount={amount}
          setAmount={setAmount}
          currency={currency}
          label={t('transactions.amountLabel', 'Amount')}
          isDark={isDark}
        />

        <ExpenseDetailsCard 
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
          onPress={handleSaveExpense}
          style={styles.saveButton}
          contentStyle={styles.saveButtonContent}
          buttonColor="#EF4444"
          disabled={!amount}
        >
          {t('transactions.saveExpenseBtn', 'Save Expense')}
        </Button>

      </ScrollView>

      <ExpenseWalletDialog 
        visible={isWalletDialogVisible}
        onDismiss={() => setIsWalletDialogVisible(false)}
        wallets={wallets}
        selectedId={selectedWalletId}
        isDark={isDark}
        currency={currency}
        titleLabel={t('transactions.selectWallet', 'Select Wallet')}
        cancelLabel={t('common.cancel', 'Cancel')}
        onSelect={(value) => {
          setSelectedWalletId(value);
          const found = wallets.find(w => w.id === value);
          if (found) setSelectedWalletName(found.name);
          setIsWalletDialogVisible(false);
        }}
      />

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onValueChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setDate(selectedDate);
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