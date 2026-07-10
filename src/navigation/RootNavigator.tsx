import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, Button } from 'react-native';
import { RootStackParamList } from './types';
import TabNavigator from './TabNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

const LockScreenPlaceholder = ({ onUnlock }: { onUnlock: () => void }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
    <Text style={{ color: 'white', marginBottom: 20, fontSize: 18 }}>Kaseri is Locked 🔒</Text>
    <Button title="Unlock with Fingerprint" onPress={onUnlock} />
  </View>
);

// Σταθερά dummy components για να μην χτυπάει το inline function warning
const WalletDetailDummy = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Wallet Detail</Text></View>;
const IncomeDummy = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Add Income</Text></View>;
const ExpenseDummy = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Add Expense</Text></View>;
const TransferDummy = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Transfer Money</Text></View>;
const EditTransactionDummy = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Edit Transaction</Text></View>;
const MonthlySummariesDummy = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Monthly Summaries</Text></View>;
const MonthlySummaryDetailDummy = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Monthly Summary Detail</Text></View>;
const SavingGoalDetailDummy = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Saving Goal Detail</Text></View>;
const SavingTransferDummy = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Saving Transfer</Text></View>;
const TripDetailDummy = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Trip Detail</Text></View>;
const OwnDummy = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Debts (Own)</Text></View>;
const FuelCalculatorDummy = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Fuel Calculator</Text></View>;
const SubscriptionManagerDummy = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Subscription Manager</Text></View>;
const CategoryStatisticsDummy = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Category Statistics</Text></View>;

export default function RootNavigator() {
  const [isLocked, setIsLocked] = useState<boolean>(true); 

  if (isLocked) {
    return <LockScreenPlaceholder onUnlock={() => setIsLocked(false)} />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="WalletDetail" component={WalletDetailDummy} />
      <Stack.Screen name="Income" component={IncomeDummy} />
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