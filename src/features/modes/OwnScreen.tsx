import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Surface, Button, TextInput, SegmentedButtons, Portal, Dialog } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, Trash2, CheckCircle2, Circle, HelpCircle, Users } from 'lucide-react-native';

import { database } from '../../database';
import { useAppStore } from '../../store/useAppStore';
import { formatMoney } from '../../utils/math';
import DebtModel from '../../database/models/Debt';

export default function OwnScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();

  const { currency, theme, hideBalance } = useAppStore();
  const isDark = theme === 'dark';

  const cardBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#111827';
  const subTextColor = isDark ? '#9CA3AF' : '#6B7280';
  const borderColor = isDark ? '#2D2D2D' : '#E5E7EB';

  // States
  const [debts, setDebts] = useState<DebtModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'active' | 'resolved'>('active');

  // Modal/Form States
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [personName, setPersonName] = useState('');
  const [amount, setAmount] = useState('');
  const [debtType, setDebtType] = useState<'owes_me' | 'i_owe'>('owes_me');
  const [issaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isFocused) {
      loadDebts();
    }
  }, [isFocused]);

  const loadDebts = async () => {
    try {
      setLoading(true);
      const fetched = (await database.get('debts').query().fetch()) as DebtModel[];
      setDebts(fetched);
    } catch (error) {
      console.error('Failed to load debts:', error);
    } finally {
      setLoading(false);
    }
  };

  // 1. Υπολογισμός Συνόλων (Summing only active/unresolved debts)
  const activeDebts = debts.filter(d => !d.isResolved);
  
  const totalOwesMe = activeDebts
    .filter(d => d.type === 'owes_me')
    .reduce((sum, d) => sum + (d.amount || 0), 0);

  const totalIOwe = activeDebts
    .filter(d => d.type === 'i_owe')
    .reduce((sum, d) => sum + (d.amount || 0), 0);

  const netBalance = totalOwesMe - totalIOwe;

  // Formatting with Hide Balance Logic
  const displayOwesMe = hideBalance ? '****' : `${formatMoney(totalOwesMe)} ${currency}`;
  const displayIOwe = hideBalance ? '****' : `${formatMoney(totalIOwe)} ${currency}`;
  const displayNet = hideBalance ? '****' : `${formatMoney(Math.abs(netBalance))} ${currency}`;

  // 2. Δημιουργία Νέου Χρέους
  const handleCreateDebt = async () => {
    const parsedAmount = parseFloat(amount);
    if (!personName.trim()) {
      Alert.alert('Error', t('own.nameRequired', 'Please enter a name'));
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Error', t('transactions.invalidAmount', 'Please enter a valid amount'));
      return;
    }

    try {
      setIsSaving(true);
      await database.write(async () => {
        await database.get('debts').create((debt: any) => {
          debt.personName = personName.trim();
          debt.amount = parsedAmount;
          debt.type = debtType;
          debt.isResolved = false;
        });
      });

      // Reset Form & Close
      setPersonName('');
      setAmount('');
      setDebtType('owes_me');
      setIsModalVisible(false);
      loadDebts();
    } catch (error) {
      console.error('Failed to save debt:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // 3. Εναλλαγή Κατάστασης (Resolve/Unresolve)
  const handleToggleResolve = async (debt: DebtModel) => {
    try {
      await database.write(async () => {
        await debt.update((d: any) => {
          d.isResolved = !d.isResolved;
        });
      });
      loadDebts();
    } catch (error) {
      console.error('Failed to update debt status:', error);
    }
  };

  // 4. Οριστική Διαγραφή
  const handleDeleteDebt = async (debt: DebtModel) => {
    Alert.alert(
      t('own.deleteTitle', 'Delete Record'),
      t('own.deleteConfirm', 'Are you sure you want to delete this debt entry?'),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: 'OK',
          style: 'destructive',
          onPress: async () => {
            try {
              await database.write(async () => {
                await debt.destroyPermanently();
              });
              loadDebts();
            } catch (error) {
              console.error('Failed to delete debt:', error);
            }
          }
        }
      ]
    );
  };

  // Φιλτράρισμα λίστας για προβολή
  const displayedDebts = debts.filter(d => 
    filterType === 'resolved' ? d.isResolved : !d.isResolved
  );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F9FAFB', paddingTop: insets.top + 12 }]}>
      
      {/* HEADER */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: cardBg }]}>
          <ArrowLeft size={20} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: textColor }]}>
          {t('modes.ownTitle', 'Owes & Debts')}
        </Text>
        <TouchableOpacity onPress={() => setIsModalVisible(true)} style={[styles.backBtn, { backgroundColor: cardBg }]}>
          <Plus size={20} color={textColor} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* SUMMARY CARDS GRID */}
        <View style={styles.summaryGrid}>
          {/* Μου Χρωστάνε */}
          <Surface style={[styles.summaryCard, { backgroundColor: cardBg }]} mode="flat">
            <Text style={[styles.summaryLabel, { color: subTextColor }]}>{t('own.owesMe', 'Owed to Me')}</Text>
            <Text style={[styles.summaryValue, { color: '#10B981' }]}>{displayOwesMe}</Text>
          </Surface>

          {/* Χρωστάω */}
          <Surface style={[styles.summaryCard, { backgroundColor: cardBg }]} mode="flat">
            <Text style={[styles.summaryLabel, { color: subTextColor }]}>{t('own.iOwe', 'I Owe')}</Text>
            <Text style={[styles.summaryValue, { color: '#EF4444' }]}>{displayIOwe}</Text>
          </Surface>
        </View>

        {/* NET BALANCE HERO CARD */}
        <Surface style={[styles.netCard, { backgroundColor: cardBg }]} mode="flat">
          <Text style={[styles.netLabel, { color: subTextColor }]}>
            {netBalance >= 0 ? t('own.netReceivable', 'Net Receivable') : t('own.netPayable', 'Net Payable')}
          </Text>
          <Text style={[styles.netValue, { color: netBalance >= 0 ? '#10B981' : '#EF4444' }]}>
            {displayNet}
          </Text>
        </Surface>

        {/* FILTER TABS */}
        <SegmentedButtons
          value={filterType}
          onValueChange={val => setFilterType(val as any)}
          style={styles.segmented}
          buttons={[
            { value: 'active', label: t('own.activeTab', 'Active') },
            { value: 'resolved', label: t('own.resolvedTab', 'Resolved') },
          ]}
        />

        {/* LIST OF DEBTS */}
        {displayedDebts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Users size={44} color={isDark ? '#374151' : '#D1D5DB'} style={{ marginBottom: 12 }} />
            <Text style={[styles.emptyText, { color: subTextColor }]}>
              {filterType === 'active' 
                ? t('own.noActive', 'All clear! No pending debts.') 
                : t('own.noResolved', 'No settled debts history found.')}
            </Text>
          </View>
        ) : (
          displayedDebts.map((item) => {
            const isOwesMe = item.type === 'owes_me';
            const displayAmount = hideBalance ? '****' : `${formatMoney(item.amount)} ${currency}`;

            return (
              <Surface key={item.id} style={[styles.debtRowCard, { backgroundColor: cardBg }]} mode="flat">
                <View style={styles.debtRowLeft}>
                  <TouchableOpacity onPress={() => handleToggleResolve(item)} style={styles.checkBtn}>
                    {item.isResolved ? (
                      <CheckCircle2 size={22} color="#10B981" />
                    ) : (
                      <Circle size={22} color={subTextColor} />
                    )}
                  </TouchableOpacity>
                  
                  <View style={styles.debtMeta}>
                    <Text style={[styles.personName, { color: textColor, textDecorationLine: item.isResolved ? 'line-through' : 'none' }]}>
                      {item.personName}
                    </Text>
                    <Text style={[styles.typeLabel, { color: isOwesMe ? '#10B981' : '#EF4444' }]}>
                      {isOwesMe ? t('own.owesMe', 'Owed to Me') : t('own.iOwe', 'I Owe')}
                    </Text>
                  </View>
                </View>

                <View style={styles.debtRowRight}>
                  <Text style={[styles.debtAmount, { color: isOwesMe ? '#10B981' : '#EF4444', textDecorationLine: item.isResolved ? 'line-through' : 'none' }]}>
                    {isOwesMe ? `+${displayAmount}` : `-${displayAmount}`}
                  </Text>
                  
                  <TouchableOpacity onPress={() => handleDeleteDebt(item)} style={styles.deleteBtn} hitSlop={10}>
                    <Trash2 size={16} color={isDark ? '#4B5563' : '#9CA3AF'} />
                  </TouchableOpacity>
                </View>
              </Surface>
            );
          })
        )}

      </ScrollView>

      {/* ADD DEBT DIALOG */}
      <Portal>
        <Dialog visible={isModalVisible} onDismiss={() => setIsModalVisible(false)} style={{ backgroundColor: cardBg, borderRadius: 24 }}>
          <Dialog.Title style={{ color: textColor, fontWeight: '800' }}>
            {t('own.addDebt', 'New Debt Record')}
          </Dialog.Title>
          <Dialog.Content>
            
            {/* Person Name Input */}
            <TextInput
              label={t('own.personName', "Person's Name")}
              value={personName}
              onChangeText={setPersonName}
              mode="outlined"
              style={styles.input}
              activeOutlineColor="#2563EB"
              textColor={textColor}
            />

            {/* Amount Input */}
            <TextInput
              label={`${t('own.amount', 'Amount')} (${currency})`}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
              activeOutlineColor="#2563EB"
              textColor={textColor}
            />

            {/* Segmented Selector for Type */}
            <Text style={[styles.modalLabel, { color: subTextColor }]}>{t('own.type', 'Relationship Type')}</Text>
            <SegmentedButtons
              value={debtType}
              onValueChange={val => setDebtType(val as any)}
              style={styles.modalSegmented}
              buttons={[
                { value: 'owes_me', label: t('own.owesMe', 'Owes Me') },
                { value: 'i_owe', label: t('own.iOwe', 'I Owe') },
              ]}
            />

          </Dialog.Content>
          <Dialog.Actions style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
            <Button onPress={() => setIsModalVisible(false)} textColor={subTextColor}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button 
              mode="contained" 
              onPress={handleCreateDebt} 
              loading={issaving} 
              disabled={issaving}
              buttonColor="#2563EB"
              style={{ borderRadius: 12 }}
            >
              {t('common.save', 'Save')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, height: 48, marginBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  navTitle: { fontSize: 18, fontWeight: '800', textAlign: 'center', letterSpacing: -0.3 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  
  // Summary Grid
  summaryGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  summaryCard: { flex: 1, padding: 16, borderRadius: 20, marginHorizontal: 4 },
  summaryLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 4 },
  summaryValue: { fontSize: 16, fontWeight: '800' },
  
  // Net Hero Card
  netCard: { padding: 16, borderRadius: 20, marginBottom: 20, alignItems: 'center', justifyContent: 'center' },
  netLabel: { fontSize: 12, fontWeight: '600', marginBottom: 2 },
  netValue: { fontSize: 22, fontWeight: '900' },

  segmented: { marginBottom: 16 },
  
  // Debt Row Item
  debtRowCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 18, marginBottom: 8 },
  debtRowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 },
  checkBtn: { padding: 4, marginRight: 10 },
  debtMeta: { flex: 1 },
  personName: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  typeLabel: { fontSize: 11, fontWeight: '600' },
  debtRowRight: { flexDirection: 'row', alignItems: 'center' },
  debtAmount: { fontSize: 14, fontWeight: '800', marginRight: 12, textAlign: 'right' },
  deleteBtn: { padding: 6 },

  // Empty State
  emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 40 },
  emptyText: { fontSize: 13, fontWeight: '500', textAlign: 'center', paddingHorizontal: 20 },

  // Modal styling
  input: { marginBottom: 14, backgroundColor: 'transparent' },
  modalLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 6, marginBottom: 10 },
  modalSegmented: { marginBottom: 6 }
});