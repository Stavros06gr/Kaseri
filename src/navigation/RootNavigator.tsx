import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, Button } from 'react-native';
import { RootStackParamList } from './types';
import TabNavigator from './TabNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Προσωρινό Placeholder για την οθόνη κλειδώματος με Fingerprint
const LockScreenPlaceholder = ({ onUnlock }: { onUnlock: () => void }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
    <Text style={{ color: 'white', marginBottom: 20, fontSize: 18 }}>Kaseri is Locked 🔒</Text>
    <Button title="Unlock with Fingerprint" onPress={onUnlock} />
  </View>
);

// Προσωρινό Placeholder για τις υπόλοιπες full stack οθόνες
const DummyStackScreen = ({ name }: { name: string }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>{name}</Text></View>
);

export default function RootNavigator() {
  // Κατάσταση κλειδώματος. Αργότερα θα συνδεθεί με το useBiometrics hook σου
  const [isLocked, setIsLocked] = useState<boolean>(true); 

  if (isLocked) {
    return <LockScreenPlaceholder onUnlock={() => setIsLocked(false)} />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      {/* 1. Η κύρια εφαρμογή με τα 5 Tabs */}
      <Stack.Screen 
        name="MainTabs" 
        component={TabNavigator} 
        options={{ headerShown: false }} 
      />

      {/* 2. Λεπτομέρειες & Sub-screens (Θα αντικατασταθούν με τα κανονικά σου screens) */}
      <Stack.Screen name="WalletDetail" component={() => <DummyStackScreen name="Wallet Detail" />} />
      
      {/* Συναλλαγές (Μπορείς να βάλεις presentation: 'modal' αν θες να ανοίγουν από κάτω) */}
      <Stack.Screen name="Income" component={() => <DummyStackScreen name="Add Income" />} />
      <Stack.Screen name="Expense" component={() => <DummyStackScreen name="Add Expense" />} />
      <Stack.Screen name="Transfer" component={() => <DummyStackScreen name="Transfer Money" />} />
      <Stack.Screen name="EditTransaction" component={() => <DummyStackScreen name="Edit Transaction" />} />
      
      {/* Σύνοψεις, Στόχοι, Ταξίδια */}
      <Stack.Screen name="MonthlySummaries" component={() => <DummyStackScreen name="Monthly Summaries" />} />
      <Stack.Screen name="MonthlySummaryDetail" component={() => <DummyStackScreen name="Monthly Summary Detail" />} />
      <Stack.Screen name="SavingGoalDetail" component={() => <DummyStackScreen name="Saving Goal Detail" />} />
      <Stack.Screen name="SavingTransfer" component={() => <DummyStackScreen name="Saving Transfer" />} />
      <Stack.Screen name="TripDetail" component={() => <DummyStackScreen name="Trip Detail" />} />

      {/* Λειτουργίες από το More Modes */}
      <Stack.Screen name="Own" component={() => <DummyStackScreen name="Debts (Own)" />} />
      <Stack.Screen name="FuelCalculator" component={() => <DummyStackScreen name="Fuel Calculator" />} />
      <Stack.Screen name="SubscriptionManager" component={() => <DummyStackScreen name="Subscription Manager" />} />
      <Stack.Screen name="CategoryStatistics" component={() => <DummyStackScreen name="Category Statistics" />} />
    </Stack.Navigator>
  );
}