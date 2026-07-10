import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { format } from 'date-fns';
import { el, enUS } from 'date-fns/locale';
import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight } from 'lucide-react-native';
import { formatMoney } from '../../../utils/math';
import TransactionModel from '../../../database/models/Transaction';

interface Props {
  item: TransactionModel;
  hideBalance: boolean;
  currency: string;
  lang: 'en' | 'gr';
  isDark: boolean;
  onPress: () => void;
}

export default function TransactionItem({ item, hideBalance, currency, lang, isDark, onPress }: Props) {
  // Έξυπνος διαχωρισμός βάσει τύπου ΚΑΙ κατεύθυνσης χρημάτων (Double-Entry)
  const isIncome = item.type === 'income' || (item.type === 'transfer' && item.amount > 0);
  const isExpense = item.type === 'expense' || (item.type === 'transfer' && item.amount < 0);
  
  const currentLocale = lang === 'gr' ? el : enUS;
  const formattedDate = format(new Date(item.date), 'dd MMM yyyy, HH:mm', { locale: currentLocale });

  // Δυναμικά χρώματα και σύμβολα
  const amountColor = isIncome ? '#10B981' : isExpense ? '#EF4444' : '#6B7280';
  const badgeBgColor = isIncome ? '#E6F4EA' : isExpense ? '#FCE8E6' : '#F3F4F6';
  const sign = isIncome ? '+' : isExpense ? '-' : '';

  // Παίρνουμε την απόλυτη τιμή για να μην μπερδευτεί το string formatting με τα μείον της βάσης
  const absoluteAmount = Math.abs(item.amount);

  return (
    <TouchableOpacity style={styles.rowWrapper} onPress={onPress} activeOpacity={0.7}>
      
      {/* ICON BADGE */}
      <View style={[styles.iconWrapper, { backgroundColor: badgeBgColor }]}>
        {item.type === 'income' && <ArrowDownLeft size={18} color="#10B981" />}
        {item.type === 'expense' && <ArrowUpRight size={18} color="#EF4444" />}
        {/* Για τις μεταφορές κρατάμε το δικό τους εικονίδιο, αλλά αλλάζει χρώμα ανάλογα αν μπαίνουν ή βγαίνουν λεφτά */}
        {item.type === 'transfer' && <ArrowLeftRight size={18} color={amountColor} />}
      </View>

      {/* TRANSACTION DETAILS */}
      <View style={styles.textDetails}>
        <Text style={[styles.categoryText, { color: isDark ? '#FFFFFF' : '#111827' }]} numberOfLines={1}>
          {item.category || item.type.toUpperCase()}
        </Text>
        {item.description ? (
          <Text style={styles.descText} numberOfLines={1}>{item.description}</Text>
        ) : null}
        <Text style={styles.dateText}>{formattedDate}</Text>
      </View>

      {/* AMOUNT DISPLAY */}
      <View style={styles.amountWrapper}>
        <Text style={[styles.amountText, { color: amountColor }]}>
          {hideBalance ? '•••' : `${sign}${formatMoney(absoluteAmount)} ${currency}`}
        </Text>
      </View>
      
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  rowWrapper: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 4 },
  iconWrapper: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  textDetails: { flex: 1, justifyContent: 'center' },
  categoryText: { fontSize: 15, fontWeight: '600' },
  descText: { fontSize: 13, color: '#9CA3AF', marginTop: 1 },
  dateText: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  amountWrapper: { alignItems: 'flex-end', justifyContent: 'center' },
  amountText: { fontSize: 15, fontWeight: '700' }
});