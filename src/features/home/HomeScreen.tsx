import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Dimensions } from 'react-native';
import { Card, Text, Button, IconButton, ProgressBar, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BarChart } from 'react-native-gifted-charts';
import { Q } from '@nozbe/watermelondb';
import { subDays } from 'date-fns';

import { database } from '../../database';
import { useAppStore } from '../../store/useAppStore';
import { RootStackParamList } from '../../navigation/types';
import { formatMoney } from '../../utils/math';
import Wallet from '../../database/models/Wallet';
import Transaction from '../../database/models/Transaction';
import Trip from '../../database/models/Trip';
import SavingGoal from '../../database/models/SavingGoal';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

export default function HomeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const isFocused = useIsFocused();
  const paperTheme = useTheme();

  // Zustand State
  const { hideBalance, toggleHideBalance, currency } = useAppStore();

  // Local State για τα δεδομένα της βάσης
  const [totalBalance, setTotalBalance] = useState(0);
  const [income30Days, setIncome30Days] = useState(0);
  const [expense30Days, setExpense30Days] = useState(0);
  const [activeTrips, setActiveTrips] = useState<Trip[]>([]);
  const [savingGoals, setSavingGoals] = useState<SavingGoal[]>([]);

  useEffect(() => {
    if (isFocused) {
      fetchHomeData();
    }
  }, [isFocused]);

  const fetchHomeData = async () => {
    try {
      const now = new Date().getTime();
      const thirtyDaysAgo = subDays(new Date(), 30).getTime();

      // 1. Υπολογισμός Συνολικού Υπολοίπου (μόνο από μη κρυφά πορτοφόλια)
      const walletsRecords = (await database.get('wallets').query().fetch()) as Wallet[];
      const computedBalance = walletsRecords
        .filter(w => !w.isHidden)
        .reduce((sum, w) => sum + w.balance, 0);
      setTotalBalance(computedBalance);

      // 2. Υπολογισμός Εσόδων/Εξόδων τελευταίων 30 ημερών
      const txRecords = (await database.get('transactions')
        .query(Q.where('date', Q.gte(thirtyDaysAgo)))
        .fetch()) as Transaction[];

      let inc = 0;
      let exp = 0;
      txRecords.forEach(tx => {
        if (tx.type === 'income') inc += tx.amount;
        if (tx.type === 'expense') exp += tx.amount;
      });
      setIncome30Days(inc);
      setExpense30Days(exp);

      // 3. Φόρτωση Ταξιδιών (Προστέθηκε το .query())
      const tripsRecords = (await database.get('trips').query().fetch()) as Trip[];
      const currentTrips = tripsRecords.filter(trip => {
        const start = new Date(trip.startDate).getTime();
        const end = new Date(trip.endDate).getTime();
        return now >= start && now <= end;
      });
      setActiveTrips(currentTrips);

      // 4. Φόρτωση Στόχων Αποταμίευσης (Προστέθηκε το .query())
      const goalsRecords = (await database.get('saving_goals').query().fetch()) as SavingGoal[];
      setSavingGoals(goalsRecords);
    } catch (error) {
      console.error('Σφάλμα κατά τη φόρτωση των δεδομένων του Home:', error);
    }
  };

  // Δεδομένα για το γράφημα (Incomes vs Expenses)
  const chartData = [
    { value: income30Days, label: t('transactions.income'), frontColor: '#4CAF50' },
    { value: expense30Days, label: t('transactions.expense'), frontColor: '#F44336' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      
      {/* 1. BALANCE CARD (Υπόλοιπο, Έσοδα, Έξοδα) */}
      <Card style={styles.mainCard} mode="contained">
        <Card.Content>
          <View style={styles.balanceHeader}>
            <Text variant="titleMedium" style={styles.cardLabel}>{t('home.balance')}</Text>
            <IconButton
              icon={hideBalance ? 'eye-off' : 'eye'}
              size={20}
              onPress={toggleHideBalance}
            />
          </View>
          <Text variant="headlineLarge" style={styles.balanceText}>
            {hideBalance ? '••••••' : `${formatMoney(totalBalance)} ${currency}`}
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statCol}>
              <Text variant="bodySmall" style={styles.cardLabel}>{t('home.incomes30Days')}</Text>
              <Text variant="titleMedium" style={styles.incomeText}>
                {hideBalance ? '•••' : `+${formatMoney(income30Days)}`}
              </Text>
            </View>
            <View style={styles.statCol}>
              <Text variant="bodySmall" style={styles.cardLabel}>{t('home.expenses30Days')}</Text>
              <Text variant="titleMedium" style={styles.expenseText}>
                {hideBalance ? '•••' : `-${formatMoney(expense30Days)}`}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* 2. QUICK ACTIONS (Κουμπιά για γρήγορες ενέργειες) */}
      <View style={styles.quickActions}>
        <Button mode="contained" onPress={() => navigation.navigate('Income')} style={styles.actionBtn} buttonColor="#4CAF50">
          {t('transactions.income')}
        </Button>
        <Button mode="contained" onPress={() => navigation.navigate('Expense')} style={styles.actionBtn} buttonColor="#F44336">
          {t('transactions.expense')}
        </Button>
        <Button mode="elevated" onPress={() => navigation.navigate('Transfer')} style={styles.actionBtn}>
          {t('transactions.transfer')}
        </Button>
      </View>

      {/* 3. CHART (Διάγραμμα τελευταίων 30 ημερών) */}
      <Card style={styles.sectionCard} mode="outlined">
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>{t('home.incomes30Days')} vs {t('home.expenses30Days')}</Text>
          <View style={styles.chartContainer}>
            <BarChart
              data={chartData}
              barWidth={45}
              noOfSections={3}
              barBorderRadius={4}
              frontColor="lightgray"
              yAxisThickness={0}
              xAxisThickness={1}
              height={150}
              width={Dimensions.get('window').width - 80}
            />
          </View>
        </Card.Content>
      </Card>

      {/* 4. ACTIVE TRIPS LIST (Ενεργά ταξίδια) */}
      {activeTrips.length > 0 && (
        <Card style={styles.sectionCard} mode="outlined">
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>{t('home.trips')}</Text>
            {activeTrips.map(trip => {
              // Υπολογισμός προόδου budget αν υπάρχει
              const hasBudget = trip.budget && trip.budget > 0;
              return (
                <View key={trip.id} style={styles.itemRow}>
                  <Text variant="bodyLarge">{trip.destination}</Text>
                  {hasBudget ? (
                    <View style={styles.progressContainer}>
                      <ProgressBar progress={0.5} color={paperTheme.colors.primary} />
                      <Text variant="bodySmall" style={styles.progressText}>{t('common.total')}: {trip.budget} {currency}</Text>
                    </View>
                  ) : (
                    <Text variant="bodySmall" style={styles.cardLabel}>{t('home.noBudget')}</Text>
                  )}
                </View>
              );
            })}
          </Card.Content>
        </Card>
      )}

      {/* 5. SAVING GOALS LIST (Στόχοι αποταμίευσης) */}
      {savingGoals.length > 0 && (
        <Card style={styles.sectionCard} mode="outlined">
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>{t('home.savingGoals')}</Text>
            {savingGoals.map(goal => {
              const progress = goal.targetAmount > 0 ? goal.currentAmount / goal.targetAmount : 0;
              const percentage = Math.min(Math.round(progress * 100), 100);
              return (
                <View key={goal.id} style={styles.itemRow}>
                  <View style={styles.goalHeader}>
                    <Text variant="bodyLarge">{goal.title}</Text>
                    <Text variant="bodyMedium">{percentage}%</Text>
                  </View>
                  <ProgressBar progress={Math.min(progress, 1)} color="#2196F3" style={styles.progressBar} />
                  <Text variant="bodySmall" style={styles.progressText}>
                    {formatMoney(goal.currentAmount)} / {formatMoney(goal.targetAmount)} {currency}
                  </Text>
                </View>
              );
            })}
          </Card.Content>
        </Card>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f6',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  mainCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: {
    color: '#757575',
  },
  balanceText: {
    fontWeight: 'bold',
    marginVertical: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    borderTopWidth: 0.5,
    borderTopColor: '#e0e0e0',
    paddingTop: 16,
  },
  statCol: {
    flex: 1,
  },
  incomeText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  expenseText: {
    color: '#F44336',
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionBtn: {
    flex: 1,
    marginHorizontal: 4,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  chartContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  itemRow: {
    marginBottom: 16,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressContainer: {
    marginTop: 6,
  },
  progressText: {
    textAlign: 'right',
    color: '#757575',
    marginTop: 4,
  },
});