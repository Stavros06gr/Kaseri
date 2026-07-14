import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TextInput, Alert } from 'react-native';
import { Text, Surface, Switch, Portal, Dialog, RadioButton, Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Languages, Coins, Moon, Fingerprint, KeyRound, Database 
} from 'lucide-react-native';

import { useAppStore } from '../../store/useAppStore';
import SettingOptionRow from './components/SettingOptionRow';
import BackupControls from './components/BackupControls';
import esJSON from '../../i18n/locales/es.json';

// 🛠️ 1. ΛΙΣΤΑ ΥΠΟΣΤΗΡΙΖΟΜΕΝΩΝ ΓΛΩΣΣΩΝ (Με "as const" για κλείδωμα των τύπων)
const LANGUAGES = [
  { code: 'en', label: 'English', i18nCode: 'en' },
  { code: 'gr', label: 'Ελληνικά', i18nCode: 'el' },
  { code: 'de', label: 'Deutsch', i18nCode: 'de' },
  { code: 'es', label: 'Español', i18nCode: 'es' },
  { code: 'pt', label: 'Português', i18nCode: 'pt' },
] as const;

const CURRENCIES = ['€', '$', '£', '¥', 'CHF', 'R$'];

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();

  // Zustand Global State
  const { 
    theme, setTheme, 
    currency, setCurrency, 
    language, setLanguage, 
    trading212Key, setTrading212Key,
    biometricsEnabled, toggleBiometrics 
  } = useAppStore();

  const isDark = theme === 'dark';
  const [apiKeyInput, setApiKeyInput] = useState(trading212Key || '');

  // Modals States
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);

  // 🛠️ 2. ΔΙΟΡΘΩΣΗ: Δέχεται string και κάνει type-safe mapping στο setLanguage
  const handleLanguageSelect = (code: string) => {
    const selected = LANGUAGES.find(l => l.code === code);
    
    if (selected) {
      setLanguage(selected.code); // 👈 Περνάει πλέον εγγυημένα ως AppLanguage
    }
    
    setLangModalVisible(false);
  };

  const handleCurrencySelect = (val: string) => {
    setCurrency(val);
    setCurrencyModalVisible(false);
  };

  const getLanguageLabel = () => {
    const found = LANGUAGES.find(l => l.code === language);
    return found ? found.label : 'English';
  };

  const saveApiKey = () => {
    setTrading212Key(apiKeyInput);
    Alert.alert(
      t('settings.apiKeySuccessTitle', 'Success'), 
      t('settings.apiKeySuccessMsg', 'Trading212 API Key updated.')
    );
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
    <View style={{ flex: 1 }}>
      <ScrollView 
        style={[styles.container, dynamicStyles.bg]} 
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* SCREEN TITLE */}
        <Text style={[styles.screenTitle, dynamicStyles.textMain]}>
          {t('navigation.settings', 'Settings')}
        </Text>

        {/* SECTION 1: PREFERENCES */}
        <Text style={[styles.sectionLabel, dynamicStyles.textMuted]}>
          {t('settings.preferences', 'Preferences')}
        </Text>
        <Surface style={[styles.groupCard, dynamicStyles.card]} mode="flat">
          <SettingOptionRow
            icon={<Languages size={20} color="#6B7280" />}
            title={t('settings.language', 'Language')}
            value={getLanguageLabel()}
            onPress={() => setLangModalVisible(true)}
            isDark={isDark}
          />
          <View style={[styles.innerDivider, dynamicStyles.divider]} />
          <SettingOptionRow
            icon={<Coins size={20} color="#6B7280" />}
            title={t('settings.currency', 'Currency')}
            value={currency}
            onPress={() => setCurrencyModalVisible(true)}
            isDark={isDark}
          />
          <View style={[styles.innerDivider, dynamicStyles.divider]} />
          <SettingOptionRow
            icon={<Moon size={20} color="#6B7280" />}
            title={t('settings.theme', 'Theme')}
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
        <Text style={[styles.sectionLabel, dynamicStyles.textMuted]}>
          {t('settings.securityAndIntegrations', 'Security & Integrations')}
        </Text>
        <Surface style={[styles.groupCard, dynamicStyles.card]} mode="flat">
          <SettingOptionRow
            icon={<Fingerprint size={20} color="#6B7280" />}
            title={t('settings.fingerprint', 'Fingerprint Authentication')}
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
              <Text style={[styles.apiTitle, dynamicStyles.textMain]}>
                {t('settings.trading212', 'Trading212 API Key')}
              </Text>
            </View>
            <TextInput
              style={[styles.input, dynamicStyles.input]}
              value={apiKeyInput}
              onChangeText={setApiKeyInput}
              placeholder={t('settings.apiKeyPlaceholder', 'Paste your API key here')}
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              returnKeyType="done"
              onEndEditing={saveApiKey}
            />
          </View>
        </Surface>

        {/* SECTION 3: DATA MANAGEMENT */}
        <Text style={[styles.sectionLabel, dynamicStyles.textMuted]}>
          {t('settings.dataManagement', 'Data Management')}
        </Text>
        <Surface style={[styles.groupCard, dynamicStyles.card]} mode="flat">
          <View style={styles.backupHeaderRow}>
            <Database size={20} color="#6B7280" style={{ marginRight: 14 }} />
            <Text style={[styles.apiTitle, dynamicStyles.textMain]}>
              {t('settings.backupAndRestore', 'Local Backup & Restore')}
            </Text>
          </View>
          <BackupControls
            onBackup={() => Alert.alert(
              t('settings.backupTitle', 'Backup'), 
              t('settings.backupSuccess', 'Local backup created successfully.')
            )}
            onRestore={() => Alert.alert(
              t('settings.restoreTitle', 'Restore'), 
              t('settings.restoreSuccess', 'Data restored successfully.')
            )}
            isDark={isDark}
          />
        </Surface>
      </ScrollView>

      {/* PORTAL DIALOGS */}
      <Portal>
        <Dialog 
          visible={langModalVisible} 
          onDismiss={() => setLangModalVisible(false)}
          style={{ backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF', borderRadius: 24 }}
        >
          <Dialog.Title style={{ color: dynamicStyles.textMain.color, fontSize: 18, fontWeight: '700' }}>
            {t('settings.selectLanguage', 'Select Language')}
          </Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group onValueChange={handleLanguageSelect} value={language}>
              {LANGUAGES.map((lang) => (
                <View key={lang.code} style={styles.radioRow}>
                  <RadioButton.Android value={lang.code} color="#2563EB" uncheckedColor="#9CA3AF" />
                  <Text style={[styles.radioLabel, { color: dynamicStyles.textMain.color }]}>
                    {lang.label}
                  </Text>
                </View>
              ))}
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setLangModalVisible(false)} textColor="#2563EB" labelStyle={{ fontWeight: '700' }}>
              {t('common.cancel', 'Cancel')}
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog 
          visible={currencyModalVisible} 
          onDismiss={() => setCurrencyModalVisible(false)}
          style={{ backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF', borderRadius: 24 }}
        >
          <Dialog.Title style={{ color: dynamicStyles.textMain.color, fontSize: 18, fontWeight: '700' }}>
            {t('settings.selectCurrency', 'Select Currency')}
          </Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group onValueChange={handleCurrencySelect} value={currency}>
              {CURRENCIES.map((cur) => (
                <View key={cur} style={styles.radioRow}>
                  <RadioButton.Android value={cur} color="#2563EB" uncheckedColor="#9CA3AF" />
                  <Text style={[styles.radioLabel, { color: dynamicStyles.textMain.color }]}>
                    {cur} ({cur === '€' ? 'EUR' : cur === '$' ? 'USD' : cur === '£' ? 'GBP' : cur === '¥' ? 'JPY' : cur === 'CHF' ? 'CHF' : 'BRL'})
                  </Text>
                </View>
              ))}
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setCurrencyModalVisible(false)} textColor="#2563EB" labelStyle={{ fontWeight: '700' }}>
              {t('common.cancel', 'Cancel')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  screenTitle: { fontSize: 28, fontWeight: '700', marginBottom: 24, letterSpacing: -0.5 },
  sectionLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginLeft: 4 },
  groupCard: { borderRadius: 20, padding: 12, marginBottom: 24 },
  innerDivider: { height: 1, marginHorizontal: 4 },
  apiInputContainer: { paddingVertical: 12, paddingHorizontal: 4 },
  apiHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  apiTitle: { fontSize: 15, fontWeight: '500' },
  input: { height: 44, borderRadius: 12, paddingHorizontal: 14, fontSize: 14, fontWeight: '500' },
  backupHeaderRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4, paddingTop: 4, marginBottom: 10 },
  radioRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  radioLabel: { fontSize: 15, fontWeight: '600', marginLeft: 12 },
});