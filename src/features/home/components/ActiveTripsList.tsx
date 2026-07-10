import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, ProgressBar, Surface } from 'react-native-paper';
import { Compass } from 'lucide-react-native';
import TripModel from '../../../database/models/Trip';

interface Props {
  trips: TripModel[];
  currency: string;
  isDark: boolean;
  noBudgetLabel: string;
  titleLabel: string;
}

export default function ActiveTripsList({ trips, currency, isDark, noBudgetLabel, titleLabel }: Props) {
  if (trips.length === 0) return null;
  const textColor = { color: isDark ? '#FFFFFF' : '#111827' };

  return (
    <Surface style={[styles.sectionCard, { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }]} mode="flat">
      <View style={styles.rowInline}>
        <Compass size={18} color="#6B7280" style={{ marginRight: 8 }} />
        <Text style={[styles.sectionHeaderTitle, textColor]}>{titleLabel}</Text>
      </View>
      {trips.map(trip => {
        const hasBudget = trip.budget && trip.budget > 0;
        return (
          <View key={trip.id} style={styles.itemContainer}>
            <View style={styles.rowBetween}>
              <Text style={[styles.itemLabel, textColor]}>{trip.destination}</Text>
              <Text style={[styles.itemSub, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                {hasBudget ? `${trip.budget} ${currency}` : noBudgetLabel}
              </Text>
            </View>
            {hasBudget && <ProgressBar progress={0.4} color="#10B981" style={styles.minimalProgress} />}
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