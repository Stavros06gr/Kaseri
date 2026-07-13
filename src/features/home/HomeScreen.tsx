import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Q } from '@nozbe/watermelondb';
import { subDays } from 'date-fns';

import { database } from '../../database';
import { useAppStore } from '../../store/useAppStore';
import { RootStackParamList } from '../../navigation/types';

import WalletModel from '../../database/models/Wallet';
import TransactionModel from '../../database/models/Transaction';
import TripModel from '../../database/models/Trip';
import SavingGoalModel from '../../database/models/SavingGoal';

import UnifiedBalanceCard from './components/UnifiedBalanceCard';
import QuickActions from './components/QuickActions';
import NavigationHub from './components/NavigationHub';
import AnalysisChart from './components/AnalysisChart';
import ActiveTripsList from './components/ActiveTripsList';
import SavingGoalsList from './components/SavingGoalsList';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();

  const { hideBalance, toggleHideBalance, currency, theme } = useAppStore();
  const isDark = theme === 'dark';

  const [totalBalance, setTotalBalance] = useState(0);
  const [income30Days, setIncome30Days] = useState(0);
  const [expense30Days, setExpense30Days] = useState(0);
  const [activeTrips, setActiveTrips] = useState<TripModel[]>([]);
  const [savingGoals, setSavingGoals] = useState<any[]>([]);

  useEffect(() => {
    if (isFocused) {
      fetchHomeData();
    }
  }, [isFocused]);

  const fetchHomeData = async () => {
    try {
      const now = new Date().getTime();
      const thirtyDaysAgo = subDays(new Date(), 30).getTime();

      // 1. Φόρτωση πορτοφολιών και φιλτράρισμα των ορατών
      const wallets = (await database.get('wallets').query().fetch()) as WalletModel[];
      const visibleWallets = wallets.filter(w => !w.isHidden);
      
      const visibleWalletIds = new Set(visibleWallets.map(w => w.id));

      const computedBalance = visibleWallets.reduce((sum, w) => sum + w.balance, 0);
      setTotalBalance(computedBalance);

      // 2. Φόρτωση συναλλαγών 30 ημερών
      const transactions = (await database.get('transactions')
        .query(Q.where('date', Q.gte(thirtyDaysAgo)))
        .fetch()) as TransactionModel[];

      let inc = 0;
      let exp = 0;

      transactions.forEach(tx => {
        if (!visibleWalletIds.has(tx.walletId)) return;

        if (tx.type === 'income') inc += tx.amount;
        if (tx.type === 'expense') exp += tx.amount;
      });
      
      setIncome30Days(inc);
      setExpense30Days(exp);

      // 3. Ενεργά Ταξίδια
      const trips = (await database.get('trips').query().fetch()) as TripModel[];
      const currentTrips = trips.filter(trip => {
        const start = new Date(trip.startDate).getTime();
        const end = new Date(trip.endDate).getTime();
        return now >= start && now <= end;
      });
      setActiveTrips(currentTrips);

      // 4. Αποταμιευτικοί Στόχοι
      const goals = (await database.get('saving_goals').query().fetch()) as SavingGoalModel[];
      
      /* 🛠️ ΔΙΟΡΘΩΣΗ: Διαβάζουμε το g.title και g.targetDate σύμφωνα με το SavingGoal Model σας */
      const mappedGoals = goals.map(g => ({
        id: g.id,
        name: g.title || 'Unnamed Goal', 
        currentAmount: g.currentAmount || 0,
        targetAmount: g.targetAmount || 0,
        targetDate: g.targetDate ? g.targetDate.getTime() : null 
      }));

      /* 🛠️ ΔΙΟΡΘΩΣΗ: Έξυπνη ταξινόμηση με τα null στο τέλος */
      const sortedGoals = mappedGoals.sort((a, b) => {
        if (!a.targetDate && !b.targetDate) return 0;
        if (!a.targetDate) return 1;
        if (!b.targetDate) return -1;
        return a.targetDate - b.targetDate;
      });
      
      setSavingGoals(sortedGoals);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F9FAFB' }]} 
      contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16 }]}
      showsVerticalScrollIndicator={false}
    >
      <UnifiedBalanceCard
        totalBalance={totalBalance}
        income30Days={income30Days}
        expense30Days={expense30Days}
        hideBalance={hideBalance}
        onToggleHide={toggleHideBalance}
        currency={currency}
        isDark={isDark}
        t={t}
      />

      <QuickActions
        onIncome={() => navigation.navigate('Income')}
        onExpense={() => navigation.navigate('Expense')}
        onTransfer={() => navigation.navigate('Transfer')}
        isDark={isDark}
        t={t}
      />

      <NavigationHub
        onWallets={() => navigation.navigate('Wallets')}
        onGoals={() => navigation.navigate('SavingGoals')}
        onTrips={() => navigation.navigate('MainTabs', { screen: 'MoreModes' })}
        isDark={isDark}
        t={t}
      />

      <AnalysisChart
        income={income30Days}
        expense={expense30Days}
        isDark={isDark}
        incomeLabel={t('transactions.income', 'Income')}
        expenseLabel={t('transactions.expense', 'Expense')}
      />

      <ActiveTripsList
        trips={activeTrips}
        currency={currency}
        isDark={isDark}
        noBudgetLabel={t('home.noBudget', 'No Budget Set')}
        titleLabel={t('home.trips', 'Active Trips')}
      />

      <SavingGoalsList
        goals={savingGoals}
        isDark={isDark}
        titleLabel={t('home.savingGoals', 'Saving Goals')}
        onGoalPress={(id) => navigation.navigate('SavingGoalDetail', { goalId: id })}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 }
});