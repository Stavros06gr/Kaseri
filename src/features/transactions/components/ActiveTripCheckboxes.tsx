import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Plane, CheckSquare, Square } from 'lucide-react-native';
import TripModel from '../../../database/models/Trip';

interface Props {
  activeTrips: TripModel[];
  selectedTripId: string;
  onSelectTrip: (id: string) => void;
  isDark: boolean;
  t: (key: string, defaultText: string) => string;
}

export default function ActiveTripCheckboxes({
  activeTrips,
  selectedTripId,
  onSelectTrip,
  isDark,
  t
}: Props) {
  if (!activeTrips || activeTrips.length === 0) return null;

  const cardBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#111827';
  const subTextColor = isDark ? '#9CA3AF' : '#6B7280';

  return (
    <View style={styles.activeTripsContainer}>
      <Text style={[styles.activeTripsTitle, { color: subTextColor }]}>
        {t('trips.activeDuringExpense', 'Active Adventures')}
      </Text>
      {activeTrips.map((trip) => {
        const isSelected = selectedTripId === trip.id;
        return (
          <TouchableOpacity
            key={trip.id}
            activeOpacity={0.7}
            style={[
              styles.tripSelectorRow,
              {
                backgroundColor: cardBg,
                borderColor: isSelected ? '#2563EB' : 'transparent',
                borderWidth: 1.5,
              }
            ]}
            onPress={() => onSelectTrip(trip.id)}
          >
            <View style={styles.tripSelectorLeft}>
              <Plane size={18} color={isSelected ? '#2563EB' : subTextColor} style={{ marginRight: 10 }} />
              <Text style={[styles.tripDestinationText, { color: textColor, fontWeight: isSelected ? '700' : '500' }]}>
                {trip.destination}
              </Text>
            </View>
            {isSelected ? (
              <CheckSquare size={20} color="#2563EB" />
            ) : (
              <Square size={20} color={subTextColor} />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  activeTripsContainer: { marginTop: 16, marginBottom: 8 },
  activeTripsTitle: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  tripSelectorRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 14, 
    borderRadius: 16, 
    marginBottom: 8, 
    elevation: 1, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 2 
  },
  tripSelectorLeft: { flexDirection: 'row', alignItems: 'center' },
  tripDestinationText: { fontSize: 14, marginLeft: 2 }
});