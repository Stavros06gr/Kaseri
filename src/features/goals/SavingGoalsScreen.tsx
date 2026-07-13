import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, Alert } from 'react-native';
import { Text, ActivityIndicator, Portal, Dialog, TextInput, Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Target as TargetIcon } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns'; // 👈 Εισαγωγή format
import { el, enUS } from 'date-fns/locale'; // 👈 Εισαγωγή locales

import { database } from '../../database';
import { useAppStore } from '../../store/useAppStore';

// Components
import SavingGoalsHeader from './components/SavingGoalsHeader';
import SavingGoalCard from './components/SavingGoalCard';

export default function SavingGoalsScreen() {
  const { t } = useTranslation();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();

  const { currency, theme, language } = useAppStore();
  const isDark = theme === 'dark';
  const currentLocale = language === 'gr' ? el : enUS; // 👈 Ορισμός Locale

  // Data States
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState<any[]>([]);

  // Add Goal Modal States
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newDate, setNewDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (isFocused) {
      loadGoals();
    }
  }, [isFocused]);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const fetchedGoals = await database.get('saving_goals').query().fetch();
      setGoals(fetchedGoals);
    } catch (error) {
      console.error('Failed to load saving goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async () => {
    const parsedTarget = parseFloat(newTarget);
    if (!newName.trim() || isNaN(parsedTarget) || parsedTarget <= 0) {
      Alert.alert('Error', t('goals.invalidFields', 'Please enter a valid name and target amount'));
      return;
    }

    try {
      await database.write(async () => {
        await database.get('saving_goals').create((goal: any) => {
          goal.name = newName.trim();
          goal.targetAmount = parsedTarget;
          goal.currentAmount = 0;
          goal.targetDate = newDate.getTime();
        });
      });

      setIsAddModalVisible(false);
      setNewName('');
      setNewTarget('');
      setNewDate(new Date());
      loadGoals();
    } catch (error) {
      console.error('Failed to create goal:', error);
    }
  };

  const handleUpdateAmount = async (id: string, type: 'deposit' | 'withdraw') => {
    Alert.prompt(
      type === 'deposit' ? t('goals.addFunds', 'Add Funds') : t('goals.withdrawFunds', 'Withdraw Funds'),
      t('goals.enterAmount', 'Enter the amount:'),
      async (val) => {
        const amt = parseFloat(val);
        if (isNaN(amt) || amt <= 0) return;

        try {
          await database.write(async () => {
            const goal = await database.get('saving_goals').find(id);
            await goal.update((g: any) => {
              if (type === 'deposit') {
                g.currentAmount += amt;
              } else {
                g.currentAmount = Math.max(g.currentAmount - amt, 0);
              }
            });
          });
          loadGoals();
        } catch (error) {
          console.error('Failed to update goal amount:', error);
        }
      },
      'plain-text',
      '',
      'numeric'
    );
  };

  const handleDeleteGoal = async (id: string) => {
    Alert.alert(
      t('goals.deleteTitle', 'Delete Goal'),
      t('goals.deleteConfirm', 'Are you sure you want to permanently remove this saving goal?'),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: 'OK',
          style: 'destructive',
          onPress: async () => {
            try {
              await database.write(async () => {
                const goal = await database.get('saving_goals').find(id);
                await goal.destroyPermanently();
              });
              loadGoals();
            } catch (error) {
              console.error('Failed to delete goal:', error);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F9FAFB', paddingTop: insets.top + 16 }]}>
      
      <SavingGoalsHeader 
        title={t('goals.title', 'Savings')}
        addLabel={t('goals.newBtn', 'New')}
        onAddPress={() => setIsAddModalVisible(true)}
        isDark={isDark}
      />

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator animating={true} color="#2563EB" size="large" />
        </View>
      ) : (
        <FlatList
          data={goals}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <TargetIcon size={44} color={isDark ? '#374151' : '#D1D5DB'} style={{ marginBottom: 10 }} />
              <Text style={[styles.emptyText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                {t('goals.emptyState', 'No savings goals set yet. Build your first vault now!')}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <SavingGoalCard 
              goal={item}
              currency={currency}
              language={language}
              isDark={isDark}
              onDeposit={(id) => handleUpdateAmount(id, 'deposit')}
              onWithdraw={(id) => handleUpdateAmount(id, 'withdraw')}
              onDelete={handleDeleteGoal}
              t={t}
            />
          )}
        />
      )}

      {/* ➕ ADD GOAL MODAL DIALOG */}
      <Portal>
        <Dialog visible={isAddModalVisible} onDismiss={() => setIsAddModalVisible(false)} style={{ backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF', borderRadius: 24 }}>
          <Dialog.Title style={{ color: isDark ? '#FFFFFF' : '#111827', fontWeight: '700' }}>
            {t('goals.createTitle', 'Create Saving Goal')}
          </Dialog.Title>
          <Dialog.Content>
            <TextInput
              label={t('goals.namePlaceholder', 'Goal Name (e.g. Vacation)')}
              value={newName}
              onChangeText={setNewName}
              mode="outlined"
              style={styles.input}
              activeOutlineColor="#2563EB"
              textColor={isDark ? '#FFFFFF' : '#111827'}
            />
            <TextInput
              label={`${t('goals.targetPlaceholder', 'Target Amount')} (${currency})`}
              value={newTarget}
              onChangeText={setNewTarget}
              keyboardType="numeric"
              mode="outlined"
              style={[styles.input, { marginTop: 12 }]}
              activeOutlineColor="#2563EB"
              textColor={isDark ? '#FFFFFF' : '#111827'}
            />
            
            {/* 🛠️ Δυναμικό Κουμπί Ημερομηνίας που αλλάζει όπως στις συναλλαγές */}
            <Button 
              mode="outlined" 
              onPress={() => setShowDatePicker(true)}
              style={[styles.datePickerBtn, { borderColor: isDark ? '#4B5563' : '#D1D5DB' }]}
              textColor={isDark ? '#FFFFFF' : '#111827'}
            >
              {format(newDate, 'dd MMMM yyyy', { locale: currentLocale })}
            </Button>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIsAddModalVisible(false)} textColor={isDark ? '#9CA3AF' : '#6B7280'}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button onPress={handleCreateGoal} textColor="#2563EB" labelStyle={{ fontWeight: '700' }} disabled={!newName || !newTarget}>
              {t('common.create', 'Create')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {showDatePicker && (
        <DateTimePicker
          value={newDate}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onValueChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setNewDate(selectedDate);
          }}
          onDismiss={() => setShowDatePicker(false)}
        />
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingBottom: 40 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 40 },
  emptyText: { fontSize: 14, fontWeight: '500', textAlign: 'center', paddingHorizontal: 20 },
  input: { backgroundColor: 'transparent' },
  datePickerBtn: { marginTop: 16, borderRadius: 12, height: 48, justifyContent: 'center' }
});