import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Home, Clock, Calendar, LayoutGrid, Settings } from 'lucide-react-native';
import { TabParamList } from './types';
import HomeScreen from '../features/home/HomeScreen';

const Tab = createBottomTabNavigator<TabParamList>();

// Προσωρινά Placeholders για να κάνει compile το app σου
const DummyScreen = ({ name }: { name: string }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>{name}</Text></View>
);

export default function TabNavigator() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF', // Μπορείς να το αλλάξεις ανάλογα με το theme σου
        tabBarInactiveTintColor: 'gray',
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
        component={() => <DummyScreen name="History Screen" />} 
        options={{
          title: t('navigation.history'),
          tabBarIcon: ({ color, size }) => <Clock color={color} size={size} />,
        }}
      />
      <Tab.Screen 
        name="YearlySummaries" 
        component={() => <DummyScreen name="Yearly Summaries Screen" />} 
        options={{
          title: t('navigation.yearlySummaries'),
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} />,
        }}
      />
      <Tab.Screen 
        name="MoreModes" 
        component={() => <DummyScreen name="More Modes Screen" />} 
        options={{
          title: t('navigation.moreModes'),
          tabBarIcon: ({ color, size }) => <LayoutGrid color={color} size={size} />,
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={() => <DummyScreen name="Settings Screen" />} 
        options={{
          title: t('navigation.settings'),
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}