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

// Components
import TransferHeader from './components/TransferHeader';
import TransferAmountCard from './components/TransferAmountCard';
import TransferDetailsCard from './components/TransferDetailsCard';
import TransferWalletDialog from './components/TransferWalletDialog';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;
type WalletTypeTarget = 'from' | 'to';

export default function TransferScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();

  const { currency, theme, language } = useAppStore();
  const isDark = theme === 'dark';
  const currentLocale = language === 'gr' ? el : enUS;

  // Form States
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [fromWalletId, setFromWalletId] = useState('');
  const [fromWalletName, setFromWalletName] = useState('');
  const [toWalletId, setToWalletId] = useState('');
  const [toWalletName, setToWalletName] = useState('');
  const [date, setDate] = useState(new Date());

  // UI States
  const [wallets, setWallets] = useState<WalletModel[]>([]);
  const [isWalletDialogVisible, setIsWalletDialogVisible] = useState(false);
  const [activeTarget, setActiveTarget] = useState<WalletTypeTarget>('from');
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (isFocused) {
      loadWallets();
    }
  }, [isFocused]);

  const loadWallets = async () => {
    try {
      const walletRecords = (await database.get('wallets').query().fetch()) as WalletModel[];
      const sortedWallets = walletRecords.sort((a, b) => b.balance - a.balance);
      setWallets(sortedWallets);

      if (sortedWallets.length > 0 && !fromWalletId) {
        // Εύρεση του τελευταίου χρησιμοποιημένου για το "From Wallet"
        const lastTransactions = (await database.get('transactions')
          .query(Q.sortBy('date', Q.desc), Q.take(1))
          .fetch()) as TransactionModel[];

        let defaultFrom = sortedWallets[0];
        if (lastTransactions.length > 0) {
          const found = sortedWallets.find(w => w.id === lastTransactions[0].walletId);
          if (found) defaultFrom = found;
        }

        setFromWalletId(defaultFrom.id);
        setFromWalletName(defaultFrom.name);

        // Προεπιλογή του δεύτερου μεγαλύτερου για το "To Wallet" (αν υπάρχει)
        const defaultTo = sortedWallets.find(w => w.id !== defaultFrom.id) || sortedWallets[0];
        setToWalletId(defaultTo.id);
        setToWalletName(defaultTo.name);
      }
    } catch (error) {
      console.error('Error loading wallets for transfer:', error);
    }
  };

  const handleSaveTransfer = async () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Error', t('transactions.invalidAmount', 'Please enter a valid amount'));
      return;
    }
    if (!fromWalletId || !toWalletId) {
      Alert.alert('Error', t('transactions.selectWalletError', 'Please select both wallets'));
      return;
    }
    if (fromWalletId === toWalletId) {
      Alert.alert('Error', t('transactions.sameWalletError', 'Source and destination wallets cannot be the same'));
      return;
    }
  
    try {
      await database.write(async () => {
        // 1. ΕΓΓΡΑΦΗ 1: Αρνητικό ποσό στο πορτοφόλι που ΣΤΕΛΝΕΙ (Outflow)
        await database.get('transactions').create((tx: any) => {
          tx.amount = -parsedAmount; // Αρνητικό πρόσημο
          tx.type = 'transfer';
          tx.walletId = fromWalletId;
          tx.category = t('transactions.defaultTransferCat', 'Transfer');
          tx.description = description.trim() || `${t('transactions.transferTo', 'Transfer to')} ${toWalletName}`;
          tx.date = date.getTime();
        });
  
        // 2. ΕΓΓΡΑΦΗ 2: Θετικό ποσό στο πορτοφόλι που ΔΕΧΕΤΑΙ (Inflow)
        await database.get('transactions').create((tx: any) => {
          tx.amount = parsedAmount; // Θετικό πρόσημο
          tx.type = 'transfer';
          tx.walletId = toWalletId;
          tx.category = t('transactions.defaultTransferCat', 'Transfer');
          tx.description = description.trim() || `${t('transactions.transferFrom', 'Transfer from')} ${fromWalletName}`;
          tx.date = date.getTime();
        });
  
        // 3. Ενημέρωση πραγματικού υπολοίπου στο From Wallet
        const fromWallet = (await database.get('wallets').find(fromWalletId)) as WalletModel;
        await fromWallet.update((w: any) => {
          w.balance -= parsedAmount;
        });
  
        // 4. Ενημέρωση πραγματικού υπολοίπου στο To Wallet
        const toWallet = (await database.get('wallets').find(toWalletId)) as WalletModel;
        await toWallet.update((w: any) => {
          w.balance += parsedAmount;
        });
      });
  
      navigation.goBack();
    } catch (error) {
      console.error('Failed to execute transfer:', error);
    }
  };

  const openWalletDialog = (target: WalletTypeTarget) => {
    setActiveTarget(target);
    setIsWalletDialogVisible(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F9FAFB', paddingTop: insets.top + 16 }]}>
      
      <TransferHeader 
        title={t('transactions.addTransfer', 'Transfer Funds')}
        cancelLabel={t('common.cancel', 'Cancel')}
        onCancel={() => navigation.goBack()}
        isDark={isDark}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        
        <TransferAmountCard 
          amount={amount}
          setAmount={setAmount}
          currency={currency}
          label={t('transactions.amountLabel', 'Amount')}
          isDark={isDark}
        />

        <TransferDetailsCard 
          fromWalletName={fromWalletName}
          toWalletName={toWalletName}
          description={description}
          setDescription={setDescription}
          date={date}
          onFromWalletPress={() => openWalletDialog('from')}
          onToWalletPress={() => openWalletDialog('to')}
          onDatePress={() => setShowDatePicker(true)}
          locale={currentLocale}
          isDark={isDark}
          t={t}
        />

        <Button 
          mode="contained" 
          onPress={handleSaveTransfer}
          style={styles.saveButton}
          contentStyle={styles.saveButtonContent}
          buttonColor="#2563EB"
          disabled={!amount}
        >
          {t('transactions.saveTransferBtn', 'Confirm Transfer')}
        </Button>

      </ScrollView>

      <TransferWalletDialog 
        visible={isWalletDialogVisible}
        onDismiss={() => setIsWalletDialogVisible(false)}
        wallets={wallets}
        selectedId={activeTarget === 'from' ? fromWalletId : toWalletId}
        isDark={isDark}
        currency={currency}
        titleLabel={activeTarget === 'from' ? t('transactions.fromWalletLabel', 'From Wallet') : t('transactions.toWalletLabel', 'To Wallet')}
        cancelLabel={t('common.cancel', 'Cancel')}
        onSelect={(value) => {
          const found = wallets.find(w => w.id === value);
          if (activeTarget === 'from') {
            setFromWalletId(value);
            if (found) setFromWalletName(found.name);
          } else {
            setToWalletId(value);
            if (found) setToWalletName(found.name);
          }
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