import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Text, Surface, Divider } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Q } from '@nozbe/watermelondb';
import { format } from 'date-fns';
import { el, enUS } from 'date-fns/locale';
import { 
  ArrowLeft, 
  BarChart3, 
  TrendingUp, 
  CalendarRange, 
  Coins, 
  ChevronRight,
  Inbox
} from 'lucide-react-native';

import { database } from '../../database';
import { useAppStore } from '../../store/useAppStore';
import { RootStackParamList } from '../../navigation/types';
import { formatMoney } from '../../utils/math';
import TransactionModel from '../../database/models/Transaction';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function CategoryStatisticsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();

  const { currency, theme, language, hideBalance } = useAppStore();
  const isDark = theme === 'dark';
  const currentLocale = language === 'gr' ? el : enUS;

  const cardBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#111827';
  const subTextColor = isDark ? '#9CA3AF' : '#6B7280';
  const borderColor = isDark ? '#2D2D2D' : '#F3F4F6';

  // 12 Months translation fallbacks
  const shortMonths = language === 'gr' 
    ? ['Ιαν', 'Φεβ', 'Μαρ', 'Απρ', 'Μάι', 'Ιούν', 'Ιούλ', 'Αύγ', 'Σεπ', 'Οκτ', 'Νοέ', 'Δεκ']
    : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Core States
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [transactions, setTransactions] = useState<TransactionModel[]>([]);
  const [monthlyTotals, setMonthlyTotals] = useState<number[]>(new Array(12).fill(0));
  const [loading, setLoading] = useState(true);

  // Διαθέσιμα έτη για φιλτράρισμα
  const availableYears = [
    new Date().getFullYear(),
    new Date().getFullYear() - 1,
    new Date().getFullYear() - 2
  ];

  useEffect(() => {
    if (isFocused) {
      loadInitialData();
    }
  }, [isFocused]);

  useEffect(() => {
    if (isFocused && selectedCategory) {
      calculateStats();
    }
  }, [selectedCategory, selectedYear, isFocused]);

  // Φόρτωση μοναδικών κατηγοριών από τις συναλλαγές εξόδων
  const loadInitialData = async () => {
    try {
      setLoading(true);
      // Παίρνουμε όλες τις συναλλαγές τύπου 'expense'
      const allExpenses = (await database.get('transactions')
        .query(Q.where('type', 'expense'))
        .fetch()) as TransactionModel[];

      // Εξαγωγή μοναδικών κατηγοριών
      const uniqueCats = Array.from(
        new Set(allExpenses.map(tx => tx.category).filter(Boolean))
      ) as string[];

      setCategories(uniqueCats);

      if (uniqueCats.length > 0 && !selectedCategory) {
        setSelectedCategory(uniqueCats[0]);
      } else if (uniqueCats.length === 0) {
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to load initial stats data:', error);
      setLoading(false);
    }
  };

  // Υπολογισμός στατιστικών & κατανομής ανά μήνα
  const calculateStats = async () => {
    try {
      setLoading(true);

      const startOfYear = new Date(selectedYear, 0, 1).getTime();
      const endOfYear = new Date(selectedYear, 11, 31, 23, 59, 59).getTime();

      // Query για τα έξοδα της συγκεκριμένης κατηγορίας και του επιλεγμένου έτους
      const yearExpenses = (await database.get('transactions')
        .query(
          Q.where('type', 'expense'),
          Q.where('category', selectedCategory),
          Q.where('date', Q.between(startOfYear, endOfYear)),
          Q.sortBy('date', Q.desc)
        )
        .fetch()) as TransactionModel[];

      setTransactions(yearExpenses);

      // Υπολογισμός μηνιαίων συνόλων (0-11)
      const months = new Array(12).fill(0);
      yearExpenses.forEach(tx => {
        const dateObj = new Date(tx.date);
        const monthIndex = dateObj.getMonth();
        months[monthIndex] += Math.abs(tx.amount || 0);
      });

      setMonthlyTotals(months);
    } catch (error) {
      console.error('Failed to calculate category stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // ⚡ ΥΠΟΛΟΓΙΣΜΟΙ METRICS
  const totalSpent = monthlyTotals.reduce((sum, val) => sum + val, 0);
  const activeMonthsCount = monthlyTotals.filter(val => val > 0).length || 1;
  const monthlyAverage = totalSpent / 12; // average across the full year

  // Εύρεση Μήνα Αιχμής (Max Spent)
  const maxMonthValue = Math.max(...monthlyTotals);
  const maxMonthIndex = monthlyTotals.indexOf(maxMonthValue);
  const peakMonthName = maxMonthValue > 0 ? shortMonths[maxMonthIndex] : '-';

  // Formatting with Hide Balance Logic
  const displayTotal = hideBalance ? '****' : `${formatMoney(totalSpent)} ${currency}`;
  const displayAverage = hideBalance ? '****' : `${formatMoney(monthlyAverage)} ${currency}`;
  const displayPeak = hideBalance ? '****' : `${formatMoney(maxMonthValue)} ${currency}`;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F9FAFB', paddingTop: insets.top + 12 }]}>
      
      {/* HEADER */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: cardBg }]}>
          <ArrowLeft size={20} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: textColor }]}>
          {t('modes.statsTitle', 'Category Statistics')}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* YEAR SELECTOR CHIPS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll} contentContainerStyle={{ paddingHorizontal: 4 }}>
          {availableYears.map(year => {
            const isSelected = selectedYear === year;
            return (
              <TouchableOpacity
                key={year}
                style={[
                  styles.filterChip,
                  {
                    borderColor: isSelected ? '#2563EB' : borderColor,
                    backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.08)' : cardBg
                  }
                ]}
                onPress={() => setSelectedYear(year)}
              >
                <Text style={[styles.chipText, { color: isSelected ? '#2563EB' : textColor }]}>
                  {year}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* CATEGORY SELECTOR CHIPS */}
        {categories.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll} contentContainerStyle={{ paddingHorizontal: 4 }}>
            {categories.map(cat => {
              const isSelected = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    {
                      borderColor: isSelected ? '#10B981' : borderColor,
                      backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.08)' : cardBg
                    }
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text style={[styles.chipText, { color: isSelected ? '#10B981' : textColor }]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {categories.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Inbox size={44} color={isDark ? '#374151' : '#D1D5DB'} style={{ marginBottom: 12 }} />
            <Text style={[styles.emptyText, { color: subTextColor }]}>
              {t('stats.noData', 'No expense logs found to generate stats.')}
            </Text>
          </View>
        ) : (
          <View>
            
            {/* HERO METRICS GRID */}
            <View style={styles.metricsGrid}>
              
              {/* Total Spent */}
              <Surface style={[styles.metricCard, { backgroundColor: cardBg }]} mode="flat">
                <View style={[styles.iconBox, { backgroundColor: 'rgba(239, 68, 68, 0.08)' }]}>
                  <Coins size={16} color="#EF4444" />
                </View>
                <Text style={[styles.metricLabel, { color: subTextColor }]}>{t('stats.totalSpent', 'Total spent')}</Text>
                <Text style={[styles.metricValue, { color: '#EF4444' }]}>{displayTotal}</Text>
              </Surface>

              {/* Monthly Average */}
              <Surface style={[styles.metricCard, { backgroundColor: cardBg }]} mode="flat">
                <View style={[styles.iconBox, { backgroundColor: 'rgba(37, 99, 235, 0.08)' }]}>
                  <TrendingUp size={16} color="#2563EB" />
                </View>
                <Text style={[styles.metricLabel, { color: subTextColor }]}>{t('stats.monthlyAvg', 'Monthly Average')}</Text>
                <Text style={[styles.metricValue, { color: '#2563EB' }]}>{displayAverage}</Text>
              </Surface>

            </View>

            {/* PEAK MONTH HERO BAR */}
            <Surface style={[styles.peakCard, { backgroundColor: cardBg }]} mode="flat">
              <CalendarRange size={18} color="#F59E0B" style={{ marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.peakLabel, { color: subTextColor }]}>
                  {t('stats.peakMonth', 'Highest Spending Month')}
                </Text>
                <Text style={[styles.peakValue, { color: textColor }]}>
                  {peakMonthName !== '-' ? `${peakMonthName} (${displayPeak})` : '-'}
                </Text>
              </View>
            </Surface>

            {/* PREMIUM CUSTOM BAR CHART */}
            <Surface style={[styles.chartCard, { backgroundColor: cardBg }]} mode="flat">
              <View style={styles.chartHeader}>
                <BarChart3 size={18} color="#2563EB" style={{ marginRight: 8 }} />
                <Text style={[styles.chartTitle, { color: textColor }]}>
                  {t('stats.annualDistribution', 'Annual Distribution')}
                </Text>
              </View>

              <View style={styles.barChartContainer}>
                {monthlyTotals.map((amount, index) => {
                  // Υπολογισμός ποσοστιαίου ύψους της μπάρας με βάση το μέγιστο μήνα
                  const barHeightPercent = maxMonthValue > 0 ? (amount / maxMonthValue) * 100 : 0;
                  const isPeak = amount === maxMonthValue && amount > 0;

                  return (
                    <View key={index} style={styles.barColumn}>
                      {/* Tooltip on long press or just simple display (optional) */}
                      <View style={styles.barWrapper}>
                        <View 
                          style={[
                            styles.actualBar, 
                            { 
                              height: `${Math.max(barHeightPercent, 3)}%`, // minimum 3% height to keep a tiny line
                              backgroundColor: isPeak ? '#10B981' : (amount > 0 ? '#2563EB' : (isDark ? '#2D2D2D' : '#E5E7EB'))
                            }
                          ]} 
                        />
                      </View>
                      <Text style={[styles.monthLabel, { color: isPeak ? '#10B981' : subTextColor, fontWeight: isPeak ? '800' : '500' }]}>
                        {shortMonths[index]}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </Surface>

            {/* RECENT TRANSACTIONS FOR THIS CATEGORY */}
            <Text style={[styles.sectionTitle, { color: subTextColor }]}>
              {t('stats.recentTransactions', 'Category Logs')} ({transactions.length})
            </Text>

            {transactions.length === 0 ? (
              <Surface style={[styles.emptyLogsCard, { backgroundColor: cardBg }]} mode="flat">
                <Text style={{ color: subTextColor, textAlign: 'center', fontSize: 13, fontWeight: '500' }}>
                  {t('stats.noLogsYear', 'No transactions recorded for this period.')}
                </Text>
              </Surface>
            ) : (
              transactions.map(item => {
                const txDate = new Date(item.date);
                const displayAmount = hideBalance ? '****' : `${formatMoney(item.amount)} ${currency}`;

                return (
                  <Surface key={item.id} style={[styles.txCard, { backgroundColor: cardBg }]} mode="flat">
                    <TouchableOpacity 
                      style={styles.txRow} 
                      activeOpacity={0.7}
                      onPress={() => navigation.navigate('EditTransaction', { transactionId: item.id })}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.txDescription, { color: textColor }]} numberOfLines={1}>
                          {item.description?.trim() || selectedCategory}
                        </Text>
                        <Text style={[styles.txDate, { color: subTextColor }]}>
                          {format(txDate, 'dd MMMM yyyy', { locale: currentLocale })}
                        </Text>
                      </View>
                      
                      <View style={styles.txRight}>
                        <Text style={styles.txAmount}>
                          -{displayAmount}
                        </Text>
                        <ChevronRight size={14} color={subTextColor} />
                      </View>
                    </TouchableOpacity>
                  </Surface>
                );
              })
            )}

          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, height: 48, marginBottom: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  navTitle: { fontSize: 18, fontWeight: '800', textAlign: 'center', letterSpacing: -0.3 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },

  // Selectors
  selectorScroll: { marginBottom: 8, flexGrow: 0 },
  categoryScroll: { marginBottom: 16, flexGrow: 0 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, borderWidth: 1.5, marginRight: 8, justifyContent: 'center' },
  categoryChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1.5, marginRight: 8, justifyContent: 'center' },
  chipText: { fontSize: 13, fontWeight: '700' },

  // Metrics Grid
  metricsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  metricCard: { flex: 1, padding: 16, borderRadius: 20, marginHorizontal: 4 },
  iconBox: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  metricLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 2 },
  metricValue: { fontSize: 16, fontWeight: '800' },

  // Peak Card
  peakCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 20, marginBottom: 16, marginHorizontal: 4 },
  peakLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 1 },
  peakValue: { fontSize: 14, fontWeight: '800' },

  // Premium Bar Chart
  chartCard: { padding: 18, borderRadius: 24, marginBottom: 22, marginHorizontal: 4 },
  chartHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  chartTitle: { fontSize: 13, fontWeight: '800', letterSpacing: -0.1 },
  barChartContainer: { flexDirection: 'row', justifyContent: 'space-between', height: 160, alignItems: 'flex-end', paddingTop: 10 },
  barColumn: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  barWrapper: { height: '85%', width: '100%', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 6 },
  actualBar: { width: 10, borderRadius: 4, minHeight: 4 },
  monthLabel: { fontSize: 10, textTransform: 'uppercase' },

  // Category Logs / Transactions List
  sectionTitle: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, paddingLeft: 6 },
  txCard: { borderRadius: 18, marginBottom: 8, marginHorizontal: 4, overflow: 'hidden' },
  txRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  txDescription: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  txDate: { fontSize: 11, fontWeight: '500' },
  txRight: { flexDirection: 'row', alignItems: 'center' },
  txAmount: { fontSize: 14, fontWeight: '800', color: '#EF4444', marginRight: 8 },

  // Empty states
  emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 40 },
  emptyText: { fontSize: 13, fontWeight: '500', textAlign: 'center', paddingHorizontal: 20 },
  emptyLogsCard: { padding: 24, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginHorizontal: 4 }
});