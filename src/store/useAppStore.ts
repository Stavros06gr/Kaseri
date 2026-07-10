import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from './mmkv';

// Ορισμός των τύπων για το State της εφαρμογής
interface AppState {
  language: 'en' | 'gr';
  currency: string;
  theme: 'light' | 'dark';
  hideBalance: boolean;
  trading212ApiKey: string | null;
  
  // Actions για την τροποποίηση του state
  setLanguage: (lang: 'en' | 'gr') => void;
  setCurrency: (currency: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleHideBalance: () => void;
  setTrading212ApiKey: (key: string | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Αρχικές / Default τιμές
      language: 'gr',
      currency: 'EUR',
      theme: 'light',
      hideBalance: false,
      trading212ApiKey: null,

      // Υλοποίηση των Actions
      setLanguage: (language) => set({ language }),
      setCurrency: (currency) => set({ currency }),
      setTheme: (theme) => set({ theme }),
      toggleHideBalance: () => set((state) => ({ hideBalance: !state.hideBalance })),
      setTrading212ApiKey: (trading212ApiKey) => set({ trading212ApiKey }),
    }),
    {
      name: 'kaseri-app-settings', // Το κλειδί με το οποίο θα αποθηκευτεί στο MMKV
      storage: createJSONStorage(() => zustandStorage), // Σύνδεση με το MMKV storage
    }
  )
);