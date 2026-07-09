import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import schema from './schema';
import Wallet from './models/Wallet';
import Transaction from './models/Transaction';
import Transfer from './models/Transfer';
import SavingGoal from './models/SavingGoal';
import SavingTransfer from './models/SavingTransfer';
import Trip from './models/Trip';
import Debt from './models/Debt';
import Subscription from './models/Subscription';

const adapter = new SQLiteAdapter({
  schema,
  jsi: false, // Το αφήνουμε false για να μην βγάζει warnings στο Bridgeless
  onSetUpError: (error) => {
    console.error('Σφάλμα κατά την αρχικοποίηση της βάσης δεδομένων:', error);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [
    Wallet,
    Transaction,
    Transfer,
    SavingGoal,
    SavingTransfer,
    Trip,
    Debt,
    Subscription,
  ],
});