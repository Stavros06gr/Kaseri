import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Surface, TextInput, Divider } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  ArrowLeft, 
  Fuel, 
  Milestone, 
  Coins, 
  Users, 
  Gauge, 
  Calculator 
} from 'lucide-react-native';

import { useAppStore } from '../../store/useAppStore';
import { formatMoney } from '../../utils/math';

export default function FuelCalculatorScreen() {
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
  const [distance, setDistance] = useState('100'); // km
  const [consumption, setConsumption] = useState('6.5'); // L/100km
  const [fuelPrice, setFuelPrice] = useState('1.85'); // Price per liter
  const [passengers, setPassengers] = useState('1'); // Split cost

  // ⚡ REAL-TIME CALCULATIONS
  const parsedDistance = parseFloat(distance) || 0;
  const parsedConsumption = parseFloat(consumption) || 0;
  const parsedPrice = parseFloat(fuelPrice) || 0;
  const parsedPassengers = Math.max(parseInt(passengers) || 1, 1);

  // 1. Συνολικά Λίτρα = (Απόσταση * Κατανάλωση) / 100
  const totalLitersNeeded = (parsedDistance * parsedConsumption) / 100;

  // 2. Συνολικό Κόστος = Λίτρα * Τιμή ανά Λίτρο
  const totalCost = totalLitersNeeded * parsedPrice;

  // 3. Κόστος ανά Άτομο = Συνολικό Κόστος / Επιβάτες
  const costPerPerson = totalCost / parsedPassengers;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F9FAFB', paddingTop: insets.top + 12 }]}>
      
      {/* HEADER */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: cardBg }]}>
          <ArrowLeft size={20} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: textColor }]}>
          {t('modes.fuelTitle', 'Fuel Calculator')}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        
        {/* INPUTS CARD */}
        <Surface style={[styles.card, { backgroundColor: cardBg }]} mode="flat">
          <Text style={[styles.cardTitle, { color: subTextColor }]}>
            {t('fuel.tripDetails', 'Trip Details')}
          </Text>

          {/* Distance Input */}
          <View style={styles.inputWrapper}>
            <View style={styles.inputLabelRow}>
              <Milestone size={16} color="#2563EB" style={{ marginRight: 6 }} />
              <Text style={[styles.inputLabel, { color: textColor }]}>{t('fuel.distance', 'Distance')}</Text>
            </View>
            <TextInput
              value={distance}
              onChangeText={setDistance}
              keyboardType="numeric"
              mode="outlined"
              right={<TextInput.Affix text="km" />}
              activeOutlineColor="#2563EB"
              style={styles.textInput}
              textColor={textColor}
            />
          </View>

          {/* Consumption Input */}
          <View style={styles.inputWrapper}>
            <View style={styles.inputLabelRow}>
              <Gauge size={16} color="#10B981" style={{ marginRight: 6 }} />
              <Text style={[styles.inputLabel, { color: textColor }]}>{t('fuel.avgConsumption', 'Average Consumption')}</Text>
            </View>
            <TextInput
              value={consumption}
              onChangeText={setConsumption}
              keyboardType="numeric"
              mode="outlined"
              right={<TextInput.Affix text="L/100km" />}
              activeOutlineColor="#2563EB"
              style={styles.textInput}
              textColor={textColor}
            />
          </View>

          {/* Fuel Price Input */}
          <View style={styles.inputWrapper}>
            <View style={styles.inputLabelRow}>
              <Coins size={16} color="#F59E0B" style={{ marginRight: 6 }} />
              <Text style={[styles.inputLabel, { color: textColor }]}>{t('fuel.pricePerLiter', 'Fuel Price')}</Text>
            </View>
            <TextInput
              value={fuelPrice}
              onChangeText={setFuelPrice}
              keyboardType="numeric"
              mode="outlined"
              right={<TextInput.Affix text={`${currency}/L`} />}
              activeOutlineColor="#2563EB"
              style={styles.textInput}
              textColor={textColor}
            />
          </View>

          {/* Passengers Input */}
          <View style={styles.inputWrapper}>
            <View style={styles.inputLabelRow}>
              <Users size={16} color="#7C3AED" style={{ marginRight: 6 }} />
              <Text style={[styles.inputLabel, { color: textColor }]}>{t('fuel.passengers', 'Passengers (Split Cost)')}</Text>
            </View>
            <TextInput
              value={passengers}
              onChangeText={setPassengers}
              keyboardType="number-pad"
              mode="outlined"
              activeOutlineColor="#2563EB"
              style={styles.textInput}
              textColor={textColor}
            />
          </View>
        </Surface>

        {/* RESULTS CARD */}
        <Surface style={[styles.resultsCard, { backgroundColor: isDark ? '#1E1E1E' : '#EFF6FF', borderColor: isDark ? '#2563EB' : '#BFDBFE' }]} mode="flat">
          
          <View style={styles.resultsHeader}>
            <Calculator size={18} color="#2563EB" style={{ marginRight: 8 }} />
            <Text style={[styles.resultsTitle, { color: isDark ? '#60A5FA' : '#1E40AF' }]}>
              {t('fuel.calculationResults', 'Estimation Results')}
            </Text>
          </View>

          {/* Total Liters Needed */}
          <View style={styles.resultRow}>
            <Text style={[styles.resultLabel, { color: subTextColor }]}>
              {t('fuel.fuelNeeded', 'Required Fuel')}
            </Text>
            <Text style={[styles.resultValue, { color: textColor }]}>
              {totalLitersNeeded.toFixed(2)} L
            </Text>
          </View>

          <Divider style={[styles.divider, { backgroundColor: borderColor }]} />

          {/* Total Cost */}
          <View style={styles.resultRow}>
            <Text style={[styles.resultLabel, { color: subTextColor }]}>
              {t('fuel.totalTripCost', 'Total Trip Cost')}
            </Text>
            <Text style={[styles.resultValueHero, { color: '#EF4444' }]}>
              {formatMoney(totalCost)} {currency}
            </Text>
          </View>

          {/* Split Cost (Εμφανίζεται μόνο αν οι επιβάτες είναι > 1) */}
          {parsedPassengers > 1 && (
            <View>
              <Divider style={[styles.divider, { backgroundColor: borderColor }]} />
              <View style={styles.resultRow}>
                <View>
                  <Text style={[styles.resultLabel, { color: subTextColor }]}>
                    {t('fuel.costPerPerson', 'Cost per Person')}
                  </Text>
                  <Text style={styles.passengerSplitText}>
                    (split by {parsedPassengers} passengers)
                  </Text>
                </View>
                <Text style={[styles.resultValueHero, { color: '#10B981' }]}>
                  {formatMoney(costPerPerson)} {currency}
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
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  resultLabel: { fontSize: 13, fontWeight: '700' },
  resultValue: { fontSize: 15, fontWeight: '800' },
  resultValueHero: { fontSize: 18, fontWeight: '900' },
  passengerSplitText: { fontSize: 10, color: '#6B7280', fontWeight: '500', marginTop: 1 },
  divider: { height: 1, marginVertical: 6 }
});