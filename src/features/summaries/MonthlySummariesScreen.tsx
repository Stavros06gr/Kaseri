import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation, useIsFocused } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Q } from '@nozbe/watermelondb';
import { format } from 'date-fns';
import { el, enUS } from 'date-fns/locale';

import { database } from '../../database';
import { useAppStore } from '../../store/useAppStore';
import { RootStackParamList } from '../../navigation/types';
import WalletModel from '../../database/models/Wallet';
import TransactionModel from '../../database/models/Transaction';

// Εισαγωγή των Modular Components
import MonthlyHeader from './components/MonthlyHeader';
import MonthlyTransactionList from './components/MonthlyTransactionList';

type MonthlySummariesRouteProp = RouteProp<RootStackParamList, 'MonthlySummaries'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type FilterType = 'all' | 'income' | 'expense' | 'transfer';

export default function MonthlySummariesScreen() {
  const { t } = useTranslation();
  const route = useRoute<MonthlySummariesRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();

  const { year, monthIndex } = route.params;
  const { currency, theme, language, hideBalance } = useAppStore();
  const isDark = theme === 'dark';
  const currentLocale = language === 'gr' ? el : enUS;

  // UI & Filter States
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  
  // Data States
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpense, setMonthlyExpense] = useState(0);
  const [allTransactions, setAllTransactions] = useState<TransactionModel[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<TransactionModel[]>([]);

  // Τίτλος (π.χ. "July 2026")
  const dateObj = new Date(year, monthIndex, 1);
  const headerTitle = `${format(dateObj, 'MMMM yyyy', { locale: currentLocale })}`;

  useEffect(() => {
    if (isFocused) {
      loadMonthlyData();
    }
  }, [isFocused, year, monthIndex]);

  // Ακαριαίο φιλτράρισμα στην πλευρά του client
  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredTransactions(allTransactions);
    } else {
      setFilteredTransactions(allTransactions.filter(tx => tx.type === activeFilter));
    }
  }, [activeFilter, allTransactions]);

  const loadMonthlyData = async () => {
    try {
      setLoading(true);

      // 1. Εξαίρεση κρυφών πορτοφολιών
      const wallets = (await database.get('wallets').query().fetch()) as WalletModel[];
      const visibleWalletIds = wallets.filter(w => !w.isHidden).map(w => w.id);

      if (visibleWalletIds.length === 0) {
        resetMetrics();
        return;
      }

      // 2. Όρια μήνα σε Timestamps
      const startOfMonth = new Date(year, monthIndex, 1, 0, 0, 0, 0).getTime();
      const endOfMonth = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999).getTime();

      // 3. Query στην WatermelonDB
      const txs = (await database.get('transactions')
        .query(
          Q.where('wallet_id', Q.oneOf(visibleWalletIds)),
          Q.where('date', Q.between(startOfMonth, endOfMonth)),
          Q.sortBy('date', Q.desc)
        ).fetch()) as TransactionModel[];

      // 4. Υπολογισμός Metrics
      let totalIncome = 0;
      let totalExpense = 0;

      txs.forEach((tx) => {
        if (tx.type === 'income') totalIncome += tx.amount;
        if (tx.type === 'expense') totalExpense += tx.amount;
      });

      setMonthlyIncome(totalIncome);
      setMonthlyExpense(totalExpense);
      setAllTransactions(txs);
      setFilteredTransactions(txs);
    } catch (error) {
      console.error('Failed to load monthly activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetMetrics = () => {
    setMonthlyIncome(0);
    setMonthlyExpense(0);
    setAllTransactions([]);
    setFilteredTransactions([]);
    setLoading(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F9FAFB', paddingTop: insets.top + 16 }]}>
      
      <MonthlyHeader 
        title={headerTitle} 
        onBack={() => navigation.goBack()} 
        isDark={isDark} 
      />

      <MonthlyTransactionList 
        data={filteredTransactions}
        loading={loading}
        monthlyIncome={monthlyIncome}
        monthlyExpense={monthlyExpense}
        currency={currency}
        hideBalance={hideBalance}
        language={language}
        isDark={isDark}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        onItemPress={(id) => navigation.navigate('EditTransaction', { transactionId: id })}
        t={t}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }
});