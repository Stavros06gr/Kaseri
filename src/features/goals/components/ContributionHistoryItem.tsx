import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { ArrowUpRight, ArrowDownLeft, Wallet } from 'lucide-react-native'; // 👈 Εισαγωγή του Wallet Icon
import { format } from 'date-fns';
import { formatMoney } from '../../../utils/math';

interface Props {
  item: any;
  cardBg: string;
  isDark: boolean;
  subTextColor: string;
  currentLocale: any;
  currency: string;
  t: (key: string, defaultText: string) => string;
  walletName?: string; // 👈 1. Προσθήκη του walletName στα Props
}

export default function ContributionHistoryItem({ 
  item, 
  cardBg, 
  isDark, 
  subTextColor, 
  currentLocale, 
  currency, 
  t,
  walletName // 👈 2. Destructuring του walletName
}: Props) {
  const isDeposit = item.type === 'deposit';
  
  return (
    <Surface style={[styles.historyRow, { backgroundColor: cardBg }]} mode="flat">
      <View style={styles.historyLeft}>
        <View style={[styles.iconWrapper, { backgroundColor: isDeposit ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }]}>
          {isDeposit ? <ArrowUpRight size={16} color="#10B981" /> : <ArrowDownLeft size={16} color="#EF4444" />}
        </View>
        <View style={styles.textColumn}>
          <Text style={[styles.historyType, { color: isDark ? '#FFFFFF' : '#111827' }]}>
            {isDeposit ? t('goals.deposit', 'Deposit') : t('goals.withdraw', 'Withdrawal')}
          </Text>
          <Text style={[styles.historyDate, { color: subTextColor }]}>
            {item.date ? format(new Date(item.date), 'dd MMM yyyy, HH:mm', { locale: currentLocale }) : ''}
          </Text>

          {/* 🛠️ 3. WALLET BADGE: Εμφανίζεται κομψά ακριβώς κάτω από την ημερομηνία */}
          {walletName && (
            <View style={[styles.walletTag, { backgroundColor: isDark ? '#2D2D2D' : '#F3F4F6' }]}>
              <Wallet size={10} color={subTextColor} style={{ marginRight: 4 }} />
              <Text style={[styles.walletName, { color: subTextColor }]} numberOfLines={1}>
                {walletName}
              </Text>
            </View>
          )}
        </View>
      </View>
      <Text style={[styles.historyAmount, { color: isDeposit ? '#10B981' : '#EF4444' }]}>
        {isDeposit ? '+' : '-'} {formatMoney(item.amount)} {currency}
      </Text>
    </Surface>
  );
}

const styles = StyleSheet.create({
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 16, marginBottom: 8 },
  historyLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 },
  iconWrapper: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  textColumn: { flex: 1, alignItems: 'flex-start' }, // 👈 Εξασφαλίζει ότι το περιεχόμενο δεν θα σπρώξει το amount δεξιά
  historyType: { fontSize: 14, fontWeight: '600' },
  historyDate: { fontSize: 11, marginTop: 2 },
  historyAmount: { fontSize: 15, fontWeight: '700' },
  
  // 🛠️ Styles για το Wallet Badge
  walletTag: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    alignSelf: 'flex-start',
    paddingHorizontal: 8, 
    paddingVertical: 3, 
    borderRadius: 8,
    marginTop: 6
  },
  walletName: { fontSize: 10, fontWeight: '700', maxWidth: 120 }
});