import React from 'react';
import { StyleSheet, View, FlatList } from 'react-native'; // 🛠️ Αλλαγή σε FlatList για απόλυτη σταθερότητα στα φίλτρα
import { Text, ActivityIndicator } from 'react-native-paper';
import { Inbox } from 'lucide-react-native';

import TransactionModel from '../../../database/models/Transaction';
import TransactionItem from '../../wallets/components/TransactionItem';
import MonthlyOverviewCard from './MonthlyOverviewCard';
import MonthlyFilterChips from './MonthlyFilterChips';

type FilterType = 'all' | 'income' | 'expense' | 'transfer';

interface Props {
  data: TransactionModel[];
  loading: boolean;
  monthlyIncome: number;
  monthlyExpense: number;
  currency: string;
  hideBalance: boolean;
  language: 'en' | 'gr';
  isDark: boolean;
  activeFilter: FilterType;
  setActiveFilter: (filter: FilterType) => void;
  onItemPress: (id: string) => void;
  t: (key: string, defaultText: string) => string;
}

const MemoizedTransactionItem = React.memo(TransactionItem);

export default function MonthlyTransactionList({
  data, loading, monthlyIncome, monthlyExpense, currency, hideBalance, language, isDark, activeFilter, setActiveFilter, onItemPress, t
}: Props) {

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator animating={true} color="#2563EB" size="large" />
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(item: TransactionModel) => item.id}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      
      /* 🛠️ Το Header περνιέται απευθείας: Δεν κουνιέται το οριζόντιο scroll των Chips */
      ListHeaderComponent={
        <View style={styles.headerComponentWrapper}>
          <MonthlyOverviewCard 
            income={monthlyIncome}
            expense={monthlyExpense}
            currency={currency}
            hideBalance={hideBalance}
            isDark={isDark}
            t={t}
          />

          <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
            {t('summaries.monthlyActivity', 'Monthly Activity')}
          </Text>

          <MonthlyFilterChips 
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            isDark={isDark}
            t={t}
          />
        </View>
      }
      
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Inbox size={40} color={isDark ? '#374151' : '#D1D5DB'} style={{ marginBottom: 8 }} />
          <Text style={[styles.emptyText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            {t('history.emptyState', 'No transactions found')}
          </Text>
        </View>
      }
      
      renderItem={({ item }) => (
        <View style={styles.itemHorizontalPadding}>
          <MemoizedTransactionItem
            item={item}
            hideBalance={hideBalance}
            currency={currency}
            lang={language}
            isDark={isDark}
            onPress={() => onItemPress(item.id)}
          />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerComponentWrapper: { marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '700', paddingHorizontal: 24, marginBottom: 12 },
  listContent: { paddingBottom: 40 },
  itemHorizontalPadding: { paddingHorizontal: 20 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 20 },
  emptyText: { fontSize: 14, fontWeight: '500', textAlign: 'center' }
});