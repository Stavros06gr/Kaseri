import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation, useIsFocused, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { database } from '../../database';
import { useAppStore } from '../../store/useAppStore';
import { RootStackParamList } from '../../navigation/types';
import TripModel from '../../database/models/Trip';

// Components Imports
import TripDetailHeader from './components/TripDetailHeader';
import TripBudgetCard from './components/TripBudgetCard';
import TripStatsGrid from './components/TripStatsGrid';
import TripExpenseItem from './components/TripExpenseItem';

type DetailRouteProp = RouteProp<RootStackParamList, 'SavingGoalDetail'>; // Χρήση ίδιου navigation param pattern
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function TripDetailScreen() {
  const { t } = useTranslation();
  const route = useRoute<DetailRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();

  const { tripId } = route.params as any; // safe retrieval of tripId
  const { currency, theme, language } = useAppStore();
  const hideBalance = useAppStore((state) => state.hideBalance);

  const isDark = theme === 'dark';

  // States
  const [loading, setLoading] = useState(true);
  const [trip, setTrip] = useState<TripModel | null>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    if (isFocused) {
      fetchTripDetails();
    }
  }, [isFocused, tripId]);

  const fetchTripDetails = async () => {
    try {
      setLoading(true);
      
      // 1. Φόρτωση Ταξιδιού
      const targetTrip = (await database.get('trips').find(tripId)) as TripModel;
      setTrip(targetTrip);

      // 2. Φόρτωση συνδεδεμένων συναλλαγών (transactions)
      const fetchedTransactions = await targetTrip.transactions.fetch();
      
      // Ταξινόμηση συναλλαγών: Πιο πρόσφατες πρώτες
      const sortedExpenses = fetchedTransactions.sort((a: any, b: any) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

      // Υπολογισμός συνολικού ποσού εξόδων
      const sum = fetchedTransactions.reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0);
      
      setExpenses(sortedExpenses);
      setTotalSpent(sum);
    } catch (error) {
      console.error('Failed to fetch trip details:', error);
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  if (loading || !trip) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: isDark ? '#121212' : '#F9FAFB' }]}>
        <ActivityIndicator animating={true} color="#2563EB" size="large" />
      </View>
    );
  }

  const cardBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#111827';
  const subTextColor = isDark ? '#9CA3AF' : '#6B7280';

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F9FAFB', paddingTop: insets.top + 12 }]}>
      
      {/* HEADER */}
      <TripDetailHeader 
        destination={trip.destination} 
        textColor={textColor} 
        cardBg={cardBg} 
        onBack={() => navigation.goBack()} 
      />

      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        ListHeaderComponent={
          <View>
            {/* BUDGET OVERVIEW CARD */}
            <TripBudgetCard 
              cardBg={cardBg}
              textColor={textColor}
              subTextColor={subTextColor}
              budget={trip.budget || 0}
              totalSpent={totalSpent}
              hideBalance={hideBalance}
              currency={currency}
              t={t}
            />

            {/* DURATION & DAILY AVG GRID */}
            <TripStatsGrid 
              cardBg={cardBg}
              textColor={textColor}
              subTextColor={subTextColor}
              startDate={trip.startDate}
              endDate={trip.endDate}
              totalSpent={totalSpent}
              hideBalance={hideBalance}
              currency={currency}
              t={t}
            />

            {/* HISTORY TITLE */}
            <Text style={[styles.historyTitle, { color: textColor }]}>
              {t('trips.expensesHistory', 'Trip Expenses')}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: subTextColor }]}>
              {t('trips.emptyExpenses', 'No expenses recorded for this trip yet.')}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TripExpenseItem 
            transaction={item}
            textColor={textColor}
            subTextColor={subTextColor}
            hideBalance={hideBalance}
            currency={currency}
            language={language}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  historyTitle: { fontSize: 16, fontWeight: '800', marginTop: 12, marginBottom: 12, letterSpacing: -0.3 },
  emptyContainer: { padding: 30, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 13, fontWeight: '600', textAlign: 'center', fontStyle: 'italic' }
});