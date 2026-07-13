import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Surface, Button } from 'react-native-paper';
import { Calendar } from 'lucide-react-native';
import { format } from 'date-fns';

interface Props {
  cardBg: string;
  textColor: string;
  isDark: boolean;
  date: Date;
  currentLocale: any;
  onPress: () => void;
}

export default function DatePickerRow({ cardBg, textColor, isDark, date, currentLocale, onPress }: Props) {
  return (
    <Surface style={[styles.card, { backgroundColor: cardBg }]} mode="flat">
      <View style={styles.inputRow}>
        <Calendar size={20} color={isDark ? '#9CA3AF' : '#6B7280'} style={{ marginRight: 12 }} />
        <Button 
          mode="outlined" 
          onPress={onPress}
          /* 🛠️ Η ΔΙΟΡΘΩΣΗ: Αφαιρέθηκε το outlineStyle, το borderRadius εφαρμόζεται αυτόματα από το styles.dateBtn */
          style={styles.dateBtn}
          textColor={textColor}
        >
          {format(date, 'dd MMMM yyyy', { locale: currentLocale })}
        </Button>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: 24, marginBottom: 14 },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  /* Το borderRadius: 14 εδώ μέσα φτιάχνει τέλεια και το outline περίγραμμα! */
  dateBtn: { flex: 1, borderRadius: 14, justifyContent: 'center', height: 46 }
});