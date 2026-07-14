import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Surface, TextInput, Divider } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  ArrowLeft, 
  Droplet, 
  Milestone, 
  Coins, 
  TrendingUp, 
  Calculator,
  Flame
} from 'lucide-react-native';

import { useAppStore } from '../../store/useAppStore';
import { formatMoney } from '../../utils/math';

export default function FuelConsumptionScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const { currency, theme } = useAppStore();
  const isDark = theme === 'dark';

  const cardBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#111827';
  const subTextColor = isDark ? '#9CA3AF' : '#6B7280';
  const borderColor = isDark ? '#2D2D2D' : '#F3F4F6';

  // Inputs States
  const [liters, setLiters] = useState('45'); // Liters refueled
  const [kilometers, setKilometers] = useState('600'); // Kms driven
  const [fuelPrice, setFuelPrice] = useState('1.85'); // Optional price per liter

  // ⚡ REAL-TIME CALCULATIONS
  const parsedLiters = parseFloat(liters) || 0;
  const parsedKms = parseFloat(kilometers) || 0;
  const parsedPrice = parseFloat(fuelPrice) || 0;

  // 1. Πραγματική Κατανάλωση ανά 100km
  const actualConsumption = parsedKms > 0 ? (parsedLiters / parsedKms) * 100 : 0;

  // 2. Κόστος ανά Χιλιόμετρο
  const costPerKm = parsedKms > 0 ? (parsedLiters * parsedPrice) / parsedKms : 0;

  // 3. Κόστος ανά 100 Χιλιόμετρα
  const costPer100Km = actualConsumption * parsedPrice;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F9FAFB', paddingTop: insets.top + 12 }]}>
      
      {/* HEADER */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: cardBg }]}>
          <ArrowLeft size={20} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: textColor }]}>
          {t('consumption.title', 'Fuel Consumption')}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        
        {/* INPUTS CARD */}
        <Surface style={[styles.card, { backgroundColor: cardBg }]} mode="flat">
          <Text style={[styles.cardTitle, { color: subTextColor }]}>
            {t('consumption.details', 'Refuel Details')}
          </Text>

          {/* Liters Input */}
          <View style={styles.inputWrapper}>
            <View style={styles.inputLabelRow}>
              <Droplet size={16} color="#2563EB" style={{ marginRight: 6 }} />
              <Text style={[styles.inputLabel, { color: textColor }]}>{t('consumption.liters', 'Liters Filled')}</Text>
            </View>
            <TextInput
              value={liters}
              onChangeText={setLiters}
              keyboardType="numeric"
              mode="outlined"
              right={<TextInput.Affix text="L" />}
              activeOutlineColor="#2563EB"
              style={styles.textInput}
              textColor={textColor}
            />
          </View>

          {/* Kilometers Input */}
          <View style={styles.inputWrapper}>
            <View style={styles.inputLabelRow}>
              <Milestone size={16} color="#10B981" style={{ marginRight: 6 }} />
              <Text style={[styles.inputLabel, { color: textColor }]}>{t('consumption.kilometers', 'Kilometers Driven')}</Text>
            </View>
            <TextInput
              value={kilometers}
              onChangeText={setKilometers}
              keyboardType="numeric"
              mode="outlined"
              right={<TextInput.Affix text="km" />}
              activeOutlineColor="#10B981"
              style={styles.textInput}
              textColor={textColor}
            />
          </View>

          {/* Fuel Price Input */}
          <View style={styles.inputWrapper}>
            <View style={styles.inputLabelRow}>
              <Coins size={16} color="#F59E0B" style={{ marginRight: 6 }} />
              <Text style={[styles.inputLabel, { color: textColor }]}>{t('consumption.pricePerLiter', 'Fuel Price (Optional)')}</Text>
            </View>
            <TextInput
              value={fuelPrice}
              onChangeText={setFuelPrice}
              keyboardType="numeric"
              mode="outlined"
              right={<TextInput.Affix text={`${currency}/L`} />}
              activeOutlineColor="#F59E0B"
              style={styles.textInput}
              textColor={textColor}
            />
          </View>
        </Surface>

        {/* RESULTS CARD */}
        <Surface style={[styles.resultsCard, { backgroundColor: isDark ? '#1E1E1E' : '#ECFDF5', borderColor: isDark ? '#10B981' : '#A7F3D0' }]} mode="flat">
          
          <View style={styles.resultsHeader}>
            <Calculator size={18} color="#10B981" style={{ marginRight: 8 }} />
            <Text style={[styles.resultsTitle, { color: isDark ? '#34D399' : '#065F46' }]}>
              {t('consumption.results', 'Real Efficiency')}
            </Text>
          </View>

          {/* Average Consumption */}
          <View style={styles.resultRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Flame size={16} color="#EF4444" style={{ marginRight: 6 }} />
              <Text style={[styles.resultLabel, { color: textColor }]}>
                {t('consumption.avgConsumption', 'Real Consumption')}
              </Text>
            </View>
            <Text style={[styles.resultValueHero, { color: '#EF4444' }]}>
              {actualConsumption.toFixed(2)} <Text style={{ fontSize: 13, fontWeight: '700' }}>L/100km</Text>
            </Text>
          </View>

          {parsedPrice > 0 && (
            <View>
              <Divider style={[styles.divider, { backgroundColor: borderColor }]} />

              {/* Cost per Kilometer */}
              <View style={styles.resultRow}>
                <Text style={[styles.resultLabel, { color: subTextColor }]}>
                  {t('consumption.costPerKm', 'Cost per Kilometer')}
                </Text>
                <Text style={[styles.resultValue, { color: textColor }]}>
                  {formatMoney(costPerKm)} {currency}/km
                </Text>
              </View>

              <Divider style={[styles.divider, { backgroundColor: borderColor }]} />

              {/* Cost per 100km */}
              <View style={styles.resultRow}>
                <Text style={[styles.resultLabel, { color: subTextColor }]}>
                  {t('consumption.costPer100Km', 'Cost per 100km')}
                </Text>
                <Text style={[styles.resultValue, { color: textColor }]}>
                  {formatMoney(costPer100Km)} {currency}
                </Text>
              </View>
            </View>
          )}

        </Surface>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, height: 48, marginBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  navTitle: { fontSize: 18, fontWeight: '800', textAlign: 'center', letterSpacing: -0.3 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  
  // Cards
  card: { borderRadius: 24, padding: 20, marginBottom: 16 },
  cardTitle: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16, paddingLeft: 2 },
  
  // Input fields row structure
  inputWrapper: { marginBottom: 14 },
  inputLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, paddingLeft: 2 },
  inputLabel: { fontSize: 13, fontWeight: '700' },
  textInput: { backgroundColor: 'transparent', height: 48 },

  // Results styling
  resultsCard: { borderRadius: 24, padding: 20, borderWidth: 1 },
  resultsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  resultsTitle: { fontSize: 14, fontWeight: '800' },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  resultLabel: { fontSize: 13, fontWeight: '700' },
  resultValue: { fontSize: 14, fontWeight: '800' },
  resultValueHero: { fontSize: 22, fontWeight: '900' },
  divider: { height: 1, marginVertical: 4 }
});