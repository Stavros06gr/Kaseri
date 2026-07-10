import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, FlatList } from 'react-native';
import { Text, Surface, Portal, Dialog, TextInput, Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Wallet, Plus, Eye, EyeOff, ChevronRight } from 'lucide-react-native';

import { database } from '../../database';
import { useAppStore } from '../../store/useAppStore';
import { RootStackParamList } from '../../navigation/types';
import { formatMoney } from '../../utils/math';
import WalletModel from '../../database/models/Wallet';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

export default function WalletsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();

  const { currency, theme } = useAppStore();
  const isDark = theme === 'dark';

  // States
  const [wallets, setWallets] = useState<WalletModel[]>([]);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [newWalletName, setNewWalletName] = useState('');
  const [newWalletBalance, setNewWalletBalance] = useState('');

  useEffect(() => {
    if (isFocused) {
      loadWallets();
    }
  }, [isFocused]);

  const loadWallets = async () => {
    try {
      const walletRecords = (await database.get('wallets').query().fetch()) as WalletModel[];
      setWallets(walletRecords);
    } catch (error) {
      console.error('Error loading wallets:', error);
    }
  };

  // Εναλλαγή ορατότητας (Hide/Unhide) απευθείας από τη λίστα
  const handleToggleHideWallet = async (wallet: WalletModel) => {
    try {
      await database.write(async () => {
        await wallet.update((w: any) => {
          w.isHidden = !w.isHidden;
        });
      });
      loadWallets(); // Άμεση ανανέωση της λίστας στην οθόνη
    } catch (error) {
      console.error('Failed to toggle wallet visibility:', error);
    }
  };

  // Δημιουργία Νέου Πορτοφολιού
  const handleAddWallet = async () => {
    if (!newWalletName.trim()) return;

    try {
      const initialBalance = parseFloat(newWalletBalance) || 0;

      await database.write(async () => {
        await database.get('wallets').create((wallet: any) => {
          wallet.name = newWalletName.trim();
          wallet.balance = initialBalance;
          wallet.currency = currency;
          wallet.isHidden = false;
          wallet.isTrading212 = false;
        });
      });

      setNewWalletName('');
      setNewWalletBalance('');
      setIsDialogVisible(false);
      loadWallets();
    } catch (error) {
      console.error('Failed to create wallet:', error);
    }
  };

  const dynamicStyles = {
    bg: { backgroundColor: isDark ? '#121212' : '#F9FAFB' },
    card: { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' },
    textMain: { color: isDark ? '#FFFFFF' : '#111827' },
    textMuted: { color: isDark ? '#9CA3AF' : '#6B7280' },
    dialogBg: { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }
  };

  return (
    <View style={[styles.container, dynamicStyles.bg, { paddingTop: insets.top + 16 }]}>
      
      {/* HEADER ROW */}
      <View style={styles.headerRow}>
        <Text style={[styles.screenTitle, dynamicStyles.textMain]}>{t('wallets.title', 'Wallets')}</Text>
        <TouchableOpacity 
          style={styles.fabButton} 
          onPress={() => setIsDialogVisible(true)}
          activeOpacity={0.8}
        >
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* WALLETS LIST */}
      <FlatList
        data={wallets}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Surface style={[styles.walletCard, dynamicStyles.card]} mode="flat">
            <View style={styles.cardContentRow}>
              
              {/* Αριστερό Κομμάτι: Πληροφορίες & Πλοήγηση */}
              <TouchableOpacity 
                style={styles.infoTouchArea}
                onPress={() => navigation.navigate('WalletDetail', { walletId: item.id })}
                activeOpacity={0.7}
              >
                <View style={styles.iconWrapper}>
                  <Wallet size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                </View>
                <View style={styles.textContainer}>
                  <Text style={[styles.walletName, dynamicStyles.textMain]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={[styles.walletBalance, dynamicStyles.textMuted]}>
                    {item.isHidden ? '••••••' : `${formatMoney(item.balance)} ${currency}`}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Δεξί Κομμάτι: Αυτόνομα Κουμπιά Ενεργειών */}
              <View style={styles.actionsRow}>
                <TouchableOpacity 
                  onPress={() => handleToggleHideWallet(item)} 
                  hitSlop={12} 
                  style={styles.actionButton}
                >
                  {item.isHidden ? (
                    <EyeOff size={18} color="#EF4444" /> // Κόκκινο όταν είναι κλειστό/κρυφό
                  ) : (
                    <Eye size={18} color={isDark ? '#9CA3AF' : '#6B7280'} />
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={() => navigation.navigate('WalletDetail', { walletId: item.id })}
                  style={styles.chevronButton}
                >
                  <ChevronRight size={16} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

            </View>
          </Surface>
        )}
      />

      {/* POP-UP DIALOG ΓΙΑ ΠΡΟΣΘΗΚΗ ΠΟΡΤΟΦΟΛΙΟΥ */}
      <Portal>
        <Dialog 
          visible={isDialogVisible} 
          onDismiss={() => setIsDialogVisible(false)}
          style={dynamicStyles.dialogBg}
        >
          <Dialog.Title style={dynamicStyles.textMain}>{t('wallets.addWallet', 'Add Wallet')}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label={t('wallets.walletName', 'Wallet Name')}
              value={newWalletName}
              onChangeText={setNewWalletName}
              mode="outlined"
              style={styles.input}
              outlineColor={isDark ? '#2D2D2D' : '#E5E7EB'}
              activeOutlineColor="#2563EB"
              textColor={dynamicStyles.textMain.color}
            />
            <TextInput
              label={t('wallets.initialBalance', 'Initial Balance')}
              value={newWalletBalance}
              onChangeText={setNewWalletBalance}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
              outlineColor={isDark ? '#2D2D2D' : '#E5E7EB'}
              activeOutlineColor="#2563EB"
              textColor={dynamicStyles.textMain.color}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIsDialogVisible(false)} textColor="#EF4444">Cancel</Button>
            <Button onPress={handleAddWallet} textColor="#2563EB" disabled={!newWalletName.trim()}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  fabButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  walletCard: {
    borderRadius: 18,
    marginBottom: 12,
    width: '100%',
  },
  cardContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  infoTouchArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
  },
  walletName: {
    fontSize: 15,
    fontWeight: '600',
  },
  walletBalance: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginRight: 4,
  },
  chevronButton: {
    paddingVertical: 8,
    paddingLeft: 4,
  },
  input: {
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
});