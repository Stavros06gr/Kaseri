import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import i18n from 'i18next'; // Εισαγωγή του i18next για τον συγχρονισμό
import { zustandStorage } from './mmkv';

// 🛠️ Ορισμός των υποστηριζόμενων γλωσσών ως Type
export type AppLanguage = 'en' | 'gr' | 'de' | 'es' | 'pt';

// Ορισμός του Interface για πλήρη υποστήριξη TypeScript
interface AppState {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  currency: string;
  setCurrency: (currency: string) => void;
  language: AppLanguage; 
  setLanguage: (language: AppLanguage) => Promise<void>; 
  hideBalance: boolean;
  toggleHideBalance: () => void;
  
  // Νέες ιδιότητες για Security & API
  trading212Key: string;
  setTrading212Key: (key: string) => void;
  biometricsEnabled: boolean;
  toggleBiometrics: () => void;
}

// 🔒 Static lock για να αποφεύγονται race conditions
let isLangLockActive = false;

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Αρχικές τιμές (Defaults)
      theme: 'light',
      currency: '€',
      language: 'en', 
      hideBalance: false,
      trading212Key: '',
      biometricsEnabled: false,

      // Actions / Setters
      setTheme: (theme) => set({ theme }),
      setCurrency: (currency) => set({ currency }),
      
      // Ασφαλές Ασύγχρονο Set Language
      setLanguage: async (language) => {
        if (isLangLockActive) return; 
        
        isLangLockActive = true;
        try {
          // Αντιστοίχιση: Το 'gr' γίνεται 'el' στο i18n, τα υπόλοιπα περνάνε κανονικά
          const i18nCode = language === 'gr' ? 'el' : language;
          
          await i18n.changeLanguage(i18nCode);
          set({ language });
        } catch (error) {
          console.error('Failed to change language:', error);
        } finally {
          isLangLockActive = false; 
        }
      },

      toggleHideBalance: () => set((state) => ({ hideBalance: !state.hideBalance })),
      setTrading212Key: (trading212Key) => set({ trading212Key }),
      toggleBiometrics: () => set((state) => ({ biometricsEnabled: !state.biometricsEnabled })),
    }),
    {
      name: 'kaseri-app-storage', 
      storage: createJSONStorage(() => zustandStorage), 
    }
  )
);