import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Surface, ProgressBar } from 'react-native-paper';
import { Trophy, ShieldAlert, Calendar } from 'lucide-react-native';
import { format } from 'date-fns';
import { formatMoney } from '../../../utils/math';

interface Props {
  cardBg: string;
  isAchieved: boolean;
  isExpired: boolean;
  hasDate: boolean;
  targetDate: Date | null;
  currentLocale: any;
  percentage: number;
  currentAmount: number;
  targetAmount: number;
  progress: number;
  currency: string;
  subTextColor: string;
  isDark: boolean;
  t: (key: string, defaultText: string) => string;
}

export default function GoalProgressCard({
  cardBg, isAchieved, isExpired, hasDate, targetDate, currentLocale,
  percentage, currentAmount, targetAmount, progress, currency, subTextColor, isDark, t
}: Props) {
  return (
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
              {hasDate && targetDate ? format(targetDate, 'dd MMM yyyy', { locale: currentLocale }) : t('goals.noDeadline', 'No Deadline')}
            </Text>
          </View>
        )}
        <Text style={[styles.percentageLabel, { color: isAchieved ? '#10B981' : '#2563EB' }]}>
          {percentage.toFixed(0)}%
        </Text>
      </View>

      <View style={styles.balanceContainer}>
        <Text style={[styles.currentAmount, { color: isDark ? '#FFFFFF' : '#111827' }]}>
          {formatMoney(currentAmount)} {currency}
        </Text>
        <Text style={[styles.targetAmount, { color: subTextColor }]}>
          {t('goals.ofTarget', 'of')} {formatMoney(targetAmount)} {currency}
        </Text>
      </View>

      <ProgressBar 
        progress={progress} 
        color={isAchieved ? '#10B981' : isExpired ? '#EF4444' : '#2563EB'} 
        style={styles.progressBar} 
      />
    </Surface>
  );
}

const styles = StyleSheet.create({
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
  progressBar: { height: 10, borderRadius: 5, backgroundColor: 'rgba(0,0,0,0.03)' }
});