import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text, Surface, ProgressBar } from 'react-native-paper';
import { Target, ChevronRight } from 'lucide-react-native';
import { formatMoney } from '../../../utils/math';
import { useAppStore } from '../../../store/useAppStore';

interface GoalItem {
  id: string;
  name: string;
  currentAmount: number;
  targetAmount: number;
  targetDate: number | null;
}

interface Props {
  goals: GoalItem[];
  isDark: boolean;
  titleLabel: string;
  onGoalPress: (id: string) => void;
}

export default function SavingGoalsList({ goals, isDark, titleLabel, onGoalPress }: Props) {
  const currency = useAppStore((state) => state.currency);
  const hideBalance = useAppStore((state) => state.hideBalance);

  const cardBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#111827';
  const subTextColor = isDark ? '#9CA3AF' : '#6B7280';

  if (!goals || goals.length === 0) return null;

  return (
    <View style={styles.container}>
      {/* SECTION TITLE */}
      <View style={styles.headerRow}>
        <Target size={20} color={isDark ? '#34D399' : '#10B981'} style={{ marginRight: 8 }} />
        <Text style={[styles.title, { color: textColor }]}>{titleLabel}</Text>
      </View>

      {/* GOALS LIST */}
      {goals.map((item) => {
        const percentage = item.targetAmount > 0 ? (item.currentAmount / item.targetAmount) * 100 : 0;
        const progress = Math.min(Math.max(percentage / 100, 0), 1);
        const isCompleted = percentage >= 100;

        // Reactive Hide Balance Logic
        const displayCurrent = hideBalance ? '****' : `${formatMoney(item.currentAmount)} ${currency}`;
        const displayTarget = hideBalance ? '****' : `${formatMoney(item.targetAmount)} ${currency}`;

        return (
          <Surface key={item.id} style={[styles.card, { backgroundColor: cardBg }]} mode="flat">
            <TouchableOpacity 
              onPress={() => onGoalPress(item.id)} 
              activeOpacity={0.7}
              style={styles.clickableArea}
            >
              <View style={styles.topRow}>
                <View style={styles.infoBlock}>
                  <Text style={[styles.goalName, { color: textColor }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={[styles.amountsText, { color: subTextColor }]}>
                    {displayCurrent} / {displayTarget}
                  </Text>
                </View>

                <View style={styles.rightBlock}>
                  <Text style={[styles.percentageText, { color: isCompleted ? '#10B981' : '#2563EB' }]}>
                    {percentage.toFixed(0)}%
                  </Text>
                  <ChevronRight size={16} color={subTextColor} style={{ marginLeft: 4 }} />
                </View>
              </View>

              {/* PROGRESS BAR */}
              <ProgressBar 
                progress={progress} 
                color={isCompleted ? '#10B981' : '#2563EB'} 
                style={styles.progressBar} 
              />
            </TouchableOpacity>
          </Surface>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 24, paddingHorizontal: 4 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingHorizontal: 4 },
  title: { fontSize: 16, fontWeight: '700', letterSpacing: -0.3 },
  card: { borderRadius: 20, marginBottom: 10, overflow: 'hidden' },
  clickableArea: { padding: 16 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  infoBlock: { flex: 1, marginRight: 16 },
  goalName: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  amountsText: { fontSize: 12, fontWeight: '500' },
  rightBlock: { flexDirection: 'row', alignItems: 'center' },
  percentageText: { fontSize: 14, fontWeight: '800', textAlign: 'right' },
  progressBar: { height: 6, borderRadius: 3, backgroundColor: 'rgba(0,0,0,0.03)' }
});