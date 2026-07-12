import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { ArrowLeft, PieChart } from 'lucide-react-native';

interface Props {
  title: string;
  onBack: () => void;
  isDark: boolean;
}

export default function MonthlyHeader({ title, onBack, isDark }: Props) {
  return (
    <View style={styles.headerRow}>
      <TouchableOpacity onPress={onBack} style={styles.backButton} hitSlop={10}>
        <ArrowLeft size={22} color={isDark ? '#FFFFFF' : '#111827'} />
      </TouchableOpacity>
      <View style={styles.headerTitleWrapper}>
        <View style={styles.iconBadge}>
          <PieChart size={18} color="#2563EB" />
        </View>
        <Text style={[styles.screenTitle, { color: isDark ? '#FFFFFF' : '#111827' }]} numberOfLines={1}>
          {title}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 16 },
  backButton: { padding: 6, marginRight: 8 },
  headerTitleWrapper: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconBadge: { width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(37, 99, 235, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  screenTitle: { fontSize: 20, fontWeight: '700', letterSpacing: -0.5, flex: 1 },
});