import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { Settings2, Trash2 } from 'lucide-react-native';

interface Props {
  title: string;
  cancelLabel: string;
  onCancel: () => void;
  onDelete: () => void;
  isDark: boolean;
}

export default function EditTransactionHeader({ title, cancelLabel, onCancel, onDelete, isDark }: Props) {
  return (
    <View style={styles.headerRow}>
      <View style={styles.headerLeft}>
        <View style={styles.iconBadge}>
          <Settings2 size={20} color="#2563EB" />
        </View>
        <Text style={[styles.screenTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
          {title}
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={onDelete} style={styles.deleteBtn} hitSlop={10}>
          <Trash2 size={20} color="#EF4444" />
        </TouchableOpacity>
        <Button mode="text" onPress={onCancel} textColor={isDark ? '#9CA3AF' : '#6B7280'}>
          {cancelLabel}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBadge: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(37, 99, 235, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  screenTitle: { fontSize: 20, fontWeight: '700', letterSpacing: -0.5 },
  actions: { flexDirection: 'row', alignItems: 'center' },
  deleteBtn: { marginRight: 8, padding: 6 }
});