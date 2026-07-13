import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { Button, Portal, Dialog, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
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
import TripModel from '../../database/models/Trip';

import EditTransactionHeader from './components/EditTransactionHeader';
import EditAmountCard from './components/EditAmountCard';
import EditDetailsCard from './components/EditDetailsCard';
/* 🛠️ Η ΝΕΑ ΚΑΘΑΡΗ ΕΙΣΑΓΩΓΗ */
import ActiveTripCheckboxes from './components/ActiveTripCheckboxes';

type EditTxRouteProp = RouteProp<RootStackParamList, 'EditTransaction'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function EditTransactionScreen() {
  const { t } = useTranslation();
  const route = useRoute<EditTxRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();

  const { transactionId } = route.params;
  const { currency, theme, language } = useAppStore();
  const isDark = theme === 'dark';
  const currentLocale = language === 'gr' ? el : enUS;

  // Record States
  const [transaction, setTransaction] = useState<TransactionModel | null>(null);
  const [walletName, setWalletName] = useState('');

  // Form States
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  
  // Trip States
  const [allTrips, setAllTrips] = useState<TripModel[]>([]);
  const [activeTrips, setActiveTrips] = useState<TripModel[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [hasInitializedTrip, setHasInitializedTrip] = useState(false);

  // UI States
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isDeleteDialogVisible, setIsDeleteDialogVisible] = useState(false);

  useEffect(() => {
    loadTransaction();
    loadTrips();
  }, [transactionId]);

  useEffect(() => {
    if (allTrips.length === 0) return;

    const txTime = date.getTime();
    const filtered = allTrips.filter((trip) => {
      if (!trip.startDate || !trip.endDate) return false;
      const start = new Date(trip.startDate).getTime();
      const end = new Date(trip.endDate).getTime();
      return txTime >= start && txTime <= end;
    });

    setActiveTrips(filtered);

    if (!hasInitializedTrip && transaction) {
      if (transaction.tripId) {
        setSelectedTripId(transaction.tripId);
      } else if (filtered.length > 0) {
        setSelectedTripId(filtered[0].id);
      }
      setHasInitializedTrip(true);
    } else {
      if (filtered.length > 0) {
        const isStillActive = filtered.some(t => t.id === selectedTripId);
        if (!isStillActive) {
          setSelectedTripId(filtered[0].id);
        }
      } else {
        setSelectedTripId('');
      }
    }
  }, [date, allTrips, transaction]);

  const loadTrips = async () => {
    try {
      const tripRecords = (await database.get('trips').query().fetch()) as TripModel[];
      setAllTrips(tripRecords);
    } catch (e) {
      console.error(e);
    }
  };

  const loadTransaction = async () => {
    try {
      const tx = (await database.get('transactions').find(transactionId)) as TransactionModel;
      setTransaction(tx);
      
      setAmount(Math.abs(tx.amount).toString());
      setCategory(tx.category || '');
      setDescription(tx.description || '');
      setDate(new Date(tx.date));

      const wallet = (await database.get('wallets').find(tx.walletId)) as WalletModel;
      setWalletName(wallet.name);
    } catch (error) {
      console.error('Failed to load transaction:', error);
      Alert.alert('Error', 'Transaction not found');
      navigation.goBack();
    }
  };

  const handleSelectTrip = (id: string) => {
    if (selectedTripId === id) {
      setSelectedTripId('');
    } else {
      setSelectedTripId(id);
    }
  };

  const handleUpdate = async () => {
    if (!transaction) return;
    const newAbs = parseFloat(amount);
    if (isNaN(newAbs) || newAbs <= 0) {
      Alert.alert('Error', t('transactions.invalidAmount', 'Please enter a valid amount'));
      return;
    }

    try {
      await database.write(async () => {
        const wallet = (await database.get('wallets').find(transaction.walletId)) as WalletModel;
        
        const oldAbs = Math.abs(transaction.amount);
        const originalTime = transaction.date.getTime();
        const newTime = date.getTime();

        if (transaction.type === 'income') {
          await wallet.update((w: any) => {
            w.balance = w.balance - oldAbs + newAbs;
          });
          await transaction.update((t: any) => {
            t.amount = newAbs;
            t.category = category.trim();
            t.description = description.trim();
            t.date = newTime;
          });
        } 
        else if (transaction.type === 'expense') {
          await wallet.update((w: any) => {
            w.balance = w.balance + oldAbs - newAbs;
          });
          await transaction.update((t: any) => {
            t.amount = newAbs;
            t.category = category.trim();
            t.description = description.trim();
            t.date = newTime;
            t.tripId = selectedTripId || null;
          });
        } 
        else if (transaction.type === 'transfer') {
          const isSender = transaction.amount < 0;

          const siblingTx = (await database.get('transactions')
            .query(
              Q.where('date', originalTime),
              Q.where('type', 'transfer'),
              Q.where('id', Q.notEq(transaction.id))
            ).fetch()) as TransactionModel[];

          await wallet.update((w: any) => {
            if (isSender) {
              w.balance = w.balance + oldAbs - newAbs;
            } else {
              w.balance = w.balance - oldAbs + newAbs;
            }
          });

          await transaction.update((t: any) => {
            t.amount = isSender ? -newAbs : newAbs;
            t.description = description.trim();
            t.date = newTime;
          });

          if (siblingTx.length > 0) {
            const sib = siblingTx[0];
            const sibWallet = (await database.get('wallets').find(sib.walletId)) as WalletModel;
            const isSibSender = sib.amount < 0;

            await sibWallet.update((w: any) => {
              if (isSibSender) {
                w.balance = w.balance + oldAbs - newAbs;
              } else {
                w.balance = w.balance - oldAbs + newAbs;
              }
            });

            await sib.update((t: any) => {
              t.amount = isSibSender ? -newAbs : newAbs;
              t.description = description.trim();
              t.date = newTime;
            });
          }
        }
      });

      navigation.goBack();
    } catch (error) {
      console.error('Failed to update transaction safely:', error);
    }
  };

  const handleDelete = async () => {
    if (!transaction) return;
    try {
      await database.write(async () => {
        const wallet = (await database.get('wallets').find(transaction.walletId)) as WalletModel;
        const oldAbs = Math.abs(transaction.amount);
        const originalTime = transaction.date.getTime();

        if (transaction.type === 'income') {
          await wallet.update((w: any) => { w.balance -= oldAbs; });
        } 
        else if (transaction.type === 'expense') {
          await wallet.update((w: any) => { w.balance += oldAbs; });
        } 
        else if (transaction.type === 'transfer') {
          const isSender = transaction.amount < 0;

          const siblingTx = (await database.get('transactions')
            .query(
              Q.where('date', originalTime),
              Q.where('type', 'transfer'),
              Q.where('id', Q.notEq(transaction.id))
            ).fetch()) as TransactionModel[];

          await wallet.update((w: any) => {
            w.balance = isSender ? w.balance + oldAbs : w.balance - oldAbs;
          });

          if (siblingTx.length > 0) {
            const sib = siblingTx[0];
            const sibWallet = (await database.get('wallets').find(sib.walletId)) as WalletModel;
            const isSibSender = sib.amount < 0;

            await sibWallet.update((w: any) => {
              w.balance = isSibSender ? w.balance + oldAbs : w.balance - oldAbs;
            });
            await sib.destroyPermanently();
          }
        }

        await transaction.destroyPermanently();
      });

      setIsDeleteDialogVisible(false);
      navigation.goBack();
    } catch (error) {
      console.error('Failed to delete transaction safely:', error);
    }
  };

  if (!transaction) return null;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F9FAFB', paddingTop: insets.top + 16 }]}>
      
      <EditTransactionHeader 
        title={t('transactions.editTitle', 'Edit Transaction')}
        cancelLabel={t('common.cancel', 'Cancel')}
        onCancel={() => navigation.goBack()}
        onDelete={() => setIsDeleteDialogVisible(true)}
        isDark={isDark}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        
        <EditAmountCard 
          amount={amount}
          setAmount={setAmount}
          currency={currency}
          label={t('transactions.amountLabel', 'Amount')}
          type={transaction.type as any}
          isDark={isDark}
        />

        <EditDetailsCard 
          walletName={walletName}
          category={category}
          setCategory={setCategory}
          description={description}
          setDescription={setDescription}
          date={date}
          type={transaction.type as any}
          onDatePress={() => setShowDatePicker(true)}
          locale={currentLocale}
          isDark={isDark}
          t={t}
        />

        {/* 🛠️ ΚΛΗΣΗ ΤΟΥ ΝΕΟΥ COMPONENT ΜΟΝΟ ΓΙΑ EXPENSE */}
        {transaction.type === 'expense' && (
          <ActiveTripCheckboxes 
            activeTrips={activeTrips}
            selectedTripId={selectedTripId}
            onSelectTrip={handleSelectTrip}
            isDark={isDark}
            t={t}
          />
        )}

        <Button 
          mode="contained" 
          onPress={handleUpdate}
          style={styles.saveButton}
          contentStyle={styles.saveButtonContent}
          buttonColor="#2563EB"
          disabled={!amount}
        >
          {t('common.saveChange', 'Save Changes')}
        </Button>

      </ScrollView>

      <Portal>
        <Dialog visible={isDeleteDialogVisible} onDismiss={() => setIsDeleteDialogVisible(false)} style={{ backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }}>
          <Dialog.Title style={{ color: isDark ? '#FFFFFF' : '#111827' }}>
            {t('transactions.deleteTxTitle', 'Delete Transaction')}
          </Dialog.Title>
          <Dialog.Content>
            <Text style={{ color: isDark ? '#9CA3AF' : '#4B5563', fontSize: 15 }}>
              {t('transactions.deleteTxConfirm', 'Are you sure you want to delete this log? Wallet balances will be adjusted automatically.')}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIsDeleteDialogVisible(false)} textColor={isDark ? '#9CA3AF' : '#6B7280'}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button onPress={handleDelete} textColor="#EF4444" labelStyle={{ fontWeight: '700' }}>
              OK
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

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
  saveButton: { borderRadius: 14, marginTop: 12 },
  saveButtonContent: { height: 50 }
});