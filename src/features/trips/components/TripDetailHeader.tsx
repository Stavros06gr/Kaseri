import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { ArrowLeft } from 'lucide-react-native';

interface Props {
  destination: string;
  textColor: string;
  cardBg: string;
  onBack: () => void;
}

export default function TripDetailHeader({ destination, textColor, cardBg, onBack }: Props) {
  return (
    <View style={styles.navBar}>
      <TouchableOpacity onPress={onBack} style={[styles.backBtn, { backgroundColor: cardBg }]}>
        <ArrowLeft size={20} color={textColor} />
      </TouchableOpacity>
      <Text style={[styles.navTitle, { color: textColor }]} numberOfLines={1}>
        {destination}
      </Text>
      <View style={{ width: 40 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, height: 48, marginBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  navTitle: { fontSize: 18, fontWeight: '800', flex: 1, textAlign: 'center', marginHorizontal: 12, letterSpacing: -0.3 }
});