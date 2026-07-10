import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation, useIsFocused } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { Q } from '@nozbe/watermelondb';
import { subDays } from 'date-fns';
import { Portal, Dialog, TextInput, Button, Text } from 'react-native-paper';

import { database } from '../../database';
import { useAppStore } from '../../store/useAppStore';
import { RootStackParamList } from '../../navigation/types';
import WalletModel from '../../database/models/Wallet';
import TransactionModel from '../../database/models/Transaction';

import WalletDetailHeader from './components/WalletDetailHeader';
import TransactionItem from './components/TransactionItem';

type WalletDetailScreenRouteProp = RouteProp<RootStackParamList, 'WalletDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'WalletDetail'>;

const AnyFlashList = FlashList as any;

export default function WalletDetailScreen() {
  const { t } = useTranslation();
  const route = useRoute<WalletDetailScreenRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();

  const { walletId } = route.params;
  const { currency, theme, language } = useAppStore();
  const isDark = theme === 'dark';

  // Database States
  const [wallet, setWallet] = useState<WalletModel | null>(null);
  const [transactions, setTransactions] = useState<TransactionModel[]>([]);
  const [income30Days, setIncome30Days] = useState(0);
  const [expense30Days, setExpense30Days] = useState(0);

  // Popups States
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [isDeleteDialogVisible, setIsDeleteDialogVisible] = useState(false); // <- Νέο State
  const [editBalanceInput, setEditBalanceInput] = useState('');

  useEffect(() => {
    if (isFocused) {
      fetchWalletData();
    }
  }, [isFocused, walletId]);

  const fetchWalletData = async () => {
    try {
      const walletRecord = (await database.get('wallets').find(walletId)) as WalletModel;
      setWallet(walletRecord);
      setEditBalanceInput(walletRecord.balance.toString());

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
    }
  };

  const handleToggleHide = async () => {
    if (!wallet) return;
    try {
      await database.write(async () => {
        await wallet.update((w: any) => {
          w.isHidden = !w.isHidden;
        });
      });
      fetchWalletData();
    } catch (error) {
      console.error('Failed to toggle wallet visibility:', error);
    }
  };

  const handleSaveBalance = async () => {
    if (!wallet) return;
    const newBalance = parseFloat(editBalanceInput);
    if (isNaN(newBalance)) {
      Alert.alert('Error', t('wallets.invalidBalance', 'Please enter a valid number'));
      return;
    }

    try {
      await database.write(async () => {
        await wallet.update((w: any) => {
          w.balance = newBalance;
        });
      });
      setIsDialogVisible(false);
      fetchWalletData();
    } catch (error) {
      console.error('Failed to update wallet balance:', error);
    }
  };

  // ΜΟΝΙΜΗ ΔΙΑΓΡΑΦΗ ΠΟΡΤΟΦΟΛΙΟΥ
  const handleConfirmDeleteWallet = async () => {
    if (!wallet) return;
    try {
      await database.write(async () => {
        await wallet.destroyPermanently(); // Διαγραφή από τη WatermelonDB
      });
      setIsDeleteDialogVisible(false);
      navigation.goBack(); // Επιστροφή στην κεντρική λίστα
    } catch (error) {
      console.error('Failed to delete wallet:', error);
      Alert.alert('Error', 'Could not delete wallet.');
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
            isHidden={wallet.isHidden}
            onToggleHide={handleToggleHide}
            onEditBalance={() => setIsDialogVisible(true)}
            onDeleteWallet={() => setIsDeleteDialogVisible(true)} // <- Σύνδεση με το popup
            currency={currency}
            isDark={isDark}
            t={t}
          />
        }
        renderItem={({ item }: any) => (
          <TransactionItem
            item={item}
            hideBalance={wallet.isHidden}
            currency={currency}
            lang={language}
            isDark={isDark}
            onPress={() => navigation.navigate('EditTransaction', { transactionId: item.id })}
          />
        )}
      />

      {/* POP-UP WINDOW ΓΙΑ EDIT BALANCE */}
      <Portal>
        <Dialog visible={isDialogVisible} onDismiss={() => setIsDialogVisible(false)} style={{ backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }}>
          <Dialog.Title style={{ color: isDark ? '#FFFFFF' : '#111827' }}>{t('wallets.editBalanceTitle', 'Edit Balance')}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label={t('wallets.balanceLabel', 'New Balance')}
              value={editBalanceInput}
              onChangeText={setEditBalanceInput}
              keyboardType="numeric"
              mode="outlined"
              outlineColor={isDark ? '#2D2D2D' : '#E5E7EB'}
              activeOutlineColor="#2563EB"
              textColor={isDark ? '#FFFFFF' : '#111827'}
              style={{ backgroundColor: 'transparent' }}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIsDialogVisible(false)} textColor="#EF4444">{t('common.cancel', 'Cancel')}</Button>
            <Button onPress={handleSaveBalance} textColor="#2563EB">{t('common.save', 'Save')}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* POP-UP WINDOW ΓΙΑ ΕΠΙΒΕΒΑΙΩΣΗ ΔΙΑΓΡΑΦΗΣ */}
      <Portal>
        <Dialog visible={isDeleteDialogVisible} onDismiss={() => setIsDeleteDialogVisible(false)} style={{ backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }}>
          <Dialog.Title style={{ color: isDark ? '#FFFFFF' : '#111827' }}>
            {t('wallets.deleteTitle', 'Delete Wallet')}
          </Dialog.Title>
          <Dialog.Content>
            <Text style={{ color: isDark ? '#9CA3AF' : '#4B5563', fontSize: 15 }}>
              {t('wallets.deleteConfirmation', 'Are you sure you want to delete this wallet? This action cannot be undone.')}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIsDeleteDialogVisible(false)} textColor={isDark ? '#9CA3AF' : '#6B7280'}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button onPress={handleConfirmDeleteWallet} textColor="#EF4444" labelStyle={{ fontWeight: '700' }}>
              OK
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingHorizontal: 20, paddingBottom: 40 }
});