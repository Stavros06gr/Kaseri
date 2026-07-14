import React, { useEffect } from 'react';
import i18n from './i18n'; // Εισαγωγή του i18n instance της εφαρμογής
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { Provider as PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { DatabaseProvider } from '@nozbe/watermelondb/DatabaseProvider'; 
import { database } from './database'; 
import RootNavigator from './navigation/RootNavigator';
import { useAppStore } from './store/useAppStore';

const WatermelonProvider = DatabaseProvider as any;

// Μοντέρνο Flat Light Theme για το Navigation
const customLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#F9FAFB',
    card: '#FFFFFF',
    border: '#F3F4F6',
  },
};

// Μοντέρνο Flat Dark Theme για το Navigation
const customDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#121212',
    card: '#1E1E1E',
    border: '#2D2D2D',
  },
};

export default function App() {
  const { theme, language } = useAppStore();
  const isDark = theme === 'dark';

  // Συγχρονισμός της γλώσσας του i18next με το Zustand store κατά την εκκίνηση
  useEffect(() => {
    // Μετατρέπουμε το 'gr' του store στο 'el' που έχεις ορίσει στο i18n config
    const i18nCode = language === 'gr' ? 'el' : 'en';
    
    if (i18n.language !== i18nCode) {
      i18n.changeLanguage(i18nCode);
    }
  }, [language]);

  // Επιλογή των κατάλληλων themes βάσει του Zustand state
  const activeNavTheme = isDark ? customDarkTheme : customLightTheme;
  const activePaperTheme = isDark ? MD3DarkTheme : MD3LightTheme;

  return (
    <WatermelonProvider database={database}>
      <PaperProvider theme={activePaperTheme}>
        <NavigationContainer theme={activeNavTheme}>
          <View style={[styles.container, { backgroundColor: activeNavTheme.colors.background }]}>
            <RootNavigator />
            {/* Η μπάρα ώρας/μπαταρίας του κινητού αλλάζει πλέον σωστά χρώμα */}
            <StatusBar style={isDark ? 'light' : 'dark'} />
          </View>
        </NavigationContainer>
      </PaperProvider>
    </WatermelonProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});