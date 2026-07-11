import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Q } from '@nozbe/watermelondb';

import { database } from '../../database';
import { useAppStore } from '../../store/useAppStore';
import { RootStackParamList } from '../../navigation/types';

import WalletModel from '../../database/models/Wallet';
import TransactionModel from '../../database/models/Transaction';

// Εισαγωγή των νέων Components
import HistoryHeader from './components/HistoryHeader';
import HistorySearchBar from './components/HistorySearchBar';
import FilterChips from './components/FilterChips';
import OptimizedTransactionList from './components/OptimizedTransactionList';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;
type FilterType = 'all' | 'income' | 'expense' | 'transfer';

export default function HistoryScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();

  const { currency, theme, language, hideBalance } = useAppStore();
  const isDark = theme === 'dark';

  // Data & Filter States
  const [transactions, setTransactions] = useState<TransactionModel[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<TransactionModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isFocused) {
      loadAllTransactions();
    }
  }, [isFocused, activeFilter]);

  // Client-side φιλτράρισμα για την αναζήτηση (Search Queries)
  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      setFilteredTransactions(transactions);
    } else {
      const filtered = transactions.filter(tx => {
        const catMatch = tx.category?.toLowerCase().includes(query);
        const descMatch = tx.description?.toLowerCase().includes(query);
        return catMatch || descMatch;
      });
      setFilteredTransactions(filtered);
    }
  }, [searchQuery, transactions]);

  const loadAllTransactions = async () => {
    try {
      setLoading(true);

      // 1. Φιλτράρισμα: Εξαίρεση των κρυφών πορτοφολιών από το ιστορικό
      const wallets = (await database.get('wallets').query().fetch()) as WalletModel[];
      const visibleWalletIds = wallets.filter(w => !w.isHidden).map(w => w.id);

      if (visibleWalletIds.length === 0) {
        setTransactions([]);
        return;
      }

      // 2. Δημιουργία WatermelonDB Query Clauses
      const queryClauses = [
        Q.where('wallet_id', Q.oneOf(visibleWalletIds)),
        Q.sortBy('date', Q.desc)
      ];

      if (activeFilter !== 'all') {
        queryClauses.unshift(Q.where('type', activeFilter));
      }

      const allTx = (await database.get('transactions')
        .query(...queryClauses)
        .fetch()) as TransactionModel[];

      setTransactions(allTx);
    } catch (error) {
      console.error('Error fetching optimized history:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F9FAFB', paddingTop: insets.top + 16 }]}>
      
      <HistoryHeader title={t('history.title', 'Activity History')} isDark={isDark} />

      <HistorySearchBar 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        placeholder={t('history.searchPlaceholder', 'Search category or info...')}
        isDark={isDark}
      />

      <FilterChips 
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        isDark={isDark}
        t={t}
      />

      <OptimizedTransactionList 
        data={filteredTransactions}
        loading={loading}
        hideBalance={hideBalance}
        currency={currency}
        language={language}
        isDark={isDark}
        emptyLabel={t('history.emptyState', 'No transactions found')}
        onItemPress={(id) => navigation.navigate('EditTransaction', { transactionId: id })}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }
});