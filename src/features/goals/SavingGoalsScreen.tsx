import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, Alert } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Target as TargetIcon } from 'lucide-react-native';
import { el, enUS } from 'date-fns/locale';

import { database } from '../../database';
import { useAppStore } from '../../store/useAppStore';

// Components
import SavingGoalsHeader from './components/SavingGoalsHeader';
import SavingGoalCard from './components/SavingGoalCard';
import AddGoalModal from './components/AddGoalModal'; // 👈 Εισαγωγή του νέου component

export default function SavingGoalsScreen() {
  const { t } = useTranslation();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();

  const { currency, theme, language } = useAppStore();
  const isDark = theme === 'dark';
  const currentLocale = language === 'gr' ? el : enUS;

  // Data & Modal Visibility States
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState<any[]>([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  useEffect(() => {
    if (isFocused) {
      loadGoals();
    }
  }, [isFocused]);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const fetchedGoals = await database.get('saving_goals').query().fetch();
      
      /* 🛠️ Η ΠΡΟΣΘΗΚΗ: Ταξινόμηση σε αύξουσα σειρά (πιο κοντινή ημερομηνία λήξης πρώτα) */
      const sortedGoals = fetchedGoals.sort((a: any, b: any) => a.targetDate - b.targetDate);
      
      setGoals(sortedGoals);
    } catch (error) {
      console.error('Failed to load saving goals:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🛠️ Η συνάρτηση δέχεται πλέον τα έτοιμα δεδομένα από το Modal component
  const handleCreateGoal = async (name: string, targetAmount: number, targetDate: Date) => {
    try {
      await database.write(async () => {
        await database.get('saving_goals').create((goal: any) => {
          goal.name = name;
          goal.targetAmount = targetAmount;
          goal.currentAmount = 0;
          goal.targetDate = targetDate.getTime();
        });
      });

      setIsAddModalVisible(false);
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

      {/* 🛠️ Rendering του νέου Modular Component */}
      <AddGoalModal 
        visible={isAddModalVisible}
        onDismiss={() => setIsAddModalVisible(false)}
        onCreate={handleCreateGoal}
        currency={currency}
        isDark={isDark}
        currentLocale={currentLocale}
        t={t}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingBottom: 40 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 40 },
  emptyText: { fontSize: 14, fontWeight: '500', textAlign: 'center', paddingHorizontal: 20 }
});