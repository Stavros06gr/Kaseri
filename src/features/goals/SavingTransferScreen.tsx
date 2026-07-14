import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { el, enUS } from 'date-fns/locale';

import { database } from '../../database';
import { useAppStore } from '../../store/useAppStore';
import { RootStackParamList } from '../../navigation/types';
import WalletModel from '../../database/models/Wallet';
import SavingGoalModel from '../../database/models/SavingGoal';

// Components Imports
import TransferHeader from './components/TransferHeader';
import TransferTypeSelector from './components/TransferTypeSelector';
import AmountInputCard from './components/AmountInputCard';
import WalletGoalSelectorCard from './components/WalletGoalSelectorCard';
import DatePickerRow from './components/DatePickerRow';

type TransferScreenRouteProp = RouteProp<RootStackParamList, 'SavingTransfer'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SavingTransferScreen() {
  const { t } = useTranslation();
  const route = useRoute<TransferScreenRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();

  const { currency, theme, language } = useAppStore(); 
  const isDark = theme === 'dark';
  const currentLocale = language === 'gr' ? el : enUS;

  const routeGoalId = route.params?.goalId;
  const routeType = route.params?.type || 'deposit';

  const [transferType, setTransferType] = useState<string>(routeType);
  const [amount, setAmount] = useState('');
  const [selectedWalletId, setSelectedWalletId] = useState('');
  const [selectedGoalId, setSelectedGoalId] = useState(routeGoalId || '');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [wallets, setWallets] = useState<WalletModel[]>([]);
  const [goals, setGoals] = useState<SavingGoalModel[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const fetchedWallets = (await database.get('wallets').query().fetch()) as WalletModel[];
      const fetchedGoals = (await database.get('saving_goals').query().fetch()) as SavingGoalModel[];
      
      // 1. Φόρτωση ιστορικού για ταξινόμηση πρόσφατων (Last Recently Used)
      const fetchedTransfers = await database.get('saving_transfers').query().fetch();
      const sortedTransfers = fetchedTransfers.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      const fetchedTransactions = await database.get('transactions').query().fetch();
      const sortedTransactions = fetchedTransactions.sort((a: any, b: any) => b.date - a.date);

      // Χάρτες τελευταίας χρήσης
      const walletLastUsed = new Map();
      sortedTransactions.forEach((tx: any) => {
        if (!walletLastUsed.has(tx.walletId)) walletLastUsed.set(tx.walletId, tx.date);
      });

      const goalLastUsed = new Map();
      sortedTransfers.forEach((tr: any) => {
        if (!goalLastUsed.has(tr.savingGoalId)) goalLastUsed.set(tr.savingGoalId, tr.date ? new Date(tr.date).getTime() : 0);
      });

      // Ταξινόμηση Wallets: Πρόσφατα -> Αλφαβητικά
      const sortedWallets = fetchedWallets.sort((a, b) => {
        const timeA = walletLastUsed.get(a.id) || 0;
        const timeB = walletLastUsed.get(b.id) || 0;
        if (timeA !== timeB) return timeB - timeA;
        return a.name.localeCompare(b.name);
      });

      // Ταξινόμηση Goals: Πρόσφατα -> Αλφαβητικά
      const sortedGoals = fetchedGoals.sort((a, b) => {
        const timeA = goalLastUsed.get(a.id) || 0;
        const timeB = goalLastUsed.get(b.id) || 0;
        if (timeA !== timeB) return timeB - timeA;
        return a.title.localeCompare(b.title);
      });

      setWallets(sortedWallets);
      setGoals(sortedGoals);

      if (sortedWallets.length > 0) {
        setSelectedWalletId(sortedWallets[0].id);
      }
      if (sortedGoals.length > 0 && !selectedGoalId) {
        setSelectedGoalId(sortedGoals[0].id);
      }
    } catch (error) {
      console.error('Failed to load and sort wallets or goals:', error);
    }
  };

  const handleSaveTransfer = async () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Error', t('transactions.invalidAmount', 'Please enter a valid amount'));
      return;
    }

    if (!selectedWalletId || !selectedGoalId) {
      Alert.alert('Error', t('goals.missingSelection', 'Please select both a wallet and a goal'));
      return;
    }

    try {
      setLoading(true);

      const wallet = await database.get('wallets').find(selectedWalletId) as WalletModel;
      const goal = await database.get('saving_goals').find(selectedGoalId) as SavingGoalModel;

      if (transferType === 'deposit' && wallet.balance < parsedAmount) {
        Alert.alert('Error', t('transactions.insufficientFunds', 'Insufficient funds in selected wallet'));
        setLoading(false);
        return;
      }

      if (transferType === 'withdraw' && goal.currentAmount < parsedAmount) {
        Alert.alert('Error', t('goals.insufficientSavings', 'Not enough money in this saving goal'));
        setLoading(false);
        return;
      }

      await database.write(async () => {
        await wallet.update((w) => {
          if (transferType === 'deposit') {
            w.balance -= parsedAmount;
          } else {
            w.balance += parsedAmount;
          }
        });

        await goal.update((g) => {
          if (transferType === 'deposit') {
            g.currentAmount += parsedAmount;
          } else {
            g.currentAmount = Math.max(g.currentAmount - parsedAmount, 0);
          }
        });

        await database.get('saving_transfers').create((transfer: any) => {
          transfer.savingGoalId = selectedGoalId;
          transfer.amount = parsedAmount;
          transfer.type = transferType;
          transfer.date = date;
          /* 🛠️ ΔΙΟΡΘΩΣΗ: Αποθήκευση του επιλεγμένου Wallet ID στη SQLite */
          transfer.walletId = selectedWalletId; 
        });
      });

      navigation.goBack();
    } catch (error) {
      console.error('Transaction failed:', error);
      Alert.alert('Error', t('common.errorSave', 'Failed to save transaction'));
    } finally {
      setLoading(false);
    }
  };

  const cardBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#111827';

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F9FAFB', paddingTop: insets.top + 12 }]}>
      <TransferHeader 
        title={t('goals.transferTitle', 'Savings Transfer')} 
        textColor={textColor} 
        cardBg={cardBg} 
        onBack={() => navigation.goBack()} 
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <TransferTypeSelector 
          value={transferType} 
          onChange={setTransferType} 
          t={t} 
        />

        <AmountInputCard 
          cardBg={cardBg}
          textColor={textColor}
          amount={amount}
          setAmount={setAmount}
          transferType={transferType}
          currency={currency}
          t={t}
        />

        <WalletGoalSelectorCard 
          cardBg={cardBg}
          textColor={textColor}
          isDark={isDark}
          transferType={transferType}
          wallets={wallets}
          goals={goals}
          selectedWalletId={selectedWalletId}
          selectedGoalId={selectedGoalId}
          routeGoalId={routeGoalId}
          currency={currency}
          setSelectedWalletId={setSelectedWalletId}
          setSelectedGoalId={setSelectedGoalId}
          t={t}
        />

        <DatePickerRow 
          cardBg={cardBg}
          textColor={textColor}
          isDark={isDark}
          date={date}
          currentLocale={currentLocale}
          onPress={() => setShowDatePicker(true)}
        />

        <Button
          mode="contained"
          onPress={handleSaveTransfer}
          loading={loading}
          disabled={loading || !amount}
          style={[styles.submitBtn, { backgroundColor: transferType === 'deposit' ? '#10B981' : '#EF4444' }]}
          labelStyle={styles.submitBtnLabel}
        >
          {t('common.save', 'Confirm Transfer')}
        </Button>
      </ScrollView>

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
  submitBtn: { height: 54, borderRadius: 18, justifyContent: 'center', marginTop: 14, elevation: 2 },
  submitBtnLabel: { 
    fontSize: 16, 
    fontWeight: '900', 
    textTransform: 'uppercase', 
    letterSpacing: 1.6
  }
});