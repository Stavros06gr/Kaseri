import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Surface, TextInput, Button, Portal, Dialog, Divider } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, differenceInDays } from 'date-fns';
import { el, enUS } from 'date-fns/locale';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Pencil, // 🛠️ Προσθήκη Icon για Edit
  Calendar, 
  CreditCard, 
  Wallet, 
  Bell, 
  TrendingUp 
} from 'lucide-react-native';

import { database } from '../../database';
import { useAppStore } from '../../store/useAppStore';
import { formatMoney } from '../../utils/math';
import WalletModel from '../../database/models/Wallet';
import SubscriptionModel from '../../database/models/Subscription';

export default function SubscriptionManagerScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();

  const { currency, theme, language, hideBalance } = useAppStore();
  const isDark = theme === 'dark';
  const currentLocale = language === 'gr' ? el : enUS;

  const cardBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#111827';
  const subTextColor = isDark ? '#9CA3AF' : '#6B7280';
  const borderColor = isDark ? '#2D2D2D' : '#F3F4F6';

  // Core States
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [wallets, setWallets] = useState<WalletModel[]>([]);
  const [loading, setLoading] = useState(true);

  // Form States (Κοινά για Create & Edit)
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSub, setEditingSub] = useState<any>(null); // 🛠️ State για να ξέρουμε αν κάνουμε edit
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [billingCycle, setBillingCycle] = useState('30');
  const [nextBillingDate, setNextBillingDate] = useState(new Date());
  const [selectedWalletId, setSelectedWalletId] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // UI DatePicker State
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (isFocused) {
      loadData();
    }
  }, [isFocused]);

  const loadData = async () => {
    try {
      setLoading(true);
      const subs = await database.get('subscriptions').query().fetch();
      setSubscriptions(subs);

      const walletRecords = (await database.get('wallets').query().fetch()) as WalletModel[];
      setWallets(walletRecords);
      if (walletRecords.length > 0 && !selectedWalletId) {
        setSelectedWalletId(walletRecords[0].id);
      }
    } catch (error) {
      console.error('Failed to load subscriptions data:', error);
    } finally {
      setLoading(false);
    }
  };

  // ⚡ Υπολογισμός Μηνιαίου Κόστους (χωρίς καμία αφαίρεση από wallets)
  const totalMonthlyCost = subscriptions.reduce((sum, sub) => {
    const cost = sub.price || 0;
    const cycle = sub.billingCycle || (sub as any).billing_cycle || 30;
    const monthlyEquivalent = cost * (30 / cycle);
    return sum + monthlyEquivalent;
  }, 0);

  const displayMonthlyCost = hideBalance ? '****' : `${formatMoney(totalMonthlyCost)} ${currency}`;

  // 🛠️ Άνοιγμα Form για Δημιουργία
  const handleOpenCreate = () => {
    setEditingSub(null);
    setName('');
    setPrice('');
    setBillingCycle('30');
    setNextBillingDate(new Date());
    if (wallets.length > 0) setSelectedWalletId(wallets[0].id);
    setIsModalVisible(true);
  };

  // 🛠️ Άνοιγμα Form για Επεξεργασία (Edit)
  const handleOpenEdit = (sub: any) => {
    setEditingSub(sub);
    setName(sub.name || '');
    setPrice((sub.price || 0).toString());
    setBillingCycle((sub.billingCycle || (sub as any).billing_cycle || 30).toString());
    setNextBillingDate(sub.nextBillingDate ? new Date(sub.nextBillingDate) : new Date());
    setSelectedWalletId(sub.walletId || (sub as any).wallet_id || '');
    setIsModalVisible(true);
  };

  // 🛠️ Ενιαία Αποθήκευση (Create / Update)
  const handleSaveSubscription = async () => {
    const parsedPrice = parseFloat(price);
    const parsedCycle = parseInt(billingCycle);

    if (!name.trim()) {
      Alert.alert('Error', t('subs.nameRequired', 'Please enter a subscription name'));
      return;
    }
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      Alert.alert('Error', t('transactions.invalidAmount', 'Please enter a valid amount'));
      return;
    }
    if (isNaN(parsedCycle) || parsedCycle <= 0) {
      Alert.alert('Error', t('subs.invalidCycle', 'Please enter a valid number of days'));
      return;
    }
    if (!selectedWalletId) {
      Alert.alert('Error', t('transactions.selectWalletError', 'Please select a wallet'));
      return;
    }

    try {
      setIsSaving(true);
      await database.write(async () => {
        if (editingSub) {
          // 🟢 UPDATE Υπάρχουσας Συνδρομής
          const subToUpdate = await database.get('subscriptions').find(editingSub.id);
          await subToUpdate.update((sub: any) => {
            sub.name = name.trim();
            sub.price = parsedPrice;
            sub.billingCycle = parsedCycle;
            sub.nextBillingDate = nextBillingDate.getTime();
            sub.walletId = selectedWalletId;
          });
        } else {
          // 🔵 CREATE Νέας Συνδρομής
          await database.get('subscriptions').create((sub: any) => {
            sub.name = name.trim();
            sub.price = parsedPrice;
            sub.billingCycle = parsedCycle;
            sub.nextBillingDate = nextBillingDate.getTime();
            sub.walletId = selectedWalletId;
          });
        }
      });

      setIsModalVisible(false);
      loadData();
    } catch (error) {
      console.error('Failed to save subscription:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSubscription = async (sub: any) => {
    Alert.alert(
      t('subs.deleteTitle', 'Delete Subscription'),
      t('subs.deleteConfirm', 'Are you sure you want to cancel tracking this subscription?'),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: 'OK',
          style: 'destructive',
          onPress: async () => {
            try {
              await database.write(async () => {
                await sub.destroyPermanently();
              });
              loadData();
            } catch (error) {
              console.error('Failed to delete subscription:', error);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F9FAFB', paddingTop: insets.top + 12 }]}>
      
      {/* HEADER */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: cardBg }]}>
          <ArrowLeft size={20} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: textColor }]}>
          {t('modes.subTitle', 'Subscriptions')}
        </Text>
        <TouchableOpacity onPress={handleOpenCreate} style={[styles.backBtn, { backgroundColor: cardBg }]}>
          <Plus size={20} color={textColor} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* MONTHLY TOTAL HERO CARD */}
        <Surface style={[styles.heroCard, { backgroundColor: cardBg }]} mode="flat">
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(37, 99, 235, 0.08)' }]}>
            <TrendingUp size={20} color="#2563EB" />
          </View>
          <Text style={[styles.heroLabel, { color: subTextColor }]}>
            {t('subs.monthlyCost', 'Estimated Monthly Spending')}
          </Text>
          <Text style={[styles.heroValue, { color: textColor }]}>
            {displayMonthlyCost}
          </Text>
        </Surface>

        {/* LIST OF SUBSCRIPTIONS */}
        {subscriptions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <CreditCard size={44} color={isDark ? '#374151' : '#D1D5DB'} style={{ marginBottom: 12 }} />
            <Text style={[styles.emptyText, { color: subTextColor }]}>
              {t('subs.emptyState', 'No subscriptions active. Click "+" to add one!')}
            </Text>
          </View>
        ) : (
          subscriptions.map((item) => {
            const nextDate = item.nextBillingDate ? new Date(item.nextBillingDate) : new Date();
            const daysLeft = differenceInDays(nextDate, new Date());
            const displayPrice = hideBalance ? '****' : `${formatMoney(item.price)} ${currency}`;
            const cycleDays = item.billingCycle || (item as any).billing_cycle || 30;

            const connectedWallet = wallets.find(w => w.id === (item.walletId || (item as any).wallet_id));

            return (
              <Surface key={item.id} style={[styles.subCard, { backgroundColor: cardBg }]} mode="flat">
                <View style={styles.cardHeader}>
                  <View style={styles.leftMeta}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{item.name ? item.name.charAt(0).toUpperCase() : 'S'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.subName, { color: textColor }]} numberOfLines={1}>
                        {item.name}
                      </Text>
                      {connectedWallet && (
                        <View style={styles.walletTag}>
                          <Wallet size={10} color={subTextColor} style={{ marginRight: 4 }} />
                          <Text style={[styles.walletName, { color: subTextColor }]} numberOfLines={1}>
                            {connectedWallet.name}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <View style={styles.rightPriceCol}>
                    <Text style={[styles.subPrice, { color: textColor }]}>
                      {displayPrice}
                    </Text>
                    <Text style={[styles.cycleLabel, { color: subTextColor }]}>
                      {t('subs.every', 'every')} {cycleDays} {t('trips.days', 'days')}
                    </Text>
                  </View>
                </View>

                <Divider style={[styles.divider, { backgroundColor: borderColor }]} />

                <View style={styles.cardFooter}>
                  <View style={styles.alertRow}>
                    <Bell size={14} color={daysLeft <= 3 ? '#EF4444' : '#10B981'} style={{ marginRight: 6 }} />
                    <Text style={[styles.alertText, { color: daysLeft <= 3 ? '#EF4444' : subTextColor }]} numberOfLines={1}>
                      {daysLeft <= 0 
                        ? t('subs.dueToday', 'Due today / overdue') 
                        : `${t('subs.dueIn', 'Due in')} ${daysLeft} ${daysLeft === 1 ? t('trips.day', 'day') : t('trips.days', 'days')} (${format(nextDate, 'dd MMM', { locale: currentLocale })})`}
                    </Text>
                  </View>

                  {/* ACTION BUTTONS (Edit & Delete) */}
                  <View style={styles.actionButtons}>
                    <TouchableOpacity onPress={() => handleOpenEdit(item)} style={styles.actionBtn} hitSlop={10}>
                      <Pencil size={15} color={isDark ? '#60A5FA' : '#2563EB'} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity onPress={() => handleDeleteSubscription(item)} style={styles.actionBtn} hitSlop={10}>
                      <Trash2 size={15} color={isDark ? '#F87171' : '#EF4444'} />
                    </TouchableOpacity>
                  </View>
                </View>
              </Surface>
            );
          })
        )}

      </ScrollView>

      {/* ADD / EDIT SUBSCRIPTION DIALOG */}
      <Portal>
        <Dialog visible={isModalVisible} onDismiss={() => setIsModalVisible(false)} style={{ backgroundColor: cardBg, borderRadius: 24 }}>
          <Dialog.Title style={{ color: textColor, fontWeight: '800' }}>
            {editingSub ? t('subs.editSub', 'Edit Subscription') : t('subs.addNew', 'New Subscription')}
          </Dialog.Title>
          <Dialog.Content>
            
            {/* Name */}
            <TextInput
              label={t('subs.nameLabel', 'Service Name (e.g. Netflix)')}
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
              activeOutlineColor="#2563EB"
              textColor={textColor}
            />

            {/* Price & Cycle Row */}
            <View style={styles.modalRow}>
              <TextInput
                label={`${t('own.amount', 'Price')} (${currency})`}
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                mode="outlined"
                style={[styles.input, { flex: 1.2, marginRight: 8 }]}
                activeOutlineColor="#2563EB"
                textColor={textColor}
              />
              <TextInput
                label={t('subs.cycleDays', 'Cycle (Days)')}
                value={billingCycle}
                onChangeText={setBillingCycle}
                keyboardType="number-pad"
                mode="outlined"
                style={[styles.input, { flex: 1 }]}
                activeOutlineColor="#2563EB"
                textColor={textColor}
              />
            </View>

            {/* Wallet Selection Dropdown */}
            <View style={styles.dropdownContainer}>
              <Text style={[styles.fieldLabel, { color: subTextColor }]}>{t('transactions.selectWallet', 'Payment Account')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                {wallets.map(w => {
                  const isSelected = selectedWalletId === w.id;
                  return (
                    <TouchableOpacity
                      key={w.id}
                      style={[
                        styles.walletChip, 
                        { 
                          borderColor: isSelected ? '#2563EB' : borderColor, 
                          backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.08)' : 'transparent'
                        }
                      ]}
                      onPress={() => setSelectedWalletId(w.id)}
                    >
                      <Text style={[styles.chipText, { color: isSelected ? '#2563EB' : textColor }]}>{w.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Next Billing Date Trigger */}
            <TouchableOpacity 
              style={[styles.dateTrigger, { borderColor: borderColor }]} 
              onPress={() => setShowDatePicker(true)}
            >
              <Calendar size={16} color="#2563EB" style={{ marginRight: 8 }} />
              <View>
                <Text style={[styles.dateLabel, { color: subTextColor }]}>{t('subs.nextBilling', 'Next Payment Date')}</Text>
                <Text style={{ color: textColor, fontWeight: '700', fontSize: 13 }}>
                  {format(nextBillingDate, 'dd MMMM yyyy', { locale: currentLocale })}
                </Text>
              </View>
            </TouchableOpacity>

          </Dialog.Content>
          
          <Dialog.Actions style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
            <Button onPress={() => setIsModalVisible(false)} textColor={subTextColor}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button 
              mode="contained" 
              onPress={handleSaveSubscription} 
              loading={isSaving} 
              disabled={isSaving}
              buttonColor="#2563EB"
              style={{ borderRadius: 12 }}
            >
              {editingSub ? t('common.saveChanges', 'Save Changes') : t('common.save', 'Save')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* DateTimePicker */}
      {showDatePicker && (
        <DateTimePicker
          value={nextBillingDate}
          mode="date"
          display="default"
          onValueChange={(event, date) => {
            setShowDatePicker(false);
            if (date) setNextBillingDate(date);
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
  navTitle: { fontSize: 18, fontWeight: '800', textAlign: 'center', letterSpacing: -0.3 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },

  // Hero Card
  heroCard: { padding: 20, borderRadius: 24, marginBottom: 20, alignItems: 'center' },
  iconCircle: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  heroLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  heroValue: { fontSize: 24, fontWeight: '900' },

  // Subscription Card Row
  subCard: { borderRadius: 24, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(0,0,0,0.01)' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  leftMeta: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 },
  avatar: { width: 40, height: 40, borderRadius: 14, backgroundColor: 'rgba(37, 99, 235, 0.08)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontSize: 16, fontWeight: '800', color: '#2563EB' },
  subName: { fontSize: 15, fontWeight: '700', marginBottom: 2, flex: 1 },
  walletTag: { flexDirection: 'row', alignItems: 'center' },
  walletName: { fontSize: 11, fontWeight: '600', maxWidth: 100 },
  rightPriceCol: { alignItems: 'flex-end', minWidth: 80 },
  subPrice: { fontSize: 15, fontWeight: '800' },
  cycleLabel: { fontSize: 10, fontWeight: '500' },
  divider: { height: 1, marginVertical: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  alertRow: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 },
  alertText: { fontSize: 11, fontWeight: '700', flex: 1 },
  actionButtons: { flexDirection: 'row', alignItems: 'center' },
  actionBtn: { padding: 6, marginLeft: 10 },

  // Empty State
  emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 40 },
  emptyText: { fontSize: 13, fontWeight: '500', textAlign: 'center', paddingHorizontal: 20 },

  // Modal / Input elements
  input: { marginBottom: 12, backgroundColor: 'transparent' },
  modalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dropdownContainer: { marginBottom: 14 },
  fieldLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  chipScroll: { flexDirection: 'row' },
  walletChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, marginRight: 6 },
  chipText: { fontSize: 12, fontWeight: '700' },
  dateTrigger: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, padding: 10, marginTop: 4 },
  dateLabel: { fontSize: 10, fontWeight: '500', marginBottom: 1 }
});