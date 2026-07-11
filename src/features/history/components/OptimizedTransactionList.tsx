import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { FlashList } from '@shopify/flash-list';
import { Inbox } from 'lucide-react-native';
import TransactionModel from '../../../database/models/Transaction';
import TransactionItem from '../../wallets/components/TransactionItem';

interface Props {
  data: TransactionModel[];
  loading: boolean;
  hideBalance: boolean;
  currency: string;
  language: 'en' | 'gr';
  isDark: boolean;
  onItemPress: (id: string) => void;
  emptyLabel: string;
}

const AnyFlashList = FlashList as any;

// Memoize το Row Item για μέγιστη ταχύτητα
const MemoizedTransactionItem = React.memo(TransactionItem);

export default function OptimizedTransactionList({
  data, loading, hideBalance, currency, language, isDark, onItemPress, emptyLabel
}: Props) {
  
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator animating={true} color="#2563EB" size="large" />
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Inbox size={48} color={isDark ? '#374151' : '#D1D5DB'} style={{ marginBottom: 12 }} />
        <Text style={[styles.emptyText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          {emptyLabel}
        </Text>
      </View>
    );
  }

  return (
    <AnyFlashList
      data={data}
      keyExtractor={(item: TransactionModel) => item.id}
      estimatedItemSize={75}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews={false}
      drawDistance={400}
      
      /* 🛠️ Η ΓΡΑΜΜΗ ΠΟΥ ΕΛΕΙΠΕ ΚΑΙ ΕΠΕΣΤΡΕΨΕ: */
      renderItem={({ item }: { item: TransactionModel }) => (
        <MemoizedTransactionItem
          item={item}
          hideBalance={hideBalance}
          currency={currency}
          lang={language}
          isDark={isDark}
          onPress={() => onItemPress(item.id)}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyText: { fontSize: 15, fontWeight: '500', textAlign: 'center' }
});