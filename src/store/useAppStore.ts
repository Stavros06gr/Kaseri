import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import i18n from 'i18next'; // 👈 Εισαγωγή του i18next για τον συγχρονισμό
import { zustandStorage } from './mmkv';

// Ορισμός του Interface για πλήρη υποστήριξη TypeScript
interface AppState {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  currency: string;
  setCurrency: (currency: string) => void;
  language: 'en' | 'gr';
  setLanguage: (language: 'en' | 'gr') => Promise<void>; // 👈 Μετατράπηκε σε Promise/Async για ασφάλεια
  hideBalance: boolean;
  toggleHideBalance: () => void;
  
  // Νέες ιδιότητες για Security & API
  trading212Key: string;
  setTrading212Key: (key: string) => void;
  biometricsEnabled: boolean;
  toggleBiometrics: () => void;
}

// 🔒 Static lock για να αγνοούνται ακαριαία τα spams/διπλά κλικ πριν ξεκινήσει το re-render
let isLangLockActive = false;

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Αρχικές τιμές (Defaults)
      theme: 'light',
      currency: '€',
      language: 'en', // 👈 Αλλαγή σε English ως default γλώσσα της εφαρμογής
      hideBalance: false,
      trading212Key: '',
      biometricsEnabled: false,

      // Actions / Setters
      setTheme: (theme) => set({ theme }),
      setCurrency: (currency) => set({ currency }),
      
      // Ασφαλές Ασύγχρονο Set Language με προστασία από Race Conditions
      setLanguage: async (language) => {
        if (isLangLockActive) return; // Αν εκτελείται ήδη αλλαγή, μπλόκαρε το επόμενο κλικ
        
        isLangLockActive = true;
        try {
          // 1. Περιμένουμε το i18next να αλλάξει επιτυχώς τα εσωτερικά localization αρχεία
          await i18n.changeLanguage(language);
          
          // 2. Μόνο αφού ολοκληρωθεί η ασύγχρονη αλλαγή, ενημερώνουμε το state και το MMKV
          set({ language });
        } catch (error) {
          console.error('Failed to change language:', error);
        } finally {
          isLangLockActive = false; // Ξεκλείδωμα
        }
      },

      toggleHideBalance: () => set((state) => ({ hideBalance: !state.hideBalance })),
      setTrading212Key: (trading212Key) => set({ trading212Key }),
      toggleBiometrics: () => set((state) => ({ biometricsEnabled: !state.biometricsEnabled })),
    }),
    {
      name: 'kaseri-app-storage', // Μοναδικό όνομα για το MMKV storage key
      storage: createJSONStorage(() => zustandStorage), // Σύνδεση με το MMKV adapter μας
    }
  )
);