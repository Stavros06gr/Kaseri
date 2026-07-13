import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { Wallet, Target } from 'lucide-react-native';
import { formatMoney } from '../../../utils/math';
import WalletModel from '../../../database/models/Wallet';
import SavingGoalModel from '../../../database/models/SavingGoal';
import { useAppStore } from '../../../store/useAppStore';

interface Props {
  cardBg: string;
  textColor: string;
  isDark: boolean;
  transferType: string;
  wallets: WalletModel[];
  goals: SavingGoalModel[];
  selectedWalletId: string;
  selectedGoalId: string;
  routeGoalId?: string;
  currency: string;
  setSelectedWalletId: (id: string) => void;
  setSelectedGoalId: (id: string) => void;
  t: (key: string, defaultText: string) => string;
}

export default function WalletGoalSelectorCard({
  cardBg, textColor, isDark, transferType, wallets, goals,
  selectedWalletId, selectedGoalId, routeGoalId, currency,
  setSelectedWalletId, setSelectedGoalId, t
}: Props) {
  
  const hideBalance = useAppStore((state) => state.hideBalance);

  return (
    <Surface style={[styles.card, { backgroundColor: cardBg }]} mode="flat">
      {/* WALLET SELECTOR */}
      <Text style={[styles.sectionTitle, { color: isDark ? '#9CA3AF' : '#4B5563' }]}>
        {transferType === 'deposit' ? t('goals.sourceWallet', 'From Wallet') : t('goals.destWallet', 'To Wallet')}
      </Text>
      <View style={styles.selectorRow}>
        <Wallet size={20} color="#2563EB" style={{ marginRight: 12 }} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
          {wallets.map((w) => {
            /* 🛠️ ΔΙΟΡΘΩΣΗ: Αν το wallet είναι hidden Ή το global hide είναι true, κρύψε το balance */
            const isWalletHidden = hideBalance || w.isHidden;
            const displayBalance = isWalletHidden ? '****' : `${formatMoney(w.balance)} ${currency}`;
            
            return (
              <TouchableOpacity
                key={w.id}
                style={[
                  styles.chip, 
                  { 
                    borderColor: selectedWalletId === w.id ? '#2563EB' : (isDark ? '#4B5563' : '#D1D5DB'), 
                    backgroundColor: selectedWalletId === w.id ? 'rgba(37, 99, 235, 0.08)' : 'transparent' 
                  }
                ]}
                onPress={() => setSelectedWalletId(w.id)}
              >
                <Text style={[styles.chipText, { color: selectedWalletId === w.id ? '#2563EB' : textColor }]}>
                  {w.name} <Text style={styles.balanceSubText}>({displayBalance})</Text>
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={[styles.divider, { backgroundColor: isDark ? '#2D2D2D' : '#F3F4F6' }]} />

      {/* GOAL SELECTOR */}
      <Text style={[styles.sectionTitle, { color: isDark ? '#9CA3AF' : '#4B5563', marginTop: 8 }]}>
        {t('home.savingGoals', 'Saving Goal')}
      </Text>
      <View style={styles.selectorRow}>
        <Target size={20} color="#10B981" style={{ marginRight: 12 }} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
          {goals.map((g) => (
            <TouchableOpacity
              key={g.id}
              style={[
                styles.chip, 
                { 
                  borderColor: selectedGoalId === g.id ? '#10B981' : (isDark ? '#4B5563' : '#D1D5DB'), 
                  backgroundColor: selectedGoalId === g.id ? 'rgba(16, 185, 129, 0.08)' : 'transparent' 
                }
              ]}
              onPress={() => setSelectedGoalId(g.id)}
              disabled={!!routeGoalId}
            >
              <Text style={[styles.chipText, { color: selectedGoalId === g.id ? '#10B981' : textColor }]}>
                {g.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: 24, marginBottom: 14 },
  sectionTitle: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  selectorRow: { flexDirection: 'row', alignItems: 'center' },
  chipScroll: { paddingVertical: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14, borderWidth: 1, marginRight: 8, justifyContent: 'center' },
  chipText: { fontSize: 13, fontWeight: '700' },
  balanceSubText: { fontWeight: '400', fontSize: 12, opacity: 0.8 },
  divider: { height: 1, marginVertical: 14 }
});