import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text, Surface, ProgressBar } from 'react-native-paper';
import { Compass, ChevronRight } from 'lucide-react-native';
import { format } from 'date-fns';
import { el, enUS } from 'date-fns/locale';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppStore } from '../../../store/useAppStore';
import { formatMoney } from '../../../utils/math';
import { RootStackParamList } from '../../../navigation/types';

interface Props {
  trips: any[];
  currency: string;
  isDark: boolean;
  noBudgetLabel: string;
  titleLabel: string;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ActiveTripsList({ trips, currency, isDark, noBudgetLabel, titleLabel }: Props) {
  const navigation = useNavigation<NavigationProp>();
  const language = useAppStore((state) => state.language);
  const hideBalance = useAppStore((state) => state.hideBalance);
  const currentLocale = language === 'gr' ? el : enUS;

  const cardBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#111827';
  const subTextColor = isDark ? '#9CA3AF' : '#6B7280';

  // 🛠️ ΑΠΟΛΥΤΗ ΠΡΟΣΤΑΣΙΑ: Αν δεν υπάρχουν ενεργά ταξίδια, επιστρέφουμε null με ασφάλεια.
  // Αυτό προστατεύει από το "0" rendering που προκαλεί το error.
  if (!trips || trips.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* SECTION HEADER */}
      <View style={styles.headerRow}>
        <Compass size={20} color={isDark ? '#60A5FA' : '#2563EB'} style={{ marginRight: 8 }} />
        <Text style={[styles.title, { color: textColor }]}>{titleLabel}</Text>
      </View>

      {/* LIST OF TRIPS */}
      {trips.map((trip) => {
        const start = trip.startDate ? new Date(trip.startDate) : null;
        const end = trip.endDate ? new Date(trip.endDate) : null;
        
        const dateStr = start && end 
          ? `${format(start, 'dd MMM')} - ${format(end, 'dd MMM yyyy', { locale: currentLocale })}`
          : '';

        const budget = trip.budget || 0;
        const totalExpenses = trip.totalExpenses || 0; 
        const percentage = budget > 0 ? (totalExpenses / budget) * 100 : 0;
        const progress = Math.min(Math.max(percentage / 100, 0), 1);

        // Privacy Mode (Hide Balance)
        const displayBudget = hideBalance ? '****' : `${formatMoney(budget)} ${currency}`;
        const displayExpenses = hideBalance ? '****' : `${formatMoney(totalExpenses)} ${currency}`;

        return (
          <Surface key={trip.id} style={[styles.card, { backgroundColor: cardBg }]} mode="flat">
            <TouchableOpacity 
              onPress={() => navigation.navigate('Trips')} 
              activeOpacity={0.7}
              style={styles.clickable}
            >
              <View style={styles.topRow}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text style={[styles.tripName, { color: textColor }]} numberOfLines={1}>
                    {trip.destination || 'Unnamed Trip'}
                  </Text>
                  {dateStr ? (
                    <Text style={[styles.dateText, { color: subTextColor }]}>
                      {dateStr}
                    </Text>
                  ) : null}
                </View>
                <ChevronRight size={16} color={subTextColor} />
              </View>

              {budget > 0 ? (
                <View style={styles.budgetSection}>
                  <View style={styles.amountRow}>
                    <Text style={[styles.expensesText, { color: percentage > 100 ? '#EF4444' : textColor }]}>
                      {displayExpenses}
                    </Text>
                    <Text style={[styles.budgetText, { color: subTextColor }]}>
                      / {displayBudget}
                    </Text>
                  </View>
                  <ProgressBar 
                    progress={progress} 
                    color={percentage > 100 ? '#EF4444' : '#10B981'} 
                    style={styles.progressBar} 
                  />
                </View>
              ) : (
                <Text style={[styles.noBudgetText, { color: subTextColor }]}>
                  ℹ️ {noBudgetLabel}
                </Text>
              )}
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
  clickable: { padding: 16 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tripName: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  dateText: { fontSize: 12, fontWeight: '500' },
  budgetSection: { marginTop: 12 },
  amountRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 6 },
  expensesText: { fontSize: 13, fontWeight: '700' },
  budgetText: { fontSize: 11, marginLeft: 4, fontWeight: '500' },
  progressBar: { height: 6, borderRadius: 3, backgroundColor: 'rgba(0,0,0,0.03)' },
  noBudgetText: { fontSize: 12, fontWeight: '500', marginTop: 8, fontStyle: 'italic' }
});