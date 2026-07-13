import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, Alert } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plane } from 'lucide-react-native';
import { el, enUS } from 'date-fns/locale';

import { database } from '../../database';
import { useAppStore } from '../../store/useAppStore';
import { RootStackParamList } from '../../navigation/types';
import TripModel from '../../database/models/Trip';

// Components Imports
import TripsHeader from './components/TripsHeader';
import TripCard from './components/TripCard';
import AddTripModal from './components/AddTripModal';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function TripsScreen() {
  const { t } = useTranslation();
  const isFocused = useIsFocused();
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();

  const { currency, theme, language } = useAppStore();
  const isDark = theme === 'dark';
  const currentLocale = language === 'gr' ? el : enUS;

  // States
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState<any[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    if (isFocused) {
      loadTrips();
    }
  }, [isFocused]);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const fetchedTrips = (await database.get('trips').query().fetch()) as TripModel[];
      
      // 🛠️ ΔΙΟΡΘΩΣΗ: Φορτώνουμε τις συναλλαγές για κάθε ταξίδι και υπολογίζουμε το totalExpenses
      const tripsWithExpenses = await Promise.all(
        fetchedTrips.map(async (trip) => {
          const txs = await trip.transactions.fetch();
          const totalExpenses = txs.reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0);
          
          // Ορίζουμε με ασφάλεια το property totalExpenses πάνω στο instance του μοντέλου
          Object.defineProperty(trip, 'totalExpenses', {
            value: totalExpenses,
            writable: true,
            enumerable: true,
            configurable: true
          });
          return trip;
        })
      );

      const now = new Date().getTime();

      // ΕΞΥΠΝΗ & ΑΣΦΑΛΗΣ ΤΑΞΙΝΟΜΗΣΗ
      const sortedTrips = tripsWithExpenses.sort((a: any, b: any) => {
        const startA = a.startDate ? new Date(a.startDate).getTime() : 0;
        const endA = a.endDate ? new Date(a.endDate).getTime() : 0;
        const startB = b.startDate ? new Date(b.startDate).getTime() : 0;
        const endB = b.endDate ? new Date(b.endDate).getTime() : 0;

        const isActiveA = now >= startA && now <= endA;
        const isActiveB = now >= startB && now <= endB;

        if (isActiveA && !isActiveB) return -1;
        if (!isActiveA && isActiveB) return 1;

        if (startA !== startB) {
          return startB - startA;
        }

        return (a.destination || '').localeCompare(b.destination || '');
      });

      setTrips(sortedTrips);
    } catch (error) {
      console.error('Failed to load trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrip = async (name: string, budget: number, start: Date, end: Date) => {
    try {
      await database.write(async () => {
        await database.get('trips').create((trip: any) => {
          trip.destination = name;
          trip.budget = budget;
          trip.startDate = start;
          trip.endDate = end;
        });
      });

      setIsModalVisible(false);
      loadTrips();
    } catch (error) {
      console.error('Failed to save trip:', error);
    }
  };

  const handleDeleteTrip = async (id: string) => {
    Alert.alert(
      t('trips.deleteTitle', 'Delete Trip'),
      t('trips.deleteConfirm', 'Are you sure you want to permanently delete this adventure?'),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: 'OK',
          style: 'destructive',
          onPress: async () => {
            try {
              await database.write(async () => {
                const trip = await database.get('trips').find(id);
                await trip.destroyPermanently();
              });
              loadTrips();
            } catch (error) {
              console.error('Failed to delete trip:', error);
            }
          }
        }
      ]
    );
  };

  const handleTripPress = (id: string) => {
    navigation.navigate('TripDetail', { tripId: id });
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F9FAFB', paddingTop: insets.top + 16 }]}>
      
      <TripsHeader 
        title={t('trips.title', 'Adventures')}
        addLabel={t('trips.newBtn', 'New')}
        onAddPress={() => setIsModalVisible(true)}
        isDark={isDark}
      />

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator animating={true} color="#2563EB" size="large" />
        </View>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Plane size={44} color={isDark ? '#374151' : '#D1D5DB'} style={{ marginBottom: 12 }} />
              <Text style={[styles.emptyText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                {t('trips.emptyState', 'No trips planned yet. Where to next?')}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TripCard 
              trip={item}
              currency={currency}
              currentLocale={currentLocale}
              isDark={isDark}
              onDelete={handleDeleteTrip}
              onPress={handleTripPress}
              t={t}
            />
          )}
        />
      )}

      <AddTripModal 
        visible={isModalVisible}
        onDismiss={() => setIsModalVisible(false)}
        onCreate={handleCreateTrip}
        currency={currency}
        isDark={isDark}
        currentLocale={currentLocale}
        t={t}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingBottom: 40 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 60 },
  emptyText: { fontSize: 14, fontWeight: '500', textAlign: 'center', paddingHorizontal: 20 }
});