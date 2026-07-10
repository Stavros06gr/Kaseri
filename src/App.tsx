import './i18n'; 
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
// ΕΔΩ: Προστέθηκαν ξανά οι αγκύλες {} που έλειπαν!
import { DatabaseProvider } from '@nozbe/watermelondb/DatabaseProvider'; 
import { database } from './database'; 
import RootNavigator from './navigation/RootNavigator';

// ΔΙΑΓΝΩΣΤΙΚΑ LOGS: Θα εκτυπωθούν στο τερματικό σου για έλεγχο
console.log('=== KASERI DEBUG LOGS ===');
console.log('DatabaseProvider is:', typeof DatabaseProvider);
console.log('NavigationContainer is:', typeof NavigationContainer);
console.log('RootNavigator is:', typeof RootNavigator);
console.log('=========================');

const WatermelonProvider = DatabaseProvider as any;

export default function App() {
  return (
    <WatermelonProvider database={database}>
      <NavigationContainer>
        <View style={styles.container}>
          <RootNavigator />
          <StatusBar style="auto" />
        </View>
      </NavigationContainer>
    </WatermelonProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});