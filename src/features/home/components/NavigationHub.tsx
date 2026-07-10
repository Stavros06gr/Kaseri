import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { Wallet, Target, Compass, ChevronRight } from 'lucide-react-native';

interface Props {
  onWallets: () => void;
  onGoals: () => void;
  onTrips: () => void;
  isDark: boolean;
  t: (key: string) => string;
}

export default function NavigationHub({ onWallets, onGoals, onTrips, isDark, t }: Props) {
  const cardBg = { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' };
  const textColor = { color: isDark ? '#FFFFFF' : '#111827' };

  return (
    <View style={styles.container}>
      <Surface style={[styles.fullWidthCard, cardBg]} mode="flat">
        <TouchableOpacity style={styles.clickable} onPress={onWallets}>
          <Wallet size={20} color="#6B7280" />
          <Text style={[styles.hubText, textColor]}>{t('home.wallets')}</Text>
          <ChevronRight size={16} color="#9CA3AF" />
        </TouchableOpacity>
      </Surface>

      <View style={styles.splitRow}>
        <Surface style={[styles.halfCard, cardBg]} mode="flat">
          <TouchableOpacity style={styles.clickable} onPress={onGoals}>
            <Target size={18} color="#6B7280" />
            <Text style={[styles.hubTextSmall, textColor]} numberOfLines={1}>{t('home.savingGoals')}</Text>
            <ChevronRight size={14} color="#9CA3AF" />
          </TouchableOpacity>
        </Surface>

        <Surface style={[styles.halfCard, cardBg]} mode="flat">
          <TouchableOpacity style={styles.clickable} onPress={onTrips}>
            <Compass size={18} color="#6B7280" />
            <Text style={[styles.hubTextSmall, textColor]} numberOfLines={1}>{t('home.trips')}</Text>
            <ChevronRight size={14} color="#9CA3AF" />
          </TouchableOpacity>
        </Surface>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  fullWidthCard: { borderRadius: 16, marginBottom: 10, width: '100%' },
  splitRow: { flexDirection: 'row', justifyContent: 'space-between' },
  halfCard: { flex: 1, borderRadius: 16, marginHorizontal: 4 },
  clickable: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  hubText: { flex: 1, fontSize: 14, fontWeight: '600', marginLeft: 12 },
  hubTextSmall: { flex: 1, fontSize: 13, fontWeight: '600', marginLeft: 8 }
});