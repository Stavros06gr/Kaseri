import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';

interface Props {
  availableYears: number[];
  selectedYear: number;
  onSelectYear: (year: number) => void;
  isDark: boolean;
}

export default function YearSelector({ availableYears, selectedYear, onSelectYear, isDark }: Props) {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {availableYears.map((year) => {
          const isSelected = selectedYear === year;
          const bgColor = isSelected ? '#2563EB' : isDark ? '#1E1E1E' : '#F3F4F6';
          const textColor = isSelected ? '#FFFFFF' : isDark ? '#9CA3AF' : '#4B5563';

          return (
            <TouchableOpacity
              key={year}
              onPress={() => onSelectYear(year)}
              style={[styles.yearButton, { backgroundColor: bgColor }]}
              activeOpacity={0.8}
            >
              <Text style={[styles.yearText, { color: textColor, fontWeight: isSelected ? '700' : '500' }]}>
                {year}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  scrollContent: { paddingHorizontal: 20, alignItems: 'center', height: 40 },
  yearButton: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 12, marginRight: 8 },
  yearText: { fontSize: 14 }
});