import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Surface, ProgressBar } from 'react-native-paper';
import { formatMoney } from '../../../utils/math';

interface Props {
  cardBg: string;
  textColor: string;
  subTextColor: string;
  budget: number;
  totalSpent: number;
  hideBalance: boolean;
  currency: string;
  t: (key: string, defaultText: string) => string;
}

export default function TripBudgetCard({
  cardBg, textColor, subTextColor, budget, totalSpent, hideBalance, currency, t
}: Props) {
  const percentage = budget > 0 ? (totalSpent / budget) * 100 : 0;
  const progress = Math.min(Math.max(percentage / 100, 0), 1);
  const remaining = Math.max(budget - totalSpent, 0);
  const isOverBudget = totalSpent > budget;

  const displaySpent = hideBalance ? '****' : `${formatMoney(totalSpent)} ${currency}`;
  const displayBudget = hideBalance ? '****' : `${formatMoney(budget)} ${currency}`;
  const displayRemaining = hideBalance ? '****' : `${formatMoney(remaining)} ${currency}`;

  return (
    <Surface style={[styles.card, { backgroundColor: cardBg }]} mode="flat">
      <Text style={[styles.sectionTitle, { color: subTextColor }]}>
        {t('trips.budgetOverview', 'Budget Overview')}
      </Text>

      <View style={styles.amountRow}>
        <Text style={[styles.spentAmount, { color: isOverBudget ? '#EF4444' : '#2563EB' }]}>
          {displaySpent}
        </Text>
        {budget > 0 && (
          <Text style={[styles.targetAmount, { color: subTextColor }]}>
            / {displayBudget}
          </Text>
        )}
      </View>

      {budget > 0 && (
        <View style={styles.progressWrapper}>
          <ProgressBar 
            progress={progress} 
            color={isOverBudget ? '#EF4444' : '#10B981'} 
            style={styles.progressBar} 
          />
          <Text style={[styles.percentageText, { color: isOverBudget ? '#EF4444' : '#10B981' }]}>
            {percentage.toFixed(0)}%
          </Text>
        </View>
      )}

      {budget > 0 && (
        <View style={styles.footerRow}>
          <Text style={[styles.footerLabel, { color: subTextColor }]}>
            {isOverBudget ? t('trips.overBy', 'Over budget by:') : t('trips.remaining', 'Remaining budget:')}
          </Text>
          <Text style={[styles.footerValue, { color: isOverBudget ? '#EF4444' : '#10B981' }]}>
            {displayRemaining}
          </Text>
        </View>
      )}
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: { padding: 20, borderRadius: 24, marginBottom: 14 },
  sectionTitle: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  amountRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 14 },
  spentAmount: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  targetAmount: { fontSize: 14, marginLeft: 6, fontWeight: '600' },
  progressWrapper: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  progressBar: { flex: 1, height: 8, borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.03)' },
  percentageText: { fontSize: 12, fontWeight: '800', marginLeft: 10, width: 36, textAlign: 'right' },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.03)' },
  footerLabel: { fontSize: 13, fontWeight: '600' },
  footerValue: { fontSize: 14, fontWeight: '700' }
});