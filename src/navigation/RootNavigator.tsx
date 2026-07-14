import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { Fingerprint } from 'lucide-react-native';

import { RootStackParamList } from './types';
import TabNavigator from './TabNavigator';
import { useAppStore } from '../store/useAppStore';
import { useBiometrics } from '../hooks/useBiometrics';

import WalletsScreen from '../features/wallets/WalletsScreen';
import WalletDetailScreen from '../features/wallets/WalletDetailScreen';
import IncomeScreen from '../features/transactions/IncomeScreen';
import ExpenseScreen from '../features/transactions/ExpenseScreen';
import TransferScreen from '../features/transactions/TransferScreen';
import EditTransactionScreen from '../features/transactions/EditTransactionScreen';
import MonthlySummariesScreen from '../features/summaries/MonthlySummariesScreen';
import SavingGoalsScreen from '../features/goals/SavingGoalsScreen';
import SavingGoalDetail from '../features/goals/SavingGoalDetailScreen';
import SavingTransfer from '../features/goals/SavingTransferScreen';
import TripsScreen from '../features/trips/TripsScreen';
import TripDetail from '../features/trips/TripDetailScreen';
import OwnScreen from '../features/modes/OwnScreen';
import FuelCalculator from '../features/modes/FuelCalculator';
import FuelConsumption from '../features/modes/FuelConsumptionScreen';
import SubscriptionManager from '../features/modes/SubscriptionManagerScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const LockScreen = ({ onUnlock }: { onUnlock: () => void }) => {
  const { requestAuthentication } = useBiometrics();

  const triggerAuth = async () => {
    const success = await requestAuthentication('Confirm identity to open Kaseri');
    if (success) {
      onUnlock();
    }
  };

  useEffect(() => {
    triggerAuth();
  }, []);

  return (
    <View style={styles.lockContainer}>
      <Surface style={styles.lockCard} mode="flat">
        <Fingerprint size={48} color="#2563EB" style={styles.icon} />
        <Text style={styles.lockTitle}>Kaseri is Locked</Text>
        <Text style={styles.lockSubtitle}>Please authenticate using your fingerprint to proceed.</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={triggerAuth}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </Surface>
    </View>
  );
};

const IncomeDummy = () => <View style={styles.dummy}><Text>Add Income</Text></View>;
const ExpenseDummy = () => <View style={styles.dummy}><Text>Add Expense</Text></View>;
const TransferDummy = () => <View style={styles.dummy}><Text>Transfer Money</Text></View>;
const EditTransactionDummy = () => <View style={styles.dummy}><Text>Edit Transaction</Text></View>;
const MonthlySummariesDummy = () => <View style={styles.dummy}><Text>Monthly Summaries</Text></View>;
const MonthlySummaryDetailDummy = () => <View style={styles.dummy}><Text>Monthly Summary Detail</Text></View>;
const SavingGoalDetailDummy = () => <View style={styles.dummy}><Text>Saving Goal Detail</Text></View>;
const SavingTransferDummy = () => <View style={styles.dummy}><Text>Saving Transfer</Text></View>;
const TripDetailDummy = () => <View style={styles.dummy}><Text>Trip Detail</Text></View>;
const OwnDummy = () => <View style={styles.dummy}><Text>Debts (Own)</Text></View>;
const FuelCalculatorDummy = () => <View style={styles.dummy}><Text>Fuel Calculator</Text></View>;
const SubscriptionManagerDummy = () => <View style={styles.dummy}><Text>Subscription Manager</Text></View>;
const CategoryStatisticsDummy = () => <View style={styles.dummy}><Text>Category Statistics</Text></View>;

export default function RootNavigator() {
  const { biometricsEnabled } = useAppStore();
  const [isLocked, setIsLocked] = useState<boolean>(biometricsEnabled); 

  useEffect(() => {
    if (!biometricsEnabled) {
      setIsLocked(false);
    }
  }, [biometricsEnabled]);

  if (isLocked) {
    return <LockScreen onUnlock={() => setIsLocked(false)} />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="Wallets" component={WalletsScreen} />
      <Stack.Screen name="WalletDetail" component={WalletDetailScreen} />
      <Stack.Screen name="Income" component={IncomeScreen} />
      <Stack.Screen name="Expense" component={ExpenseScreen} />
      <Stack.Screen name="Transfer" component={TransferScreen} />
      <Stack.Screen name="EditTransaction" component={EditTransactionScreen} />
      <Stack.Screen name="MonthlySummaries" component={MonthlySummariesScreen} />
      <Stack.Screen name="MonthlySummaryDetail" component={MonthlySummaryDetailDummy} />
      <Stack.Screen name="SavingGoals" component={SavingGoalsScreen} />
      <Stack.Screen name="SavingGoalDetail" component={SavingGoalDetail} />
      <Stack.Screen name="SavingTransfer" component={SavingTransfer} />
      <Stack.Screen name="Trips" component={TripsScreen} />
      <Stack.Screen name="TripDetail" component={TripDetail} />
      <Stack.Screen name="Own" component={OwnScreen} />
      <Stack.Screen name="FuelCalculator" component={FuelCalculator} />
      <Stack.Screen name="FuelConsumption" component={FuelConsumption} />
      <Stack.Screen name="SubscriptionManager" component={SubscriptionManager} />
      <Stack.Screen name="CategoryStatistics" component={CategoryStatisticsDummy} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  lockContainer: { flex: 1, backgroundColor: '#121212', justifyContent: 'center', paddingHorizontal: 24 },
  lockCard: { backgroundColor: '#1E1E1E', borderRadius: 24, padding: 32, alignItems: 'center' },
  icon: { marginBottom: 16 },
  lockTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', marginBottom: 8 },
  lockSubtitle: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  retryBtn: { backgroundColor: '#2563EB', paddingVertical: 12, paddingHorizontal: 28, borderRadius: 14, width: '100%', alignItems: 'center' },
  retryText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  dummy: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});