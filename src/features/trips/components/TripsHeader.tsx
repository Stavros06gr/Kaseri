import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { Plus } from 'lucide-react-native';

interface Props {
  title: string;
  addLabel: string;
  onAddPress: () => void;
  isDark: boolean;
}

export default function TripsHeader({ title, addLabel, onAddPress, isDark }: Props) {
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#111827' }]}>
        {title}
      </Text>
      <Button
        mode="contained"
        onPress={onAddPress}
        icon={() => <Plus size={16} color="#FFFFFF" />}
        buttonColor={isDark ? '#2563EB' : '#3B82F6'}
        textColor="#FFFFFF"
        style={styles.addBtn}
        labelStyle={styles.addBtnLabel}
      >
        {addLabel}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16, height: 48 },
  title: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  addBtn: { borderRadius: 12, height: 40, justifyContent: 'center' },
  addBtnLabel: { fontSize: 13, fontWeight: '700' }
});