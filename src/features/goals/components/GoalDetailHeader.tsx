import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { ArrowLeft } from 'lucide-react-native';

interface Props {
  title: string;
  isDark: boolean;
  onBack: () => void;
}

export default function GoalDetailHeader({ title, isDark, onBack }: Props) {
  return (
    <View style={styles.navBar}>
      <TouchableOpacity onPress={onBack} style={[styles.backBtn, { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }]}>
        <ArrowLeft size={20} color={isDark ? '#FFFFFF' : '#111827'} />
      </TouchableOpacity>
      <Text style={[styles.navTitle, { color: isDark ? '#FFFFFF' : '#111827' }]} numberOfLines={1}>
        {title}
      </Text>
      <View style={{ width: 40 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, height: 48, marginBottom: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  navTitle: { fontSize: 18, fontWeight: '700', flex: 1, textAlign: 'center', marginHorizontal: 12 }
});