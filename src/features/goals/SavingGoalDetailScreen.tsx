import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, Alert } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation, useIsFocused, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { differenceInDays, differenceInMonths } from 'date-fns';
import { el, enUS } from 'date-fns/locale';

import { database } from '../../database';
import { useAppStore } from '../../store/useAppStore';
import { RootStackParamList } from '../../navigation/types';
import { formatMoney } from '../../utils/math';
import SavingGoalModel from '../../database/models/SavingGoal';
import WalletModel from '../../database/models/Wallet'; // 👈 1. Εισαγωγή του Wallet Model

// Components Imports
import GoalDetailHeader from './components/GoalDetailHeader';
import GoalProgressCard from './components/GoalProgressCard';
import GoalAnalyticsGrid from './components/GoalAnalyticsGrid';
import GoalActionButtons from './components/GoalActionButtons';
import ContributionHistoryItem from './components/ContributionHistoryItem';

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
  const [wallets, setWallets] = useState<WalletModel[]>([]); // 👈 2. State για τα πορτοφόλια

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

      const fetchedTransfers = await (targetGoal as any).savingTransfers.fetch();
      const sortedTransfers = fetchedTransfers.sort((a: any, b: any) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA;
      });
      setTransfers(sortedTransfers);

      // 👈 3. Φόρτωση όλων των Πορτοφολιών για το Mapping των IDs σε Ονόματα
      const walletRecords = (await database.get('wallets').query().fetch()) as WalletModel[];
      setWallets(walletRecords);
    } catch (error) {
      console.error('Error fetching goal details:', error);
      Alert.alert('Error', t('goals.notFound', 'Goal not found'));
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAmount = (type: 'deposit' | 'withdraw') => {
    navigation.navigate('SavingTransfer', { goalId: goalId, type: type });
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
      <GoalDetailHeader 
        title={goal.title} 
        isDark={isDark} 
        onBack={() => navigation.goBack()} 
      />

      <FlatList
        data={transfers}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        ListHeaderComponent={
          <View>
            <GoalProgressCard 
              cardBg={cardBg}
              isDark={isDark}
              isAchieved={isAchieved}
              isExpired={isExpired}
              hasDate={hasDate}
              targetDate={goal.targetDate ?? null}
              currentLocale={currentLocale}
              percentage={percentage}
              currentAmount={goal.currentAmount}
              targetAmount={goal.targetAmount}
              progress={progress}
              currency={currency}
              subTextColor={subTextColor}
              t={t}
            />

            <GoalAnalyticsGrid 
              cardBg={cardBg}
              subTextColor={subTextColor}
              isDark={isDark}
              remaining={remaining}
              currency={currency}
              paceText={paceText}
              t={t}
            />

            <GoalActionButtons 
              onAction={handleUpdateAmount} 
              t={t} 
            />

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
          // 👈 4. Εύρεση του συνδεδεμένου Wallet για τη συγκεκριμένη μεταφορά
          const targetWalletId = 
            item.walletId || 
            item._raw?.wallet_id || 
            item._raw?.walletId || 
            (item as any).wallet_id;

          const connectedWallet = wallets.find(w => w.id === targetWalletId);

          return (
            <ContributionHistoryItem 
              item={item}
              cardBg={cardBg}
              isDark={isDark}
              subTextColor={subTextColor}
              currentLocale={currentLocale}
              currency={currency}
              t={t}
              walletName={connectedWallet?.name} // 👈 5. Περνάμε το όνομα του Wallet ως prop
            />
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  historyTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12, paddingHorizontal: 4 },
  emptyHistoryContainer: { padding: 30, alignItems: 'center' },
  emptyHistoryText: { fontSize: 13, fontWeight: '500', textAlign: 'center' }
});