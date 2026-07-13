import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, Alert, TouchableOpacity } from 'react-native';
import { Text, ActivityIndicator, Surface, ProgressBar, Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation, useIsFocused, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Calendar, ArrowUpRight, ArrowDownLeft, Trophy, ShieldAlert, TrendingUp, PlusCircle, MinusCircle } from 'lucide-react-native';
import { format, differenceInDays, differenceInMonths } from 'date-fns';
import { el, enUS } from 'date-fns/locale';

import { database } from '../../database';
import { useAppStore } from '../../store/useAppStore';
import { RootStackParamList } from '../../navigation/types';
import { formatMoney } from '../../utils/math';
import SavingGoalModel from '../../database/models/SavingGoal';

type DetailScreenRouteProp = RouteProp<RootStackParamList, 'SavingGoalDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SavingGoalDetailScreen() {
  const { t } = useTranslation();
  const route = useRoute<DetailScreenRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();

  const { goalId } = route.params;
  const { currency, theme, language } = useAppStore();
  const isDark = theme === 'dark';
  const currentLocale = language === 'gr' ? el : enUS;

  const [loading, setLoading] = useState(true);
  const [goal, setGoal] = useState<SavingGoalModel | null>(null);
  const [transfers, setTransfers] = useState<any[]>([]);

  useEffect(() => {
    if (isFocused) {
      fetchGoalDetails();
    }
  }, [isFocused, goalId]);

  const fetchGoalDetails = async () => {
    try {
      setLoading(true);
      const targetGoal = (await database.get('saving_goals').find(goalId)) as SavingGoalModel;
      setGoal(targetGoal);

      // 🛠️ ΔΙΟΡΘΩΣΗ: (as any) για να αποφύγουμε το TS error αν το μοντέλο δεν είναι πλήρως typed
      const fetchedTransfers = await (targetGoal as any).savingTransfers.fetch();
      const sortedTransfers = fetchedTransfers.sort((a: any, b: any) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA;
      });
      setTransfers(sortedTransfers);
    } catch (error) {
      console.error('Error fetching goal details:', error);
      Alert.alert('Error', t('goals.notFound', 'Goal not found'));
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAmount = async (type: 'deposit' | 'withdraw') => {
    if (!goal) return;
    Alert.prompt(
      type === 'deposit' ? t('goals.addFunds', 'Add Funds') : t('goals.withdrawFunds', 'Withdraw Funds'),
      t('goals.enterAmount', 'Enter the amount:'),
      async (val) => {
        const amt = parseFloat(val);
        if (isNaN(amt) || amt <= 0) return;

        try {
          await database.write(async () => {
            await goal.update((g: any) => {
              if (type === 'deposit') {
                g.currentAmount += amt;
              } else {
                g.currentAmount = Math.max(g.currentAmount - amt, 0);
              }
            });

            await database.get('saving_transfers').create((transfer: any) => {
              transfer.savingGoalId = goalId;
              transfer.amount = amt;
              transfer.type = type;
              transfer.date = new Date();
            });
          });
          fetchGoalDetails();
        } catch (error) {
          console.error('Failed to execute goal transaction:', error);
        }
      },
      'plain-text',
      '',
      'numeric'
    );
  };

  if (loading || !goal) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: isDark ? '#121212' : '#F9FAFB' }]}>
        <ActivityIndicator animating={true} color="#2563EB" size="large" />
      </View>
    );
  }

  const percentage = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
  const progress = Math.min(Math.max(percentage / 100, 0), 1);
  const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);

  // 🛠️ ΔΙΟΡΘΩΣΗ: Optional chaining και nullish coalescing για αποφυγή undefined errors
  const hasDate = !!goal.targetDate;
  const isAchieved = percentage >= 100;
  const isExpired = hasDate && !isAchieved && new Date().getTime() > (goal.targetDate?.getTime() ?? 0);

  let paceText = null;
  if (hasDate && goal.targetDate && remaining > 0 && !isExpired) {
    const daysLeft = differenceInDays(goal.targetDate, new Date());
    const monthsLeft = differenceInMonths(goal.targetDate, new Date());
    
    if (monthsLeft >= 1) {
      const monthlyPace = remaining / monthsLeft;
      paceText = `${formatMoney(monthlyPace)} ${currency} / ${t('goals.month', 'month')}`;
    } else if (daysLeft > 0) {
      const dailyPace = remaining / daysLeft;
      paceText = `${formatMoney(dailyPace)} ${currency} / ${t('goals.day', 'day')}`;
    }
  }

  const subTextColor = isDark ? '#9CA3AF' : '#6B7280';
  const cardBg = isDark ? '#1E1E1E' : '#FFFFFF';

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F9FAFB', paddingTop: insets.top + 12 }]}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }]}>
          <ArrowLeft size={20} color={isDark ? '#FFFFFF' : '#111827'} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: isDark ? '#FFFFFF' : '#111827' }]} numberOfLines={1}>
          {goal.title}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={transfers}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        ListHeaderComponent={
          <View>
            <Surface style={[styles.mainCard, { backgroundColor: cardBg }]} mode="flat">
              <View style={styles.statusBadgeRow}>
                {isAchieved ? (
                  <View style={[styles.badge, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                    <Trophy size={14} color="#10B981" style={{ marginRight: 4 }} />
                    <Text style={styles.achievedText}>{t('goals.achieved', 'Completed!')}</Text>
                  </View>
                ) : isExpired ? (
                  <View style={[styles.badge, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                    <ShieldAlert size={14} color="#EF4444" style={{ marginRight: 4 }} />
                    <Text style={styles.expiredText}>{t('goals.expired', 'Overdue!')}</Text>
                  </View>
                ) : (
                  <View style={[styles.badge, { backgroundColor: 'rgba(37, 99, 235, 0.1)' }]}>
                    <Calendar size={14} color="#2563EB" style={{ marginRight: 4 }} />
                    <Text style={[styles.progressBadgeText, { color: '#2563EB' }]}>
                      {hasDate && goal.targetDate ? format(goal.targetDate, 'dd MMM yyyy', { locale: currentLocale }) : t('goals.noDeadline', 'No Deadline')}
                    </Text>
                  </View>
                )}
                <Text style={[styles.percentageLabel, { color: isAchieved ? '#10B981' : '#2563EB' }]}>
                  {percentage.toFixed(0)}%
                </Text>
              </View>

              <View style={styles.balanceContainer}>
                <Text style={[styles.currentAmount, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  {formatMoney(goal.currentAmount)} {currency}
                </Text>
                <Text style={[styles.targetAmount, { color: subTextColor }]}>
                  {t('goals.ofTarget', 'of')} {formatMoney(goal.targetAmount)} {currency}
                </Text>
              </View>

              <ProgressBar 
                progress={progress} 
                color={isAchieved ? '#10B981' : isExpired ? '#EF4444' : '#2563EB'} 
                style={styles.progressBar} 
              />
            </Surface>

            <View style={styles.statsGrid}>
              <Surface style={[styles.miniCard, { backgroundColor: cardBg }]} mode="flat">
                <Text style={[styles.miniCardLabel, { color: subTextColor }]}>{t('goals.missing', 'Remaining')}</Text>
                <Text style={[styles.miniCardValue, { color: remaining === 0 ? '#10B981' : (isDark ? '#FFFFFF' : '#111827') }]}>
                  {formatMoney(remaining)} {currency}
                </Text>
              </Surface>

              {paceText && (
                <Surface style={[styles.miniCard, { backgroundColor: cardBg }]} mode="flat">
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <TrendingUp size={14} color="#10B981" style={{ marginRight: 4 }} />
                    <Text style={[styles.miniCardLabel, { color: subTextColor }]}>{t('goals.suggestedPace', 'Target Pace')}</Text>
                  </View>
                  <Text style={[styles.miniCardValue, { color: '#10B981', fontSize: 14 }]} numberOfLines={1}>
                    {paceText}
                  </Text>
                </Surface>
              )}
            </View>

            <View style={styles.actionButtonsRow}>
              <Button 
                mode="contained-tonal" /* 🛠️ ΔΙΟΡΘΩΣΗ: contained-tonal */
                onPress={() => handleUpdateAmount('withdraw')} 
                style={[styles.actionBtn, { flex: 1, marginRight: 8 }]}
                buttonColor="rgba(239, 68, 68, 0.1)"
                textColor="#EF4444"
                icon={() => <MinusCircle size={18} color="#EF4444" />}
              >
                {t('goals.withdraw', 'Withdraw')}
              </Button>
              <Button 
                mode="contained" 
                onPress={() => handleUpdateAmount('deposit')} 
                style={[styles.actionBtn, { flex: 1, marginLeft: 8 }]}
                buttonColor="#10B981"
                textColor="#FFFFFF"
                icon={() => <PlusCircle size={18} color="#FFFFFF" />}
              >
                {t('goals.deposit', 'Add Funds')}
              </Button>
            </View>

            <Text style={[styles.historyTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
              {t('goals.historyTitle', 'Contribution History')}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyHistoryContainer}>
            <Text style={[styles.emptyHistoryText, { color: subTextColor }]}>
              {t('goals.emptyHistory', 'No transactions recorded for this goal yet.')}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const isDeposit = item.type === 'deposit';
          return (
            <Surface style={[styles.historyRow, { backgroundColor: cardBg }]} mode="flat">
              <View style={styles.historyLeft}>
                <View style={[styles.iconWrapper, { backgroundColor: isDeposit ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }]}>
                  {isDeposit ? <ArrowUpRight size={16} color="#10B981" /> : <ArrowDownLeft size={16} color="#EF4444" />}
                </View>
                <View>
                  <Text style={[styles.historyType, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                    {isDeposit ? t('goals.deposit', 'Deposit') : t('goals.withdraw', 'Withdrawal')}
                  </Text>
                  <Text style={[styles.historyDate, { color: subTextColor }]}>
                    {item.date ? format(new Date(item.date), 'dd MMM yyyy, HH:mm', { locale: currentLocale }) : ''}
                  </Text>
                </View>
              </View>
              <Text style={[styles.historyAmount, { color: isDeposit ? '#10B981' : '#EF4444' }]}>
                {isDeposit ? '+' : '-'} {formatMoney(item.amount)} {currency}
              </Text>
            </Surface>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  navBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, height: 48, marginBottom: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  navTitle: { fontSize: 18, fontWeight: '700', flex: 1, textAlign: 'center', marginHorizontal: 12 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  mainCard: { padding: 20, borderRadius: 24, marginBottom: 14 },
  statusBadgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  progressBadgeText: { fontSize: 12, fontWeight: '600' },
  achievedText: { fontSize: 12, color: '#10B981', fontWeight: '700' },
  expiredText: { fontSize: 12, color: '#EF4444', fontWeight: '700' },
  percentageLabel: { fontSize: 22, fontWeight: '800' },
  balanceContainer: { marginBottom: 14 },
  currentAmount: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  targetAmount: { fontSize: 13, fontWeight: '500', marginTop: 2 },
  progressBar: { height: 10, borderRadius: 5, backgroundColor: 'rgba(0,0,0,0.03)' },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  miniCard: { flex: 1, padding: 14, borderRadius: 16, marginHorizontal: 4, minHeight: 68, justifyContent: 'center' },
  miniCardLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.2 },
  miniCardValue: { fontSize: 16, fontWeight: '700', marginTop: 4 },
  actionButtonsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 26 },
  actionBtn: { borderRadius: 14, height: 48, justifyContent: 'center' },
  historyTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12, paddingHorizontal: 4 },
  emptyHistoryContainer: { padding: 30, alignItems: 'center' },
  emptyHistoryText: { fontSize: 13, fontWeight: '500', textAlign: 'center' },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 16, marginBottom: 8 },
  historyLeft: { flexDirection: 'row', alignItems: 'center' },
  iconWrapper: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  historyType: { fontSize: 14, fontWeight: '600' },
  historyDate: { fontSize: 11, marginTop: 2 },
  historyAmount: { fontSize: 15, fontWeight: '700' }
});