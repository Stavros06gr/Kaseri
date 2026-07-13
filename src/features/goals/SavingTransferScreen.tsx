import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, Surface, SegmentedButtons } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Wallet, Target, Calendar, Info } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { el, enUS } from 'date-fns/locale';

import { database } from '../../database';
import { useAppStore } from '../../store/useAppStore';
import { RootStackParamList } from '../../navigation/types';
import WalletModel from '../../database/models/Wallet';
import SavingGoalModel from '../../database/models/SavingGoal';

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

  // Params Defaults
  const routeGoalId = route.params?.goalId;
  const routeType = route.params?.type || 'deposit';

  // Form States
  const [transferType, setTransferType] = useState<string>(routeType);
  const [amount, setAmount] = useState('');
  const [selectedWalletId, setSelectedWalletId] = useState('');
  const [selectedGoalId, setSelectedGoalId] = useState(routeGoalId || '');
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Data States
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
      
      setWallets(fetchedWallets);
      setGoals(fetchedGoals);

      if (fetchedWallets.length > 0) {
        setSelectedWalletId(fetchedWallets[0].id);
      }
      if (fetchedGoals.length > 0 && !selectedGoalId) {
        setSelectedGoalId(fetchedGoals[0].id);
      }
    } catch (error) {
      console.error('Failed to load wallets or goals:', error);
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

      // Έλεγχος υπολοίπου αν πρόκειται για κατάθεση στον κουμπαρά
      if (transferType === 'deposit' && wallet.balance < parsedAmount) {
        Alert.alert('Error', t('transactions.insufficientFunds', 'Insufficient funds in selected wallet'));
        setLoading(false);
        return;
      }

      // Έλεγχος αν πάει να τραβήξει περισσότερα λεφτά από όσα έχει ο κουμπαράς
      if (transferType === 'withdraw' && goal.currentAmount < parsedAmount) {
        Alert.alert('Error', t('goals.insufficientSavings', 'Not enough money in this saving goal'));
        setLoading(false);
        return;
      }

      // 🔥 ATOMIC TRANSACTION: Ταυτόχρονη ενημέρωση Πορτοφολιού, Στόχου και Ιστορικού
      await database.write(async () => {
        // 1. Ενημέρωση Πορτοφολιού
        await wallet.update((w) => {
          if (transferType === 'deposit') {
            w.balance -= parsedAmount;
          } else {
            w.balance += parsedAmount;
          }
        });

        // 2. Ενημέρωση Κουμπαρά
        await goal.update((g) => {
          if (transferType === 'deposit') {
            g.currentAmount += parsedAmount;
          } else {
            g.currentAmount = Math.max(g.currentAmount - parsedAmount, 0);
          }
        });

        // 3. Δημιουργία εγγραφής ιστορικού
        await database.get('saving_transfers').create((transfer: any) => {
          transfer.savingGoalId = selectedGoalId;
          transfer.amount = parsedAmount;
          transfer.type = transferType;
          transfer.date = date;
          transfer.notes = notes.trim();
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
      
      {/* HEADER */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: cardBg }]}>
          <ArrowLeft size={20} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: textColor }]}>
          {t('goals.transferTitle', 'Savings Transfer')}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* ΤΥΠΟΣ ΜΕΤΑΦΟΡΑΣ (DEPOSIT / WITHDRAW) */}
        <SegmentedButtons
          value={transferType}
          onValueChange={setTransferType}
          buttons={[
            { value: 'deposit', label: t('goals.deposit', 'Deposit'), checkedColor: '#FFFFFF', style: transferType === 'deposit' ? { backgroundColor: '#10B981' } : {} },
            { value: 'withdraw', label: t('goals.withdraw', 'Withdraw'), checkedColor: '#FFFFFF', style: transferType === 'withdraw' ? { backgroundColor: '#EF4444' } : {} },
          ]}
          style={styles.segmented}
        />

        {/* INPUT ΠΟΣΟΥ */}
        <Surface style={[styles.card, { backgroundColor: cardBg }]} mode="flat">
          <TextInput
            label={`${t('transactions.amountLabel', 'Amount')} (${currency})`}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            mode="outlined"
            activeOutlineColor={transferType === 'deposit' ? '#10B981' : '#EF4444'}
            style={styles.amountInput}
            textColor={textColor}
          />
        </Surface>

        {/* ΕΠΙΛΟΓΗ ΠΟΡΤΟΦΟΛΙΟΥ & ΚΟΥΜΠΑΡΑ */}
        <Surface style={[styles.card, { backgroundColor: cardBg }]} mode="flat">
          <Text style={[styles.sectionTitle, { color: isDark ? '#9CA3AF' : '#4B5563' }]}>
            {transferType === 'deposit' ? t('goals.sourceWallet', 'From Wallet') : t('goals.destWallet', 'To Wallet')}
          </Text>
          <View style={styles.selectorRow}>
            <Wallet size={20} color="#2563EB" style={{ marginRight: 12 }} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
              {wallets.map((w) => (
                <TouchableOpacity
                  key={w.id}
                  style={[styles.chip, { borderColor: selectedWalletId === w.id ? '#2563EB' : (isDark ? '#4B5563' : '#D1D5DB'), backgroundColor: selectedWalletId === w.id ? 'rgba(37, 99, 235, 0.08)' : 'transparent' }]}
                  onPress={() => setSelectedWalletId(w.id)}
                >
                  <Text style={[styles.chipText, { color: selectedWalletId === w.id ? '#2563EB' : textColor }]}>{w.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={[styles.divider, { backgroundColor: isDark ? '#2D2D2D' : '#F3F4F6' }]} />

          <Text style={[styles.sectionTitle, { color: isDark ? '#9CA3AF' : '#4B5563', marginTop: 8 }]}>
            {t('home.savingGoals', 'Saving Goal')}
          </Text>
          <View style={styles.selectorRow}>
            <Target size={20} color="#10B981" style={{ marginRight: 12 }} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
              {goals.map((g) => (
                <TouchableOpacity
                  key={g.id}
                  style={[styles.chip, { borderColor: selectedGoalId === g.id ? '#10B981' : (isDark ? '#4B5563' : '#D1D5DB'), backgroundColor: selectedGoalId === g.id ? 'rgba(16, 185, 129, 0.08)' : 'transparent' }]}
                  onPress={() => setSelectedGoalId(g.id)}
                  disabled={!!routeGoalId} // Κλειδωμένο αν ερχόμαστε από τη σελίδα λεπτομερειών
                >
                  <Text style={[styles.chipText, { color: selectedGoalId === g.id ? '#10B981' : textColor }]}>{g.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Surface>

        {/* ΗΜΕΡΟΜΗΝΙΑ & ΣΗΜΕΙΩΣΕΙΣ */}
        <Surface style={[styles.card, { backgroundColor: cardBg }]} mode="flat">
          <View style={styles.inputRow}>
            <Calendar size={20} color={isDark ? '#9CA3AF' : '#6B7280'} style={{ marginRight: 12 }} />
            <Button 
              mode="outlined" 
              onPress={() => setShowDatePicker(true)}
              style={styles.dateBtn}
              textColor={textColor}
            >
              {format(date, 'dd MMMM yyyy', { locale: currentLocale })}
            </Button>
          </View>

          <View style={[styles.inputRow, { marginTop: 16, alignItems: 'flex-start' }]}>
            <Info size={20} color={isDark ? '#9CA3AF' : '#6B7280'} style={{ marginRight: 12, marginTop: 12 }} />
            <TextInput
              label={t('transactions.notesLabel', 'Notes (Optional)')}
              value={notes}
              onChangeText={setNotes}
              mode="outlined"
              multiline
              numberOfLines={2}
              style={{ flex: 1, backgroundColor: 'transparent' }}
              activeOutlineColor="#2563EB"
              textColor={textColor}
            />
          </View>
        </Surface>

        {/* ΚΟΥΜΠΙ ΥΠΟΒΟΛΗΣ */}
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
  navBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, height: 48, marginBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  navTitle: { fontSize: 18, fontWeight: '700', flex: 1, textAlign: 'center', marginHorizontal: 12 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  segmented: { marginBottom: 16 },
  card: { padding: 16, borderRadius: 24, marginBottom: 14 },
  amountInput: { backgroundColor: 'transparent', fontSize: 18 },
  sectionTitle: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  selectorRow: { flexDirection: 'row', alignItems: 'center' },
  chipScroll: { paddingVertical: 4 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, marginRight: 8 },
  chipText: { fontSize: 13, fontWeight: '600' },
  divider: { height: 1, marginVertical: 14 },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  dateBtn: { flex: 1, borderRadius: 12, justifyContent: 'center' },
  submitBtn: { height: 50, borderRadius: 16, justifyContent: 'center', marginTop: 10 },
  submitBtnLabel: { fontSize: 15, fontWeight: '700', letterSpacing: 0.3 }
});