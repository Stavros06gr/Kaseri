import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Chip } from 'react-native-paper';
import { Layers, TrendingUp, TrendingDown, ArrowLeftRight } from 'lucide-react-native';

type FilterType = 'all' | 'income' | 'expense' | 'transfer';

interface Props {
  activeFilter: FilterType;
  setActiveFilter: (filter: FilterType) => void;
  isDark: boolean;
  t: (key: string, defaultText: string) => string;
}

export default function MonthlyFilterChips({ activeFilter, setActiveFilter, isDark, t }: Props) {
  
  const getChipStyle = (filter: FilterType, activeBrandColor: string) => {
    const isSelected = activeFilter === filter;
    return {
      backgroundColor: isSelected ? activeBrandColor : (isDark ? '#1E1E1E' : '#F3F4F6'),
      textColor: isSelected ? '#FFFFFF' : (isDark ? '#9CA3AF' : '#4B5563'),
      iconColor: isSelected ? '#FFFFFF' : (isDark ? '#9CA3AF' : '#6B7280'),
      fontWeight: isSelected ? ('700' as const) : ('500' as const)
    };
  };

  const cAll = getChipStyle('all', '#2563EB');
  const cInc = getChipStyle('income', '#10B981');
  const cExp = getChipStyle('expense', '#EF4444');
  const cTrsf = getChipStyle('transfer', '#4F46E5');

  return (
    <View style={styles.filtersContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
        <Chip
          onPress={() => setActiveFilter('all')}
          style={[styles.chip, { backgroundColor: cAll.backgroundColor }]}
          textStyle={{ color: cAll.textColor, fontWeight: cAll.fontWeight }}
          icon={() => <Layers size={14} color={cAll.iconColor} />}
        >
          {t('history.all', 'All')}
        </Chip>
        
        <Chip
          onPress={() => setActiveFilter('income')}
          style={[styles.chip, { backgroundColor: cInc.backgroundColor }]}
          textStyle={{ color: cInc.textColor, fontWeight: cInc.fontWeight }}
          icon={() => <TrendingUp size={14} color={cInc.iconColor} />}
        >
          {t('transactions.income', 'Income')}
        </Chip>
        
        <Chip
          onPress={() => setActiveFilter('expense')}
          style={[styles.chip, { backgroundColor: cExp.backgroundColor }]}
          textStyle={{ color: cExp.textColor, fontWeight: cExp.fontWeight }}
          icon={() => <TrendingDown size={14} color={cExp.iconColor} />}
        >
          {t('transactions.expense', 'Expense')}
        </Chip>
        
        <Chip
          onPress={() => setActiveFilter('transfer')}
          style={[styles.chip, { backgroundColor: cTrsf.backgroundColor }]}
          textStyle={{ color: cTrsf.textColor, fontWeight: cTrsf.fontWeight }}
          icon={() => <ArrowLeftRight size={14} color={cTrsf.iconColor} />}
        >
          {t('transactions.defaultTransferCat', 'Transfer')}
        </Chip>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  filtersContainer: { marginBottom: 14 },
  filtersScroll: { paddingHorizontal: 24, alignItems: 'center', height: 40 },
  chip: { marginRight: 8, borderRadius: 12, borderWidth: 0, elevation: 0 },
});