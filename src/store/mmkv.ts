import { StateStorage } from 'zustand/middleware';
import { createMMKV } from 'react-native-mmkv';

// Στην v4 χρησιμοποιούμε τη συνάρτηση createMMKV() αντί για το 'new MMKV()'
export const storage = createMMKV();

// Custom storage adapter για το Zustand Persist middleware
export const zustandStorage: StateStorage = {
  setItem: (name, value) => {
    return storage.set(name, value);
  },
  getItem: (name) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  removeItem: (name) => {
    // Στην v4 η μέθοδος .delete() μετονομάστηκε σε .remove()
    return storage.remove(name);
  },
};