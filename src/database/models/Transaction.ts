import { Model } from '@nozbe/watermelondb';
import { field, date, relation } from '@nozbe/watermelondb/decorators';

export default class Transaction extends Model {
  static table = 'transactions';

  static associations = {
    wallets: { type: 'belongs_to' as const, key: 'wallet_id' },
  };

  @field('type') type!: 'income' | 'expense' | 'transfer';
  @field('amount') amount!: number;
  @field('category') category!: string;
  @date('date') date!: Date;
  @field('description') description?: string;
  @field('wallet_id') walletId!: string;
  @field('trip_id') tripId?: string; // 🛠️ Εδώ θα αποθηκεύεται το JSON stringified array

  @relation('wallets', 'wallet_id') wallet!: any;

  // 🛠️ GETTER: Επιστρέφει πάντα string array, κάνοντας parse το JSON με ασφάλεια
  get tripsIds(): string[] {
    if (!this.tripId) return [];
    try {
      const parsed = JSON.parse(this.tripId);
      return Array.isArray(parsed) ? parsed : [this.tripId];
    } catch {
      // Αν ήταν παλιό record με απλό string (π.χ. "trip_123"), το επιστρέφει ως array ενός στοιχείου
      return [this.tripId];
    }
  }
}