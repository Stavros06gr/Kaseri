import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useIsFocused, useNavigation } from '@react-navigation/native'; // 👈 Προσθήκη useNavigation
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Q } from '@nozbe/watermelondb';
import { format } from 'date-fns';
import { el, enUS } from 'date-fns/locale';

import { database } from '../../database';
import { useAppStore } from '../../store/useAppStore';
import { RootStackParamList } from '../../navigation/types'; // Σιγουρέψου για το path των types σου
import WalletModel from '../../database/models/Wallet';
import TransactionModel from '../../database/models/Transaction';

// Components
import YearlyHeader from './components/YearlyHeader';
import YearSelector from './components/YearSelector';
import YearlyOverviewCard from './components/YearlyOverviewCard';
import MonthRowItem from './components/MonthRowItem';

interface MonthData {
  name: string;
  income: number;
  expense: number;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function YearlySummariesScreen() {
  const { t } = useTranslation();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>(); // 👈 Hook πλοήγησης

  const { currency, theme, language, hideBalance } = useAppStore();
  const isDark = theme === 'dark';
  const currentLocale = language === 'gr' ? el : enUS;

  // States
  const [availableYears, setAvailableYears] = useState<number[]>([new Date().getFullYear()]); // Default το τρέχον έτος
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [yearlyIncome, setYearlyIncome] = useState(0);
  const [yearlyExpense, setYearlyExpense] = useState(0);
  const [monthlyBreakdown, setMonthlyBreakdown] = useState<MonthData[]>([]);

  useEffect(() => {
    if (isFocused) {
      loadYearsAndCalculateData();
    }
  }, [isFocused, selectedYear]);

  const loadYearsAndCalculateData = async () => {
    try {
      setLoading(true);

      // 1. 🛠️ ΔΥΝΑΜΙΚΗ ΕΥΡΕΣΗ ΕΤΩΝ ΜΕ ΒΕΛΤΙΣΤΟΠΟΙΗΜΕΝΟ QUERY
      const oldestTx = (await database.get('transactions').query(Q.sortBy('date', Q.asc), Q.take(1)).fetch()) as TransactionModel[];
      const newestTx = (await database.get('transactions').query(Q.sortBy('date', Q.desc), Q.take(1)).fetch()) as TransactionModel[];

      let years = [new Date().getFullYear()]; // Fallback
      
      if (oldestTx.length > 0 && newestTx.length > 0) {
        const minYear = new Date(oldestTx[0].date).getFullYear();
        const maxYear = new Date(newestTx[0].date).getFullYear();
        const generatedYears: number[] = [];
        
        // Δημιουργία φθίνουσας λίστας ετών (π.χ. 2026, 2025, 2024...)
        for (let y = maxYear; y >= minYear; y--) {
          generatedYears.push(y);
        }
        years = generatedYears;
        setAvailableYears(years);
      }

      // Ασφάλεια: Αν το επιλεγμένο έτος δεν υπάρχει πια στα έτη (π.χ. μετά από διαγραφές), επιλέγουμε το πιο πρόσφατο
      let activeYear = selectedYear;
      if (!years.includes(selectedYear)) {
        activeYear = years[0];
        setSelectedYear(years[0]);
      }

      // 2. ΕΞΑΙΡΕΣΗ ΚΡΥΦΩΝ ΠΟΡΤΟΦΟΛΙΩΝ
      const wallets = (await database.get('wallets').query().fetch()) as WalletModel[];
      const visibleWalletIds = wallets.filter(w => !w.isHidden).map(w => w.id);

      if (visibleWalletIds.length === 0) {
        resetData();
        return;
      }

      // 3. ΥΠΟΛΟΓΙΣΜΟΣ ΣΥΝΑΛΛΑΓΩΝ ΕΤΟΥΣ
      const startOfYear = new Date(activeYear, 0, 1, 0, 0, 0, 0).getTime();
      const endOfYear = new Date(activeYear, 11, 31, 23, 59, 59, 999).getTime();

      const yearTransactions = (await database.get('transactions')
        .query(
          Q.where('wallet_id', Q.oneOf(visibleWalletIds)),
          Q.where('date', Q.between(startOfYear, endOfYear))
        ).fetch()) as TransactionModel[];

      // Προετοιμασία των 12 μηνών
      const months: MonthData[] = Array.from({ length: 12 }, (_, i) => ({
        name: format(new Date(activeYear, i, 1), 'MMMM', { locale: currentLocale }),
        income: 0,
        expense: 0,
      }));

      let totalIncome = 0;
      let totalExpense = 0;

      yearTransactions.forEach((tx) => {
        const txDate = new Date(tx.date);
        const monthIndex = txDate.getMonth();

        if (tx.type === 'income') {
          months[monthIndex].income += tx.amount;
          totalIncome += tx.amount;
        } else if (tx.type === 'expense') {
          months[monthIndex].expense += tx.amount;
          totalExpense += tx.amount;
        }
      });

      setYearlyIncome(totalIncome);
      setYearlyExpense(totalExpense);
      setMonthlyBreakdown(months);
    } catch (error) {
      console.error('Error in yearly analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetData = () => {
    setYearlyIncome(0);
    setYearlyExpense(0);
    setMonthlyBreakdown([]);
    setLoading(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F9FAFB', paddingTop: insets.top + 16 }]}>
      
      <YearlyHeader title={t('summaries.title', 'Yearly Review')} isDark={isDark} />

      <YearSelector 
        availableYears={availableYears}
        selectedYear={selectedYear}
        onSelectYear={setSelectedYear}
        isDark={isDark}
      />

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator animating={true} color="#2563EB" size="large" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <YearlyOverviewCard 
            income={yearlyIncome}
            expense={yearlyExpense}
            currency={currency}
            hideBalance={hideBalance}
            isDark={isDark}
            t={t}
          />

          {/* MONTHLY BREAKDOWN LIST */}
          <View style={styles.breakdownContainer}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
              {t('summaries.breakdown', 'Monthly Breakdown')}
            </Text>
            
            {monthlyBreakdown.map((month, index) => (
              <MonthRowItem 
                key={index}
                monthName={month.name}
                income={month.income}
                expense={month.expense}
                currency={currency}
                hideBalance={hideBalance}
                isDark={isDark}
                /* 🛠️ ΠΛΟΗΓΗΣΗ ΣΤΗΝ ΟΘΟΝΗ ΜΗΝΙΑΙΑΣ ΑΝΑΣΚΟΠΗΣΗΣ */
                onPress={() => navigation.navigate('MonthlySummaries', { 
                  year: selectedYear, 
                  monthIndex: index 
                })}
              />
            ))}
          </View>

        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  breakdownContainer: { paddingHorizontal: 24, marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10, paddingHorizontal: 4 }
});