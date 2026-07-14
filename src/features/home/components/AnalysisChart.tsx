import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { BarChart } from 'react-native-gifted-charts';
import { useTranslation } from 'react-i18next';
import { TrendingUp, TrendingDown } from 'lucide-react-native';

import { useAppStore } from '../../../store/useAppStore';
import { formatMoney } from '../../../utils/math';

interface Props {
  income: number;
  expense: number;
  isDark: boolean;
  incomeLabel: string;
  expenseLabel: string;
}

const screenWidth = Dimensions.get('window').width;

export default function AnalysisChart({ income, expense, isDark, incomeLabel, expenseLabel }: Props) {
  const { t } = useTranslation();
  const { currency, language, hideBalance } = useAppStore();

  const textColor = isDark ? '#FFFFFF' : '#111827';
  const subTextColor = isDark ? '#9CA3AF' : '#6B7280';
  const cardBg = isDark ? '#1E1E1E' : '#FFFFFF';

  // ⚡ Εξασφάλιση ότι οι τιμές είναι καθαροί αριθμοί
  const parsedIncome = Number(income) || 0;
  const parsedExpense = Number(expense) || 0;

  // ⚡ COMPACT FORMATTER (π.χ. 165 € / 1.2K €)
  const formatCompactValue = (value: number) => {
    if (hideBalance) return '***';
    return new Intl.NumberFormat(language === 'gr' ? 'el-GR' : 'en-US', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value) + ` ${currency}`;
  };

  // ⚡ ΥΠΟΛΟΓΙΣΜΟΣ SAVINGS RATE & NET DIFFERENCE
  const netFlow = parsedIncome - parsedExpense;
  const isPositive = netFlow >= 0;
  
  const savingsRate = parsedIncome > 0 ? Math.round((netFlow / parsedIncome) * 100) : 0;

  // Υπολογισμός μέγιστου ύψους για σωστό headroom
  const maxVal = Math.max(parsedIncome, parsedExpense);
  const chartMaxValue = maxVal > 0 ? Math.ceil(maxVal * 1.35) : 100; // +35% αέρας

  // Καθαρά static δεδομένα χωρίς gradients ή animations που κολλάνε
  const chartData = [
    { 
      value: parsedIncome, 
      label: incomeLabel, 
      frontColor: '#10B981', // Solid Emerald
      topLabelComponent: () => (
        <Text style={[styles.barTopLabel, { color: isDark ? '#34D399' : '#047857' }]}>
          {formatCompactValue(parsedIncome)}
        </Text>
      ),
    },
    { 
      value: parsedExpense, 
      label: expenseLabel, 
      frontColor: '#EF4444', // Solid Ruby Red
      topLabelComponent: () => (
        <Text style={[styles.barTopLabel, { color: isDark ? '#F87171' : '#B91C1C' }]}>
          {formatCompactValue(parsedExpense)}
        </Text>
      ),
    }
  ];

  return (
    <Surface style={[styles.sectionCard, { backgroundColor: cardBg }]} mode="flat">
      
      {/* HEADER */}
      <View style={styles.chartHeaderInline}>
        <View>
          <Text style={[styles.sectionHeaderTitle, { color: textColor }]}>
            {t('analysis.title', '30-Day Analysis')}
          </Text>
          <Text style={[styles.chartRangeText, { color: subTextColor }]}>
            {t('analysis.subtitle', 'Income vs Expenses')}
          </Text>
        </View>
        
        {/* INSIGHT BADGE */}
        {parsedIncome > 0 && (
          <View style={[
            styles.insightBadge, 
            { backgroundColor: isPositive ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)' }
          ]}>
            {isPositive ? (
              <TrendingUp size={12} color="#10B981" style={{ marginRight: 4 }} />
            ) : (
              <TrendingDown size={12} color="#EF4444" style={{ marginRight: 4 }} />
            )}
            <Text style={[styles.insightBadgeText, { color: isPositive ? '#10B981' : '#EF4444' }]}>
              {isPositive 
                ? `${savingsRate}% ${t('analysis.saved', 'Saved')}` 
                : `${t('analysis.deficit', 'Overspent')}`
              }
            </Text>
          </View>
        )}
      </View>

      {/* CHART WRAPPER */}
      <View style={styles.chartWrapper}>
        <BarChart
          data={chartData}
          barWidth={52}
          initialSpacing={45}
          spacing={65}
          barBorderRadius={12}
          hideRules
          showYAxisIndices={false}
          yAxisThickness={0}
          xAxisThickness={0}
          hideYAxisText
          height={140}
          width={screenWidth - 84}
          maxValue={chartMaxValue}
          xAxisLabelTextStyle={{
            color: subTextColor,
            fontSize: 12,
            fontWeight: '700',
            marginTop: 6
          }}
        />
      </View>

      {/* FOOTER SUMMARY */}
      {!hideBalance && (
        <View style={[styles.chartFooter, { borderColor: isDark ? '#2D2D2D' : '#F3F4F6' }]}>
          <Text style={[styles.footerText, { color: subTextColor }]}>
            {isPositive ? t('analysis.netSavings', 'Net Savings') : t('analysis.deficitAmount', 'Deficit')}:
          </Text>
          <Text style={[styles.footerValue, { color: isPositive ? '#10B981' : '#EF4444' }]}>
            {isPositive ? '+' : ''}{formatMoney(netFlow)} {currency}
          </Text>
        </View>
      )}

    </Surface>
  );
}

const styles = StyleSheet.create({
  sectionCard: { padding: 20, borderRadius: 24, marginBottom: 16 },
  chartHeaderInline: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionHeaderTitle: { fontSize: 16, fontWeight: '800', letterSpacing: -0.3 },
  chartRangeText: { fontSize: 11, fontWeight: '600', marginTop: 1 },
  
  // Badges
  insightBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  insightBadgeText: { fontSize: 11, fontWeight: '800' },

  // Chart
  chartWrapper: { alignItems: 'center', marginTop: 14, marginBottom: 4 },
  barTopLabel: { fontSize: 12, fontWeight: '800', textAlign: 'center', marginBottom: 6 },

  // Summary Footer
  chartFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, marginTop: 16, paddingTop: 12 },
  footerText: { fontSize: 12, fontWeight: '700' },
  footerValue: { fontSize: 14, fontWeight: '900' }
});