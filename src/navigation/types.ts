import { NavigatorScreenParams } from '@react-navigation/native';

// 1. Τύποι για τις οθόνες του Bottom Tab Navigation Bar
export type TabParamList = {
  Home: undefined;
  History: undefined;
  YearlySummaries: undefined;
  MoreModes: undefined;
  Settings: undefined;
};

// 2. Τύποι για τον κεντρικό Stack Navigator (Όλο το App + Modals)
export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<TabParamList>;
  LockScreen: undefined; // Οθόνη βιομετρικού ελέγχου (Fingerprint)
  
  // Πορτοφόλια
  Wallets: undefined;
  WalletDetail: { walletId: string };
  
  // Συναλλαγές (Modals / Καταγραφές)
  Income: undefined;
  Expense: undefined;
  Transfer: undefined;
  EditTransaction: { transactionId: string };
  
  // Αναφορές
  MonthlySummaries: { year: number; monthIndex: number };
  MonthlySummaryDetail: { year: number; month: number };
  
  // Στόχοι & Ταξίδια
  SavingGoalDetail: { goalId: string };
  SavingTransfer: { goalId: string };
  TripDetail: { tripId: string };
  
  // Επιπλέον Modes
  Own: undefined;
  FuelCalculator: undefined;
  SubscriptionManager: undefined;
  CategoryStatistics: undefined;
};