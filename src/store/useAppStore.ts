import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from './mmkv';

// Ορισμός του Interface για πλήρη υποστήριξη TypeScript
interface AppState {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  currency: string;
  setCurrency: (currency: string) => void;
  language: 'en' | 'gr';
  setLanguage: (language: 'en' | 'gr') => void;
  hideBalance: boolean;
  toggleHideBalance: () => void;
  
  // Νέες ιδιότητες για Security & API
  trading212Key: string;
  setTrading212Key: (key: string) => void;
  biometricsEnabled: boolean;
  toggleBiometrics: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Αρχικές τιμές (Defaults)[cite: 1]
      theme: 'light',
      currency: '€',
      language: 'gr',
      hideBalance: false,
      trading212Key: '',
      biometricsEnabled: false,

      // Actions / Setters[cite: 1]
      setTheme: (theme) => set({ theme }),
      setCurrency: (currency) => set({ currency }),
      setLanguage: (language) => set({ language }),
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