import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Surface, ProgressBar } from 'react-native-paper';
import { Target } from 'lucide-react-native';
import { formatMoney } from '../../../utils/math';

interface GoalItem {
  id: string;
  name: string; // 👈 Διασφάλιση ότι διαβάζει το 'name'
  currentAmount: number;
  targetAmount: number;
}

interface Props {
  goals: GoalItem[];
  isDark: boolean;
  titleLabel: string;
}

export default function SavingGoalsList({ goals, isDark, titleLabel }: Props) {
  if (goals.length === 0) return null;

  const cardBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#111827';
  const subTextColor = isDark ? '#9CA3AF' : '#6B7280';

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: textColor }]}>{titleLabel}</Text>
      
      {goals.map((item) => {
        const progressRaw = item.targetAmount > 0 ? item.currentAmount / item.targetAmount : 0;
        const progress = Math.min(Math.max(progressRaw, 0), 1);
        const percentage = progress * 100;

        return (
          <Surface key={item.id} style={[styles.card, { backgroundColor: cardBg }]} mode="flat">
            <View style={styles.topRow}>
              <View style={styles.titleWrapper}>
                <Target size={16} color="#2563EB" style={{ marginRight: 6 }} />
                {/* 🛠️ Η ΔΙΟΡΘΩΣΗ: Χρήση του item.name */}
                <Text style={[styles.goalName, { color: textColor }]} numberOfLines={1}>
                  {item.name || 'Unnamed Goal'}
                </Text>
              </View>
              <Text style={[styles.percentage, { color: percentage >= 100 ? '#10B981' : '#2563EB' }]}>
                {percentage.toFixed(0)}%
              </Text>
            </View>

            <ProgressBar 
              progress={progress} 
              color={percentage >= 100 ? '#10B981' : '#2563EB'} 
              style={styles.progressBar} 
            />

            <View style={styles.bottomRow}>
              <Text style={[styles.amountText, { color: subTextColor }]}>
                {formatMoney(item.currentAmount)} / {formatMoney(item.targetAmount)}
              </Text>
            </View>
          </Surface>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  card: { padding: 14, borderRadius: 16, marginBottom: 10 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  titleWrapper: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 },
  goalName: { fontSize: 14, fontWeight: '600', letterSpacing: -0.2, flex: 1 },
  percentage: { fontSize: 13, fontWeight: '700' },
  progressBar: { height: 6, borderRadius: 3, backgroundColor: 'rgba(0,0,0,0.03)' },
  bottomRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 6 },
  amountText: { fontSize: 11, fontWeight: '500' }
});