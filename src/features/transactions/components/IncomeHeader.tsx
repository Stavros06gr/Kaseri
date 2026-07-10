import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { Coins } from 'lucide-react-native';

interface Props {
  title: string;
  cancelLabel: string;
  onCancel: () => void;
  isDark: boolean;
}

export default function IncomeHeader({ title, cancelLabel, onCancel, isDark }: Props) {
  return (
    <View style={styles.headerRow}>
      <View style={styles.headerLeft}>
        <View style={styles.iconBadge}>
          <Coins size={22} color="#10B981" />
        </View>
        <Text style={[styles.screenTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
          {title}
        </Text>
      </View>
      <Button mode="text" onPress={onCancel} textColor="#EF4444">
        {cancelLabel}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBadge: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(16, 185, 129, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  screenTitle: { fontSize: 22, fontWeight: '700', letterSpacing: -0.5 },
});