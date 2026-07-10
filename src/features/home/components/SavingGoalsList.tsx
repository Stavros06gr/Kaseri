import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, ProgressBar, Surface } from 'react-native-paper';
import { Target } from 'lucide-react-native';
import SavingGoalModel from '../../../database/models/SavingGoal';

interface Props {
  goals: SavingGoalModel[];
  isDark: boolean;
  titleLabel: string;
}

export default function SavingGoalsList({ goals, isDark, titleLabel }: Props) {
  if (goals.length === 0) return null;
  const textColor = { color: isDark ? '#FFFFFF' : '#111827' };

  return (
    <Surface style={[styles.sectionCard, { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }]} mode="flat">
      <View style={styles.rowInline}>
        <Target size={18} color="#6B7280" style={{ marginRight: 8 }} />
        <Text style={[styles.sectionHeaderTitle, textColor]}>{titleLabel}</Text>
      </View>
      {goals.map(goal => {
        const progress = goal.targetAmount > 0 ? goal.currentAmount / goal.targetAmount : 0;
        const pct = Math.min(Math.round(progress * 100), 100);
        return (
          <View key={goal.id} style={styles.itemContainer}>
            <View style={styles.rowBetween}>
              <Text style={[styles.itemLabel, textColor]}>{goal.title}</Text>
              <Text style={[styles.itemSub, textColor]}>{pct}%</Text>
            </View>
            <ProgressBar progress={Math.min(progress, 1)} color="#2563EB" style={styles.minimalProgress} />
          </View>
        );
      })}
    </Surface>
  );
}

const styles = StyleSheet.create({
  sectionCard: { padding: 20, borderRadius: 24, marginBottom: 16 },
  rowInline: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  sectionHeaderTitle: { fontSize: 16, fontWeight: '700' },
  itemContainer: { marginBottom: 14 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemLabel: { fontSize: 14, fontWeight: '600' },
  itemSub: { fontSize: 13 },
  minimalProgress: { height: 6, borderRadius: 3, marginTop: 8, backgroundColor: '#E5E7EB' }
});