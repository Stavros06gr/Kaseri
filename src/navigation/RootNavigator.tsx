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
      <Stack.Screen name="Expense" component={ExpenseDummy} />
      <Stack.Screen name="Transfer" component={TransferDummy} />
      <Stack.Screen name="EditTransaction" component={EditTransactionDummy} />
      <Stack.Screen name="MonthlySummaries" component={MonthlySummariesDummy} />
      <Stack.Screen name="MonthlySummaryDetail" component={MonthlySummaryDetailDummy} />
      <Stack.Screen name="SavingGoalDetail" component={SavingGoalDetailDummy} />
      <Stack.Screen name="SavingTransfer" component={SavingTransferDummy} />
      <Stack.Screen name="TripDetail" component={TripDetailDummy} />
      <Stack.Screen name="Own" component={OwnDummy} />
      <Stack.Screen name="FuelCalculator" component={FuelCalculatorDummy} />
      <Stack.Screen name="SubscriptionManager" component={SubscriptionManagerDummy} />
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