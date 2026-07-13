import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Home, Clock, Calendar, LayoutGrid, Settings } from 'lucide-react-native';
import { TabParamList } from './types';
import { useAppStore } from '../store/useAppStore';

import HomeScreen from '../features/home/HomeScreen';
import HistoryScreen from '../features/history/HistoryScreen';
import YearlyHeaderScreen from '../features/summaries/YearlySummariesScreen';
import MoreModesScreen from '../features/modes/MoreModesScreen';
import SettingsScreen from '../features/settings/SettingsScreen';

const Tab = createBottomTabNavigator<TabParamList>();

// Ορίζουμε τις dummy οθόνες ως κανονικά, σταθερά components ΕΞΩ από το TabNavigator
const HistoryScreenDummy = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>History Screen</Text></View>;
const YearlySummariesDummy = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Yearly Summaries Screen</Text></View>;
const MoreModesDummy = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>More Modes Screen</Text></View>;
const SettingsDummy = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Settings Screen</Text></View>;

export default function TabNavigator() {

  const { theme } = useAppStore();
  const isDark = theme === 'dark';
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: isDark ? '#3B82F6' : '#2563EB', // Πιο φωτεινό μπλε στο dark mode
        tabBarInactiveTintColor: isDark ? '#9CA3AF' : '#6B7280',
        tabBarStyle: {
          backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
          borderTopColor: isDark ? '#2D2D2D' : '#F3F4F6',
          elevation: 0, // Αφαιρεί το native shadow για flat look
        }
      }}
      >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          title: t('navigation.home'),
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tab.Screen 
        name="History" 
        component={HistoryScreen} 
        options={{
          title: t('navigation.history'),
          tabBarIcon: ({ color, size }) => <Clock color={color} size={size} />,
        }}
      />
      <Tab.Screen 
        name="YearlySummaries" 
        component={YearlyHeaderScreen} 
        options={{
          title: t('navigation.yearlySummaries'),
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} />,
        }}
      />
      <Tab.Screen 
        name="MoreModes" 
        component={MoreModesScreen} 
        options={{
          title: t('navigation.moreModes'),
          tabBarIcon: ({ color, size }) => <LayoutGrid color={color} size={size} />,
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} // <- Αντικατάσταση του SettingsDummy!
        options={{
          title: t('navigation.settings'),
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
        }}
/>
    </Tab.Navigator>
  );
}