import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { BarChart3 } from 'lucide-react-native';

interface Props {
  title: string;
  isDark: boolean;
}

export default function YearlyHeader({ title, isDark }: Props) {
  return (
    <View style={styles.headerRow}>
      <View style={styles.headerLeft}>
        <View style={styles.iconBadge}>
          <BarChart3 size={20} color="#2563EB" />
        </View>
        <Text style={[styles.screenTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
          {title}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBadge: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(37, 99, 235, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  screenTitle: { fontSize: 24, fontWeight: '700', letterSpacing: -0.5 },
});