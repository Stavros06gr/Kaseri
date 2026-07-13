import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text, Surface, ProgressBar } from 'react-native-paper';
import { Calendar, Compass, ShieldAlert, Trash2 } from 'lucide-react-native';
import { format } from 'date-fns';
import { formatMoney } from '../../../utils/math';
import { useAppStore } from '../../../store/useAppStore';

interface Props {
  trip: any;
  currency: string;
  currentLocale: any;
  isDark: boolean;
  onDelete: (id: string) => void;
  onPress: (id: string) => void;
  t: (key: string, defaultText: string) => string;
}

export default function TripCard({ trip, currency, currentLocale, isDark, onDelete, onPress, t }: Props) {
  const hideBalance = useAppStore((state) => state.hideBalance);

  const now = new Date().getTime();
  const start = new Date(trip.startDate).getTime();
  const end = new Date(trip.endDate).getTime();

  // Δυναμικός υπολογισμός κατάστασης ταξιδιού
  const isActive = now >= start && now <= end;
  const isUpcoming = now < start;
  const isPast = now > end;

  // Υποθετικό totalExpenses (αν έχεις συνδέσει transactions με το trip)
  const totalExpenses = trip.totalExpenses || 0;
  const budget = trip.budget || 0;
  const percentage = budget > 0 ? (totalExpenses / budget) * 100 : 0;
  const progress = Math.min(Math.max(percentage / 100, 0), 1);

  const cardBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#111827';
  const subTextColor = isDark ? '#9CA3AF' : '#6B7280';

  const displayExpenses = hideBalance ? '****' : `${formatMoney(totalExpenses)} ${currency}`;
  const displayBudget = hideBalance ? '****' : `${formatMoney(budget)} ${currency}`;

  return (
    <Surface style={[styles.card, { backgroundColor: cardBg }]} mode="flat">
      <TouchableOpacity onPress={() => onPress(trip.id)} activeOpacity={0.7}>
        <View style={styles.topRow}>
          <View style={{ flex: 1 }}>
            {/* Status Badge */}
            {isActive ? (
              <View style={[styles.badge, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                <Compass size={12} color="#10B981" style={{ marginRight: 4 }} />
                <Text style={[styles.badgeText, { color: '#10B981' }]}>{t('trips.active', 'Active')}</Text>
              </View>
            ) : isUpcoming ? (
              <View style={[styles.badge, { backgroundColor: 'rgba(37, 99, 235, 0.1)' }]}>
                <Calendar size={12} color="#2563EB" style={{ marginRight: 4 }} />
                <Text style={[styles.badgeText, { color: '#2563EB' }]}>{t('trips.upcoming', 'Upcoming')}</Text>
              </View>
            ) : (
              <View style={[styles.badge, { backgroundColor: 'rgba(107, 114, 128, 0.1)' }]}>
                <Text style={[styles.badgeText, { color: subTextColor }]}>{t('trips.completed', 'Completed')}</Text>
              </View>
            )}

            <Text style={[styles.tripName, { color: textColor }]} numberOfLines={1}>
              {trip.destination || 'Unnamed Trip'}
            </Text>

            <Text style={[styles.dateText, { color: subTextColor }]}>
              {format(new Date(trip.startDate), 'dd MMM')} - {format(new Date(trip.endDate), 'dd MMM yyyy', { locale: currentLocale })}
            </Text>
          </View>

          <TouchableOpacity onPress={() => onDelete(trip.id)} style={styles.deleteBtn} hitSlop={10}>
            <Trash2 size={16} color={isDark ? '#4B5563' : '#9CA3AF'} />
          </TouchableOpacity>
        </View>

        {budget > 0 && (
          <View style={styles.budgetSection}>
            <View style={styles.amountRow}>
              <Text style={[styles.expensesText, { color: percentage > 100 ? '#EF4444' : textColor }]}>
                {displayExpenses}
              </Text>
              <Text style={[styles.budgetText, { color: subTextColor }]}>
                / {t('trips.budgetOf', 'budget')} {displayBudget}
              </Text>
            </View>

            <ProgressBar 
              progress={progress} 
              color={percentage > 100 ? '#EF4444' : isActive ? '#10B981' : '#2563EB'} 
              style={styles.progressBar} 
            />
          </View>
        )}
      </TouchableOpacity>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: { padding: 18, borderRadius: 24, marginHorizontal: 20, marginBottom: 12 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  badge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginBottom: 8 },
  badgeText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  tripName: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3, marginBottom: 2 },
  dateText: { fontSize: 12, fontWeight: '500' },
  deleteBtn: { padding: 4 },
  budgetSection: { marginTop: 14 },
  amountRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 6 },
  expensesText: { fontSize: 15, fontWeight: '700' },
  budgetText: { fontSize: 12, marginLeft: 4, fontWeight: '500' },
  progressBar: { height: 6, borderRadius: 3, backgroundColor: 'rgba(0,0,0,0.03)' }
});