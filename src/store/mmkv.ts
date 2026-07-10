// import { MMKV } from 'react-native-mmkv';
const { MMKV } = require('react-native-mmkv');
import { StateStorage } from 'zustand/middleware';

// Δημιουργία του κεντρικού instance για το MMKV
export const storage = new MMKV();

// Custom adapter ώστε το Zustand να μπορεί να διαβάζει/γράφει στο MMKV
export const zustandStorage: StateStorage = {
  setItem: (name, value) => {
    return storage.set(name, value);
  },
  getItem: (name) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  removeItem: (name) => {
    return storage.delete(name);
  },
};