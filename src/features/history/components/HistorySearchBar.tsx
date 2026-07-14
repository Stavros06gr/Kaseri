import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Searchbar } from 'react-native-paper';
import { Search, X } from 'lucide-react-native';

interface Props {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  placeholder: string;
  isDark: boolean;
}

export default function HistorySearchBar({ searchQuery, setSearchQuery, placeholder, isDark }: Props) {
  return (
    <View style={styles.container}>
      <Searchbar
        placeholder={placeholder}
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={[styles.searchBar, { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }]}
        placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
        
        // 🛠️ ΔΙΟΡΘΩΣΗ: Προσθήκη ευθυγράμμισης στο inputStyle
        inputStyle={{ 
          color: isDark ? '#FFFFFF' : '#111827',
          fontSize: 15,
          minHeight: 0,        // 👈 Αποτρέπει το Android από το να επιβάλλει δικό του ελάχιστο ύψος
          alignSelf: 'center', // 👈 Κεντράρει το κείμενο απόλυτα κάθετα μέσα στον container
          paddingVertical: 0,  // 👈 Αφαιρεί τα default paddings που χαλάνε το alignment
        }}
        
        /* Ρητή απόδοση Lucide Icon για εγγυημένη εμφάνιση */
        icon={({ size }) => <Search size={18} color={isDark ? '#9CA3AF' : '#6B7280'} />}
        clearIcon={({ size }) => <X size={18} color={isDark ? '#9CA3AF' : '#6B7280'} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, marginBottom: 12 },
  searchBar: { 
    borderRadius: 14, 
    height: 46, 
    elevation: 0,
    justifyContent: 'center', // 👈 Εξασφαλίζει ότι και ο εξωτερικός container κεντράρει τα παιδιά του
  },
});