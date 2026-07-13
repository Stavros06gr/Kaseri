import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { Target, Plus } from 'lucide-react-native';

interface Props {
  title: string;
  addLabel: string;
  onAddPress: () => void;
  isDark: boolean;
}

export default function SavingGoalsHeader({ title, addLabel, onAddPress, isDark }: Props) {
  return (
    <View style={styles.headerRow}>
      <View style={styles.headerLeft}>
        <View style={styles.iconBadge}>
          <Target size={20} color="#2563EB" />
        </View>
        <Text style={[styles.screenTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
          {title}
        </Text>
      </View>
      <Button 
        mode="contained" 
        onPress={onAddPress}
        buttonColor="#2563EB"
        textColor="#FFFFFF"
        style={styles.addBtn}
        labelStyle={styles.addBtnLabel}
        icon={() => <Plus size={16} color="#FFFFFF" />}
      >
        {addLabel}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBadge: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(37, 99, 235, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  screenTitle: { fontSize: 22, fontWeight: '700', letterSpacing: -0.5 },
  addBtn: { borderRadius: 12, paddingHorizontal: 4 },
  addBtnLabel: { fontSize: 13, fontWeight: '600' }
});