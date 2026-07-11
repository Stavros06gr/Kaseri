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

import EditTransactionHeader from './components/EditTransactionHeader';
import EditAmountCard from './components/EditAmountCard';
import EditDetailsCard from './components/EditDetailsCard';

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
  
  // UI States
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isDeleteDialogVisible, setIsDeleteDialogVisible] = useState(false);

  useEffect(() => {
    loadTransaction();
  }, [transactionId]);

  const loadTransaction = async () => {
    try {
      const tx = (await database.get('transactions').find(transactionId)) as TransactionModel;
      setTransaction(tx);
      
      // Χρησιμοποιούμε Math.abs επειδή στη βάση οι μεταφορές/έξοδα μπορεί να έχουν αρνητικό πρόσημο
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
        
        // 🔒 Κρατάμε τις αρχικές τιμές ΠΡΙΝ τις μεταβολές για να μην τις χάσουμε στα queries
        const oldAbs = Math.abs(transaction.amount);
        const originalTime = transaction.date.getTime();
        const newTime = date.getTime();

        // 🟢 ΠΕΡΙΠΤΩΣΗ: INCOME (ΕΣΟΔΟ)
        if (transaction.type === 'income') {
          await wallet.update((w: any) => {
            w.balance = w.balance - oldAbs + newAbs; // Αφαίρεση παλιάς εισροής, προσθήκη νέας
          });
          await transaction.update((t: any) => {
            t.amount = newAbs;
            t.category = category.trim();
            t.description = description.trim();
            t.date = newTime;
          });
        } 
        
        // 🔴 ΠΕΡΙΠΤΩΣΗ: EXPENSE (ΕΞΟΔΟ)
        else if (transaction.type === 'expense') {
          await wallet.update((w: any) => {
            w.balance = w.balance + oldAbs - newAbs; // Επιστροφή παλιάς εκροής, αφαίρεση νέας
          });
          await transaction.update((t: any) => {
            t.amount = newAbs; // Διατηρείται θετικό βάσει schema
            t.category = category.trim();
            t.description = description.trim();
            t.date = newTime;
          });
        } 
        
        // 🔵 ΠΕΡΙΠΤΩΣΗ: TRANSFER (ΜΕΤΑΦΟΡΑ - DOUBLE ENTRY)
        else if (transaction.type === 'transfer') {
          const isSender = transaction.amount < 0;

          // 1. Ψάχνουμε το sibling entry χρησιμοποιώντας το ORIGINAL timestamp
          const siblingTx = (await database.get('transactions')
            .query(
              Q.where('date', originalTime),
              Q.where('type', 'transfer'),
              Q.where('id', Q.notEq(transaction.id))
            ).fetch()) as TransactionModel[];

          // 2. Ενημερώνουμε το τρέχον πορτοφόλι
          await wallet.update((w: any) => {
            if (isSender) {
              w.balance = w.balance + oldAbs - newAbs; // Ήταν αποστολέας: επιστροφή, ξανααφαίρεση
            } else {
              w.balance = w.balance - oldAbs + newAbs; // Ήταν παραλήπτης: αφαίρεση, ξαναπροσθήκη
            }
          });

          // 3. Ενημερώνουμε την τρέχουσα συναλλαγή
          await transaction.update((t: any) => {
            t.amount = isSender ? -newAbs : newAbs;
            t.description = description.trim();
            t.date = newTime;
          });

          // 4. Αν βρέθηκε η δίδυμη συναλλαγή, την ενημερώνουμε στον ίδιο χρόνο
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
              t.date = newTime; // Παίρνει και αυτό τη νέα ημερομηνία συγχρονισμένα
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

        // 🟢 Διαγραφή Εσόδου -> Αφαιρούμε τα λεφτά από το πορτοφόλι
        if (transaction.type === 'income') {
          await wallet.update((w: any) => { w.balance -= oldAbs; });
        } 
        
        // 🔴 Διαγραφή Εξόδου -> Επιστρέφουμε τα λεφτά πίσω στο πορτοφόλι
        else if (transaction.type === 'expense') {
          await wallet.update((w: any) => { w.balance += oldAbs; });
        } 
        
        // 🔵 Διαγραφή Μεταφοράς -> Αντιστρέφουμε πλήρως και τα δύο πορτοφόλια
        else if (transaction.type === 'transfer') {
          const isSender = transaction.amount < 0;

          // Βρίσκουμε το sibling με το σωστό originalTime ΠΡΙΝ σβηστεί οτιδήποτε
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

        // Μόνιμη διαγραφή του αρχικού entry
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

      {/* DELETE CONFIRMATION DIALOG */}
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
  saveButton: { borderRadius: 14, marginTop: 8 },
  saveButtonContent: { height: 50 }
});