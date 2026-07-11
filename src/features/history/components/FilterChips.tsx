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

export default function FilterChips({ activeFilter, setActiveFilter, isDark, t }: Props) {
  
  // 💡 Έξυπνος υπολογιστής στυλ για μέγιστο contrast όταν ένα φίλτρο είναι πατημένο
  const getChipConfig = (filter: FilterType, activeBrandColor: string) => {
    const isSelected = activeFilter === filter;
    
    return {
      backgroundColor: isSelected 
        ? activeBrandColor // Γεμάτο έντονο χρώμα όταν είναι επιλεγμένο
        : (isDark ? '#1E1E1E' : '#F3F4F6'), // Διακριτικό γκρι όταν είναι ανενεργό
      
      textColor: isSelected 
        ? '#FFFFFF' // Καθαρό λευκό για μέγιστη ανάγνωση
        : (isDark ? '#9CA3AF' : '#4B5563'),
      
      iconColor: isSelected 
        ? '#FFFFFF' 
        : (isDark ? '#9CA3AF' : '#6B7280'),
      
      fontWeight: isSelected ? ('700' as const) : ('500' as const)
    };
  };

  // Ροή ρυθμίσεων για κάθε chip
  const allConfig = getChipConfig('all', '#2563EB');      // Premium Μπλε
  const incomeConfig = getChipConfig('income', '#10B981');   // Έντονο Πράσινο
  const expenseConfig = getChipConfig('expense', '#EF4444');  // Ζωντανό Κόκκινο
  const transferConfig = getChipConfig('transfer', '#4F46E5'); // Deep Indigo/Μπλε για τις μεταφορές

  return (
    <View style={styles.filtersWrapper}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
        
        {/* CHIP: ALL */}
        <Chip
          onPress={() => setActiveFilter('all')}
          style={[styles.chip, { backgroundColor: allConfig.backgroundColor }]}
          textStyle={{ color: allConfig.textColor, fontWeight: allConfig.fontWeight }}
          icon={() => <Layers size={15} color={allConfig.iconColor} />}
        >
          {t('history.all', 'All')}
        </Chip>
        
        {/* CHIP: INCOME */}
        <Chip
          onPress={() => setActiveFilter('income')}
          style={[styles.chip, { backgroundColor: incomeConfig.backgroundColor }]}
          textStyle={{ color: incomeConfig.textColor, fontWeight: incomeConfig.fontWeight }}
          icon={() => <TrendingUp size={15} color={incomeConfig.iconColor} />}
        >
          {t('transactions.income', 'Income')}
        </Chip>
        
        {/* CHIP: EXPENSE */}
        <Chip
          onPress={() => setActiveFilter('expense')}
          style={[styles.chip, { backgroundColor: expenseConfig.backgroundColor }]}
          textStyle={{ color: expenseConfig.textColor, fontWeight: expenseConfig.fontWeight }}
          icon={() => <TrendingDown size={15} color={expenseConfig.iconColor} />}
        >
          {t('transactions.expense', 'Expense')}
        </Chip>
        
        {/* CHIP: TRANSFER */}
        <Chip
          onPress={() => setActiveFilter('transfer')}
          style={[styles.chip, { backgroundColor: transferConfig.backgroundColor }]}
          textStyle={{ color: transferConfig.textColor, fontWeight: transferConfig.fontWeight }}
          icon={() => <ArrowLeftRight size={15} color={transferConfig.iconColor} />}
        >
          {t('transactions.defaultTransferCat', 'Transfer')}
        </Chip>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  filtersWrapper: { marginBottom: 14 },
  filtersScroll: { paddingHorizontal: 20, alignItems: 'center', height: 42 },
  chip: { 
    marginRight: 8, 
    borderRadius: 12,
    borderWidth: 0, // Αφαιρούμε τα native borders της Paper για καθαρότερο flat Look
    elevation: 0,
    shadowOpacity: 0
  },
});