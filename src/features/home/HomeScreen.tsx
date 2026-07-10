import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { Text, ProgressBar, Surface } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BarChart } from 'react-native-gifted-charts';
import { Q } from '@nozbe/watermelondb';
import { subDays } from 'date-fns';
import { 
  Eye, EyeOff, PlusCircle, MinusCircle, ArrowLeftRight, 
  Wallet, Target, Compass, ChevronRight, TrendingUp, TrendingDown 
} from 'lucide-react-native';

import { database } from '../../database';
import { useAppStore } from '../../store/useAppStore';
import { RootStackParamList } from '../../navigation/types';
import { formatMoney } from '../../utils/math';
import WalletModel from '../../database/models/Wallet';
import TransactionModel from '../../database/models/Transaction';
import TripModel from '../../database/models/Trip';
import SavingGoalModel from '../../database/models/SavingGoal';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;
const screenWidth = Dimensions.get('window').width;

export default function HomeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets(); // Διόρθωση για το κενό στην μπάρα ειδοποιήσεων

  const { hideBalance, toggleHideBalance, currency, theme } = useAppStore();
  const isDark = theme === 'dark';

  const [totalBalance, setTotalBalance] = useState(0);
  const [income30Days, setIncome30Days] = useState(0);
  const [expense30Days, setExpense30Days] = useState(0);
  const [activeTrips, setActiveTrips] = useState<TripModel[]>([]);
  const [savingGoals, setSavingGoals] = useState<SavingGoalModel[]>([]);

  useEffect(() => {
    if (isFocused) {
      fetchHomeData();
    }
  }, [isFocused]);

  const fetchHomeData = async () => {
    try {
      const now = new Date().getTime();
      const thirtyDaysAgo = subDays(new Date(), 30).getTime();

      const wallets = (await database.get('wallets').query().fetch()) as WalletModel[];
      const computedBalance = wallets
        .filter(w => !w.isHidden)
        .reduce((sum, w) => sum + w.balance, 0);
      setTotalBalance(computedBalance);

      const transactions = (await database.get('transactions')
        .query(Q.where('date', Q.gte(thirtyDaysAgo)))
        .fetch()) as TransactionModel[];

      let inc = 0;
      let exp = 0;
      transactions.forEach(tx => {
        if (tx.type === 'income') inc += tx.amount;
        if (tx.type === 'expense') exp += tx.amount;
      });
      setIncome30Days(inc);
      setExpense30Days(exp);

      const trips = (await database.get('trips').query().fetch()) as TripModel[];
      const currentTrips = trips.filter(trip => {
        const start = new Date(trip.startDate).getTime();
        const end = new Date(trip.endDate).getTime();
        return now >= start && now <= end;
      });
      setActiveTrips(currentTrips);

      const goals = (await database.get('saving_goals').query().fetch()) as SavingGoalModel[];
      setSavingGoals(goals);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const chartData = [
    { value: income30Days, label: t('transactions.income'), frontColor: '#10B981', spacing: 20 },
    { value: expense30Days, label: t('transactions.expense'), frontColor: '#EF4444' }
  ];

  const dynamicStyles = {
    bg: { backgroundColor: isDark ? '#121212' : '#F9FAFB' },
    card: { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' },
    textMain: { color: isDark ? '#FFFFFF' : '#111827' },
    textMuted: { color: isDark ? '#9CA3AF' : '#6B7280' },
    divider: { backgroundColor: isDark ? '#2D2D2D' : '#F3F4F6' }
  };

  return (
    <ScrollView 
      style={[styles.container, dynamicStyles.bg]} 
      contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16 }]}
    >
      
      {/* UNIFIED CARD: TOTAL BALANCE & 30-DAY STATS */}
      <Surface style={[styles.unifiedBalanceCard, dynamicStyles.card]} mode="flat">
        <View style={styles.rowBetween}>
          <Text style={[styles.balanceTitle, dynamicStyles.textMuted]}>{t('home.balance')}</Text>
          <TouchableOpacity onPress={toggleHideBalance} hitSlop={15}>
            {hideBalance ? (
              <EyeOff size={20} color={dynamicStyles.textMuted.color} />
            ) : (
              <Eye size={20} color={dynamicStyles.textMuted.color} />
            )}
          </TouchableOpacity>
        </View>
        <Text style={[styles.balanceAmount, dynamicStyles.textMain]}>
          {hideBalance ? '••••••' : `${formatMoney(totalBalance)} ${currency}`}
        </Text>

        <View style={[styles.unifiedDivider, dynamicStyles.divider]} />

        <View style={styles.statsInlineRow}>
          <View style={styles.statColumn}>
            <View style={styles.statLabelRow}>
              <TrendingUp size={14} color="#10B981" style={{ marginRight: 4 }} />
              <Text style={[styles.miniCardTitle, dynamicStyles.textMuted]}>{t('transactions.income')}</Text>
            </View>
            <Text style={styles.incomeValue}>
              {hideBalance ? '•••' : `+${formatMoney(income30Days)}`}
            </Text>
          </View>
          
          <View style={[styles.verticalDivider, dynamicStyles.divider]} />

          <View style={styles.statColumn}>
            <View style={styles.statLabelRow}>
              <TrendingDown size={14} color="#EF4444" style={{ marginRight: 4 }} />
              <Text style={[styles.miniCardTitle, dynamicStyles.textMuted]}>{t('transactions.expense')}</Text>
            </View>
            <Text style={styles.expenseValue}>
              {hideBalance ? '•••' : `-${formatMoney(expense30Days)}`}
            </Text>
          </View>
        </View>
      </Surface>

      {/* QUICK TRANSACTION ACTIONS */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Income')}>
          <View style={[styles.iconWrapper, { backgroundColor: '#E6F4EA' }]}>
            <PlusCircle size={24} color="#10B981" />
          </View>
          <Text style={[styles.actionText, dynamicStyles.textMain]}>{t('transactions.income')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Expense')}>
          <View style={[styles.iconWrapper, { backgroundColor: '#FCE8E6' }]}>
            <MinusCircle size={24} color="#EF4444" />
          </View>
          <Text style={[styles.actionText, dynamicStyles.textMain]}>{t('transactions.expense')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Transfer')}>
          <View style={[styles.iconWrapper, { backgroundColor: '#E8F0FE' }]}>
            <ArrowLeftRight size={22} color="#2563EB" />
          </View>
          <Text style={[styles.actionText, dynamicStyles.textMain]}>{t('transactions.transfer')}</Text>
        </TouchableOpacity>
      </View>

      {/* NAVIGATION HUB CONTROLS */}
      <View style={styles.navigationHub}>
        {/* WALLETS - FULL WIDTH */}
        <Surface style={[styles.fullWidthHubCard, dynamicStyles.card]} mode="flat">
          <TouchableOpacity style={styles.hubClickable} onPress={() => navigation.navigate('MainTabs', { screen: 'MoreModes' })}>
            <Wallet size={20} color="#6B7280" />
            <Text style={[styles.hubText, dynamicStyles.textMain]}>{t('home.wallets')}</Text>
            <ChevronRight size={16} color="#9CA3AF" />
          </TouchableOpacity>
        </Surface>

        {/* SAVING GOALS & TRIPS - SIDE BY SIDE */}
        <View style={styles.splitHubRow}>
          <Surface style={[styles.halfHubCard, dynamicStyles.card]} mode="flat">
            <TouchableOpacity style={styles.hubClickable} onPress={() => navigation.navigate('MainTabs', { screen: 'MoreModes' })}>
              <Target size={18} color="#6B7280" />
              <Text style={[styles.hubTextSmall, dynamicStyles.textMain]} numberOfLines={1}>{t('home.savingGoals')}</Text>
              <ChevronRight size={14} color="#9CA3AF" />
            </TouchableOpacity>
          </Surface>

          <Surface style={[styles.halfHubCard, dynamicStyles.card]} mode="flat">
            <TouchableOpacity style={styles.hubClickable} onPress={() => navigation.navigate('MainTabs', { screen: 'MoreModes' })}>
              <Compass size={18} color="#6B7280" />
              <Text style={[styles.hubTextSmall, dynamicStyles.textMain]} numberOfLines={1}>{t('home.trips')}</Text>
              <ChevronRight size={14} color="#9CA3AF" />
            </TouchableOpacity>
          </Surface>
        </View>
      </View>

      {/* MODERN ANALYSIS CHART */}
      <Surface style={[styles.mainSectionCard, dynamicStyles.card]} mode="flat">
        <View style={styles.chartHeaderInline}>
          <Text style={[styles.sectionHeaderTitle, dynamicStyles.textMain]}>30-Day Analysis</Text>
          <Text style={[styles.chartRangeText, dynamicStyles.textMuted]}>Last 30 days</Text>
        </View>
        <View style={styles.chartWrapper}>
          <BarChart
            data={chartData}
            barWidth={40}
            initialSpacing={45}
            spacing={55}
            barBorderRadius={8}
            showFractionalValues={false}
            hideRules
            showYAxisIndices={false}
            yAxisThickness={0}
            xAxisThickness={0}
            hideYAxisText
            height={130}
            width={screenWidth - 80}
          />
        </View>
      </Surface>

      {/* ACTIVE TRIPS */}
      {activeTrips.length > 0 && (
        <Surface style={[styles.mainSectionCard, dynamicStyles.card]} mode="flat">
          <View style={styles.rowInline}>
            <Compass size={18} color="#6B7280" style={{ marginRight: 8 }} />
            <Text style={[styles.sectionHeaderTitle, dynamicStyles.textMain]}>{t('home.trips')}</Text>
          </View>
          {activeTrips.map(trip => {
            const hasBudget = trip.budget && trip.budget > 0;
            return (
              <View key={trip.id} style={styles.itemContainer}>
                <View style={styles.rowBetween}>
                  <Text style={[styles.itemLabel, dynamicStyles.textMain]}>{trip.destination}</Text>
                  <Text style={[styles.itemSub, dynamicStyles.textMuted]}>
                    {hasBudget ? `${trip.budget} ${currency}` : t('home.noBudget')}
                  </Text>
                </View>
                {hasBudget && <ProgressBar progress={0.4} color="#10B981" style={styles.minimalProgress} />}
              </View>
            );
          })}
        </Surface>
      )}

      {/* SAVING GOALS */}
      {savingGoals.length > 0 && (
        <Surface style={[styles.mainSectionCard, dynamicStyles.card]} mode="flat">
          <View style={styles.rowInline}>
            <Target size={18} color="#6B7280" style={{ marginRight: 8 }} />
            <Text style={[styles.sectionHeaderTitle, dynamicStyles.textMain]}>{t('home.savingGoals')}</Text>
          </View>
          {savingGoals.map(goal => {
            const progress = goal.targetAmount > 0 ? goal.currentAmount / goal.targetAmount : 0;
            const pct = Math.min(Math.round(progress * 100), 100);
            return (
              <View key={goal.id} style={styles.itemContainer}>
                <View style={styles.rowBetween}>
                  <Text style={[styles.itemLabel, dynamicStyles.textMain]}>{goal.title}</Text>
                  <Text style={[styles.itemSub, dynamicStyles.textMain]}>{pct}%</Text>
                </View>
                <ProgressBar progress={Math.min(progress, 1)} color="#2563EB" style={styles.minimalProgress} />
              </View>
            );
          })}
        </Surface>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  unifiedBalanceCard: {
    padding: 20,
    borderRadius: 24,
    marginBottom: 24,
  },
  balanceTitle: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '700',
    marginTop: 6,
    letterSpacing: -0.5,
  },
  unifiedDivider: {
    height: 1,
    marginVertical: 18,
  },
  statsInlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statColumn: {
    flex: 1,
  },
  statLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  verticalDivider: {
    width: 1,
    height: 35,
    marginHorizontal: 16,
  },
  miniCardTitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  incomeValue: {
    fontSize: 17,
    fontWeight: '700',
    color: '#10B981',
  },
  expenseValue: {
    fontSize: 17,
    fontWeight: '700',
    color: '#EF4444',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  navigationHub: {
    marginBottom: 24,
  },
  fullWidthHubCard: {
    borderRadius: 16,
    marginBottom: 10,
    width: '100%',
  },
  splitHubRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfHubCard: {
    flex: 1,
    borderRadius: 16,
    marginHorizontal: 4,
  },
  hubClickable: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  hubText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 12,
  },
  hubTextSmall: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
  },
  mainSectionCard: {
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
  },
  chartHeaderInline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  chartRangeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  chartWrapper: {
    alignItems: 'center',
    marginTop: 8,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowInline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  itemContainer: {
    marginBottom: 14,
  },
  itemLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemSub: {
    fontSize: 13,
  },
  minimalProgress: {
    height: 6,
    borderRadius: 3,
    marginTop: 8,
    backgroundColor: '#E5E7EB',
  },
});