import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation, useIsFocused, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { Q } from '@nozbe/watermelondb';
import { subDays } from 'date-fns';

import { database } from '../../database';
import { useAppStore } from '../../store/useAppStore';
import { RootStackParamList } from '../../navigation/types';
import WalletModel from '../../database/models/Wallet';
import TransactionModel from '../../database/models/Transaction';

import WalletDetailHeader from './components/WalletDetailHeader';
import TransactionItem from './components/TransactionItem';

type WalletDetailScreenRouteProp = RouteProp<RootStackParamList, 'WalletDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'WalletDetail'>;

// Παράκαμψη του strict typing glitch της FlashList με τις κλάσεις της WatermelonDB
const AnyFlashList = FlashList as any;

export default function WalletDetailScreen() {
  const { t } = useTranslation();
  const route = useRoute<WalletDetailScreenRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();

  const { walletId } = route.params;

  const { hideBalance, toggleHideBalance, currency, theme, language } = useAppStore();
  const isDark = theme === 'dark';

  const [wallet, setWallet] = useState<WalletModel | null>(null);
  const [transactions, setTransactions] = useState<TransactionModel[]>([]);
  const [income30Days, setIncome30Days] = useState(0);
  const [expense30Days, setExpense30Days] = useState(0);

  useEffect(() => {
    if (isFocused) {
      fetchWalletData();
    }
  }, [isFocused, walletId]);

  const fetchWalletData = async () => {
    try {
      const walletRecord = (await database.get('wallets').find(walletId)) as WalletModel;
      setWallet(walletRecord);

      const txHistory = (await database.get('transactions')
        .query(Q.where('wallet_id', walletId), Q.sortBy('date', Q.desc))
        .fetch()) as TransactionModel[];
      setTransactions(txHistory);

      const thirtyDaysAgo = subDays(new Date(), 30).getTime();
      const recentTx = txHistory.filter(tx => new Date(tx.date).getTime() >= thirtyDaysAgo);

      let inc = 0;
      let exp = 0;
      recentTx.forEach(tx => {
        if (tx.type === 'income') inc += tx.amount;
        if (tx.type === 'expense') exp += tx.amount;
      });
      setIncome30Days(inc);
      setExpense30Days(exp);
    } catch (error) {
      console.error('Error fetching wallet details:', error);
      Alert.alert('Error', 'Could not load wallet data.');
    }
  };

  if (!wallet) return null;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F9FAFB', paddingTop: insets.top + 16 }]}>
      <AnyFlashList
        data={transactions}
        estimatedItemSize={75}
        contentContainerStyle={styles.listContent}
        keyExtractor={(item: any) => item.id}
        ListHeaderComponent={
          <WalletDetailHeader
            walletName={wallet.name}
            balance={wallet.balance}
            income30Days={income30Days}
            expense30Days={expense30Days}
            hideBalance={hideBalance}
            onToggleHide={toggleHideBalance}
            onEditBalance={() => Alert.alert('Edit Balance', 'Popup input placeholder')}
            currency={currency}
            isDark={isDark}
            t={t}
          />
        }
        renderItem={({ item }: any) => (
          <TransactionItem
            item={item}
            hideBalance={hideBalance}
            currency={currency}
            lang={language}
            isDark={isDark}
            onPress={() => navigation.navigate('EditTransaction', { transactionId: item.id })}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingHorizontal: 20, paddingBottom: 40 }
});