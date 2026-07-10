import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { BarChart } from 'react-native-gifted-charts';

interface Props {
  income: number;
  expense: number;
  isDark: boolean;
  incomeLabel: string;
  expenseLabel: string;
}

const screenWidth = Dimensions.get('window').width;

export default function AnalysisChart({ income, expense, isDark, incomeLabel, expenseLabel }: Props) {
  const chartData = [
    { value: income, label: incomeLabel, frontColor: '#10B981', spacing: 20 },
    { value: expense, label: expenseLabel, frontColor: '#EF4444' }
  ];

  return (
    <Surface style={[styles.sectionCard, { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }]} mode="flat">
      <View style={styles.chartHeaderInline}>
        <Text style={[styles.sectionHeaderTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>30-Day Analysis</Text>
        <Text style={[styles.chartRangeText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Last 30 days</Text>
      </View>
      <View style={styles.chartWrapper}>
        <BarChart
          data={chartData}
          barWidth={40}
          initialSpacing={45}
          spacing={55}
          barBorderRadius={8}
          showFractionalValues={false}
          hideRules
          showYAxisIndices={false}
          yAxisThickness={0}
          xAxisThickness={0}
          hideYAxisText
          height={130}
          width={screenWidth - 80}
        />
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  sectionCard: { padding: 20, borderRadius: 24, marginBottom: 16 },
  chartHeaderInline: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionHeaderTitle: { fontSize: 16, fontWeight: '700' },
  chartRangeText: { fontSize: 12, fontWeight: '500' },
  chartWrapper: { alignItems: 'center', marginTop: 8 }
});