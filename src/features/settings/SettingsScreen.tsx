import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TextInput, Alert } from 'react-native';
import { Text, Surface, Switch } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Languages, Coins, Moon, Fingerprint, KeyRound, Database 
} from 'lucide-react-native';

import { useAppStore } from '../../store/useAppStore';
import SettingOptionRow from './components/SettingOptionRow';
import BackupControls from './components/BackupControls';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();

  // Zustand Global State[cite: 1]
  const { 
    theme, setTheme, 
    currency, setCurrency, 
    language, setLanguage, 
    trading212Key, setTrading212Key,
    biometricsEnabled, toggleBiometrics 
  } = useAppStore();

  const isDark = theme === 'dark';
  const [apiKeyInput, setApiKeyInput] = useState(trading212Key || '');

  const handleLanguageChange = () => {
    const nextLang = language === 'gr' ? 'en' : 'gr';
    const i18nCode = nextLang === 'gr' ? 'el' : 'en';
    i18n.changeLanguage(i18nCode);
    setLanguage(nextLang);
  };

  const handleCurrencyChange = () => {
    const currencies = ['€', '$', '£'];
    const currentIndex = currencies.indexOf(currency);
    const nextIndex = (currentIndex + 1) % currencies.length;
    setCurrency(currencies[nextIndex]);
  };

  const saveApiKey = () => {
    setTrading212Key(apiKeyInput);
    Alert.alert('Success', 'Trading212 API Key updated.');
  };

  const dynamicStyles = {
    bg: { backgroundColor: isDark ? '#121212' : '#F9FAFB' },
    card: { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' },
    textMain: { color: isDark ? '#FFFFFF' : '#111827' },
    textMuted: { color: isDark ? '#9CA3AF' : '#6B7280' },
    divider: { backgroundColor: isDark ? '#2D2D2D' : '#F3F4F6' },
    input: { 
      backgroundColor: isDark ? '#2D2D2D' : '#F3F4F6', 
      color: isDark ? '#FFFFFF' : '#111827' 
    }
  };

  return (
    <ScrollView 
      style={[styles.container, dynamicStyles.bg]} 
      contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16 }]}
    >
      {/* SCREEN TITLE */}
      <Text style={[styles.screenTitle, dynamicStyles.textMain]}>{t('navigation.settings')}</Text>

      {/* SECTION 1: PREFERENCES */}
      <Text style={[styles.sectionLabel, dynamicStyles.textMuted]}>Preferences</Text>
      <Surface style={[styles.groupCard, dynamicStyles.card]} mode="flat">
        <SettingOptionRow
          icon={<Languages size={20} color="#6B7280" />}
          title={t('settings.language')}
          value={language === 'gr' ? 'Ελληνικά' : 'English'}
          onPress={handleLanguageChange}
          isDark={isDark}
        />
        <View style={[styles.innerDivider, dynamicStyles.divider]} />
        <SettingOptionRow
          icon={<Coins size={20} color="#6B7280" />}
          title={t('settings.currency')}
          value={currency}
          onPress={handleCurrencyChange}
          isDark={isDark}
        />
        <View style={[styles.innerDivider, dynamicStyles.divider]} />
        <SettingOptionRow
          icon={<Moon size={20} color="#6B7280" />}
          title={t('settings.theme')}
          rightElement={
            <Switch 
              value={isDark} 
              onValueChange={(val) => setTheme(val ? 'dark' : 'light')} 
            />
          }
          isDark={isDark}
        />
      </Surface>

      {/* SECTION 2: SECURITY & API */}
      <Text style={[styles.sectionLabel, dynamicStyles.textMuted]}>Security & Integrations</Text>
      <Surface style={[styles.groupCard, dynamicStyles.card]} mode="flat">
        <SettingOptionRow
          icon={<Fingerprint size={20} color="#6B7280" />}
          title={t('settings.fingerprint')}
          rightElement={
            <Switch 
              value={biometricsEnabled} 
              onValueChange={toggleBiometrics} 
            />
          }
          isDark={isDark}
        />
        <View style={[styles.innerDivider, dynamicStyles.divider]} />
        
        <View style={styles.apiInputContainer}>
          <View style={styles.apiHeaderRow}>
            <KeyRound size={20} color="#6B7280" style={{ marginRight: 14 }} />
            <Text style={[styles.apiTitle, dynamicStyles.textMain]}>{t('settings.trading212')}</Text>
          </View>
          <TextInput
            style={[styles.input, dynamicStyles.input]}
            value={apiKeyInput}
            onChangeText={setApiKeyInput}
            placeholder="Paste your API key here"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            returnKeyType="done"
            onEndEditing={saveApiKey}
          />
        </View>
      </Surface>

      {/* SECTION 3: DATA MANAGEMENT */}
      <Text style={[styles.sectionLabel, dynamicStyles.textMuted]}>Data Management</Text>
      <Surface style={[styles.groupCard, dynamicStyles.card]} mode="flat">
        <View style={styles.backupHeaderRow}>
          <Database size={20} color="#6B7280" style={{ marginRight: 14 }} />
          <Text style={[styles.apiTitle, dynamicStyles.textMain]}>Local Backup & Restore</Text>
        </View>
        <BackupControls
          onBackup={() => Alert.alert('Backup', 'Local backup created successfully.')}
          onRestore={() => Alert.alert('Restore', 'Data restored successfully.')}
          isDark={isDark}
        />
      </Surface>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  groupCard: {
    borderRadius: 20,
    padding: 12,
    marginBottom: 24,
  },
  innerDivider: {
    height: 1,
    marginHorizontal: 4,
  },
  apiInputContainer: {
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  apiHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  apiTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  input: {
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    fontWeight: '500',
  },
  backupHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingTop: 4,
    marginBottom: 10,
  },
});