import './i18n';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
// Προσθέτουμε τις αγκύλες {} εδώ στο import
import { DatabaseProvider } from '@nozbe/watermelondb/DatabaseProvider'; 
import { database } from './database';

// Κρατάμε το cast σε any για να μην γκρινιάζει το TypeScript για τους τύπους
const WatermelonProvider = DatabaseProvider as any;

export default function App() {
  return (
    <WatermelonProvider database={database}>
      <View style={styles.container}>
        <Text>Open up App.tsx to start working on your app!</Text>
        <StatusBar style="auto" />
      </View>
    </WatermelonProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});