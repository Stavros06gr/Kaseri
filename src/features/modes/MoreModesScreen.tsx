import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Sparkles, 
  Fuel, 
  RefreshCw, 
  PieChart, 
  ChevronRight, 
  Layers 
} from 'lucide-react-native';

import { useAppStore } from '../../store/useAppStore';
import { RootStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function MoreModesScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();

  const { theme } = useAppStore();
  const isDark = theme === 'dark';

  const cardBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#111827';
  const subTextColor = isDark ? '#9CA3AF' : '#6B7280';

  // Ορισμός των 4 Buttons με τα αντίστοιχα routes, εικονίδια και χρώματα
  const modesList = [
    {
      id: 'own',
      title: t('modes.ownTitle', 'Own'),
      description: t('modes.ownDesc', 'Track what you owe and what others owe you'),
      route: 'Own' as const,
      icon: Sparkles,
      iconColor: '#7C3AED', // Premium Violet
      bgColor: 'rgba(124, 58, 237, 0.08)',
    },
    {
      id: 'fuel',
      title: t('modes.fuelTitle', 'Fuel Calculator'),
      description: t('modes.fuelDesc', 'Calculate consumption and trip costs'),
      route: 'FuelCalculator' as const,
      icon: Fuel,
      iconColor: '#EF4444', // Red / Orange
      bgColor: 'rgba(239, 68, 68, 0.08)',
    },
    {
      id: 'subscriptions',
      title: t('modes.subTitle', 'Subscription Manager'),
      description: t('modes.subDesc', 'Track active recurring billings'),
      route: 'SubscriptionManager' as const,
      icon: RefreshCw,
      iconColor: '#2563EB', // Blue
      bgColor: 'rgba(37, 99, 235, 0.08)',
    },
    {
      id: 'statistics',
      title: t('modes.statsTitle', 'Category statistics'),
      description: t('modes.statsDesc', 'Granular expense breakdown of a thing'),
      route: 'CategoryStatistics' as const,
      icon: PieChart,
      iconColor: '#10B981', // Emerald Green
      bgColor: 'rgba(16, 185, 129, 0.08)',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F9FAFB', paddingTop: insets.top + 16 }]}>
      
      {/* HEADER */}
      <View style={styles.headerRow}>
        <Layers size={22} color={isDark ? '#60A5FA' : '#2563EB'} style={{ marginRight: 10 }} />
        <Text style={[styles.title, { color: textColor }]}>
          {t('modes.headerTitle', 'More Modes')}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionSubtitle, { color: subTextColor }]}>
          {t('modes.subtitle', 'Power up your financials with customized calculators and tracking systems.')}
        </Text>

        {/* LIST OF BUTTONS */}
        {modesList.map((item) => {
          const IconComponent = item.icon;

          return (
            <Surface 
              key={item.id} 
              style={[styles.card, { backgroundColor: cardBg }]} 
              mode="flat"
            >
              <TouchableOpacity 
                style={styles.clickableArea}
                activeOpacity={0.7}
                onPress={() => navigation.navigate(item.route as any)}
              >
                <View style={styles.leftRow}>
                  {/* Icon Wrapper */}
                  <View style={[styles.iconCircle, { backgroundColor: item.bgColor }]}>
                    <IconComponent size={20} color={item.iconColor} />
                  </View>
                  
                  {/* Metadata */}
                  <View style={styles.textBlock}>
                    <Text style={[styles.modeTitle, { color: textColor }]}>
                      {item.title}
                    </Text>
                    <Text style={[styles.modeDesc, { color: subTextColor }]}>
                      {item.description}
                    </Text>
                  </View>
                </View>

                {/* Right Arrow Indicator */}
                <ChevronRight size={18} color={subTextColor} />
              </TouchableOpacity>
            </Surface>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16, height: 48 },
  title: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  sectionSubtitle: { fontSize: 13, fontWeight: '500', lineHeight: 18, marginBottom: 24, paddingHorizontal: 4 },
  card: { borderRadius: 24, marginBottom: 12, overflow: 'hidden', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 2 },
  clickableArea: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18 },
  leftRow: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 16 },
  iconCircle: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  textBlock: { flex: 1 },
  modeTitle: { fontSize: 15, fontWeight: '700', marginBottom: 3 },
  modeDesc: { fontSize: 11, fontWeight: '500', lineHeight: 14 }
});