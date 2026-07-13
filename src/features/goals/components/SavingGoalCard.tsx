import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text, Surface, ProgressBar, Button } from 'react-native-paper';
import { PlusCircle, MinusCircle, Trash2 } from 'lucide-react-native';
import { formatMoney } from '../../../utils/math';
import { format } from 'date-fns';
import { el, enUS } from 'date-fns/locale';

interface Props {
  goal: {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: number;
  };
  currency: string;
  language: 'en' | 'gr';
  isDark: boolean;
  onDeposit: (id: string) => void;
  onWithdraw: (id: string) => void;
  onDelete: (id: string) => void;
  t: (key: string, defaultText: string) => string;
}

export default function SavingGoalCard({ goal, currency, language, isDark, onDeposit, onWithdraw, onDelete, t }: Props) {
  const currentLocale = language === 'gr' ? el : enUS;
  
  // Υπολογισμός προόδου
  const progressRaw = goal.targetAmount > 0 ? goal.currentAmount / goal.targetAmount : 0;
  const progress = Math.min(Math.max(progressRaw, 0), 1); // Clamp μεταξύ 0 και 1
  const percentage = progress * 100;
  const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);

  const subTextColor = isDark ? '#9CA3AF' : '#6B7280';

  return (
    <Surface style={[styles.card, { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }]} mode="flat">
      
      {/* Top Row: Name & Delete */}
      <View style={styles.topRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.goalName, { color: isDark ? '#FFFFFF' : '#111827' }]} numberOfLines={1}>
            {goal.name}
          </Text>
          <Text style={[styles.dateText, { color: subTextColor }]}>
            {t('goals.until', 'Target:')} {format(new Date(goal.targetDate), 'dd MMM yyyy', { locale: currentLocale })}
          </Text>
        </View>
        <TouchableOpacity onPress={() => onDelete(goal.id)} style={styles.deleteBtn} hitSlop={10}>
          <Trash2 size={16} color={isDark ? '#4B5563' : '#9CA3AF'} />
        </TouchableOpacity>
      </View>

      {/* Amounts Row */}
      <View style={styles.amountRow}>
        <Text style={[styles.currentAmount, { color: percentage >= 100 ? '#10B981' : '#2563EB' }]}>
          {formatMoney(goal.currentAmount)} {currency}
        </Text>
        <Text style={[styles.targetAmount, { color: subTextColor }]}>
          / {formatMoney(goal.targetAmount)} {currency}
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressWrapper}>
        <ProgressBar progress={progress} color={percentage >= 100 ? '#10B981' : '#2563EB'} style={styles.progressBar} />
        <Text style={[styles.percentageText, { color: percentage >= 100 ? '#10B981' : '#2563EB' }]}>
          {percentage.toFixed(0)}%
        </Text>
      </View>

      {/* Info Footnote */}
      {remaining > 0 && (
        <Text style={[styles.remainingText, { color: subTextColor }]}>
          {t('goals.missing', 'Remaining:')} <Text style={styles.boldAmount}>{formatMoney(remaining)} {currency}</Text>
        </Text>
      )}

      <View style={[styles.divider, { backgroundColor: isDark ? '#2D2D2D' : '#F3F4F6' }]} />

      {/* Quick Actions Buttons */}
      <View style={styles.actionsRow}>
        <Button 
          mode="text" 
          onPress={() => onWithdraw(goal.id)} 
          textColor="#EF4444"
          icon={() => <MinusCircle size={16} color="#EF4444" />}
          labelStyle={styles.actionLabel}
        >
          {t('goals.withdraw', 'Withdraw')}
        </Button>
        <Button 
          mode="text" 
          onPress={() => onDeposit(goal.id)} 
          textColor="#10B981"
          icon={() => <PlusCircle size={16} color="#10B981" />}
          labelStyle={styles.actionLabel}
        >
          {t('goals.deposit', 'Add Funds')}
        </Button>
      </View>

    </Surface>
  );
}

const styles = StyleSheet.create({
  card: { padding: 18, borderRadius: 24, marginHorizontal: 20, marginBottom: 16 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  goalName: { fontSize: 16, fontWeight: '700', letterSpacing: -0.3 },
  dateText: { fontSize: 12, marginTop: 2 },
  deleteBtn: { padding: 4 },
  amountRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 12 },
  currentAmount: { fontSize: 20, fontWeight: '700' },
  targetAmount: { fontSize: 13, marginLeft: 4, fontWeight: '500' },
  progressWrapper: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  progressBar: { flex: 1, height: 8, borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.03)' },
  percentageText: { fontSize: 12, fontWeight: '700', marginLeft: 10, width: 32, textAlign: 'right' },
  remainingText: { fontSize: 12, fontWeight: '500' },
  boldAmount: { fontWeight: '700' },
  divider: { height: 1, marginVertical: 12 },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  actionLabel: { fontSize: 13, fontWeight: '600' }
});