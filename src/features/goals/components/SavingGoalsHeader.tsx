import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { Target, Plus } from 'lucide-react-native';

interface Props {
  title: string;
  addLabel: string;
  onAddPress: () => void;
  isDark: boolean;
}

export default function SavingGoalsHeader({ title, addLabel, onAddPress, isDark }: Props) {
  const { width: screenWidth } = useWindowDimensions();
  
  // Responsive: Αν η οθόνη είναι πολύ μικρή (π.χ. iPhone SE), κρύβουμε το κείμενο 
  // και αφήνουμε μόνο το "+" icon για να μην στριμωχτούν τα πάντα.
  const isSmallScreen = screenWidth < 375; 

  return (
    <View style={styles.headerRow}>
      
      {/* LEFT SECTION: Icon & Title */}
      <View style={styles.headerLeft}>
        <View style={styles.iconBadge}>
          <Target size={20} color="#2563EB" />
        </View>
        <Text 
          numberOfLines={1}             // 👈 1. Κλειδώνει αυστηρά σε μία γραμμή
          adjustsFontSizeToFit          // 👈 2. Μικραίνει αυτόματα το μέγεθος της γραμματοσειράς
          minimumFontScale={0.7}        // 👈 3. Μέχρι 30% μικρότερο (ώστε να παραμένει ευανάγνωστο)
          style={[styles.screenTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}
        >
          {title}
        </Text>
      </View>

      {/* RIGHT SECTION: Add Button */}
      <Button 
        mode="contained" 
        onPress={onAddPress}
        buttonColor="#2563EB"
        textColor="#FFFFFF"
        style={styles.addBtn}
        labelStyle={styles.addBtnLabel}
        compact={isSmallScreen}
        icon={() => <Plus size={16} color="#FFFFFF" />}
      >
        {!isSmallScreen ? addLabel : ''}
      </Button>

    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    marginBottom: 20,
    width: '100%' 
  },
  headerLeft: { 
    flexDirection: 'row', 
    alignItems: 'center',
    flex: 1,            // 👈 ΚΡΙΣΙΜΟ: Παίρνει όλο τον ελεύθερο χώρο και σταματάει ακριβώς πριν το κουμπί
    marginRight: 12,    // Απόσταση ασφαλείας για να μην κολλάνε μεταξύ τους
  },
  iconBadge: { 
    width: 36, 
    height: 36, 
    borderRadius: 10, 
    backgroundColor: 'rgba(37, 99, 235, 0.1)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 12 
  },
  screenTitle: { 
    fontSize: 22, 
    fontWeight: '700', 
    letterSpacing: -0.5,
    flex: 1,            // 👈 Επιτρέπει στο κείμενο να συρρικνωθεί σωστά μέσα στον flex container
  },
  addBtn: { 
    borderRadius: 12, 
    paddingHorizontal: 4,
    maxWidth: 150,      // 👈 Όριο πλάτους για να μην εξαφανίσει τον τίτλο σε τεράστιες λέξεις
  },
  addBtnLabel: { 
    fontSize: 13, 
    fontWeight: '600' 
  }
});