import { Model } from '@nozbe/watermelondb';
import { field, date, relation } from '@nozbe/watermelondb/decorators';

export default class Transaction extends Model {
  static table = 'transactions';

  // Ορίζουμε ότι κάθε transaction ανήκει σε ένα συγκεκριμένο wallet
  static associations = {
    wallets: { type: 'belongs_to' as const, key: 'wallet_id' },
  };

  @field('type') type!: 'income' | 'expense' | 'transfer'; // Περιορίζουμε τους τύπους βάσει του πλάνου σου
  @field('amount') amount!: number;
  @field('category') category!: string;
  @date('date') date!: Date; // Η WatermelonDB το μετατρέπει αυτόματα από αριθμό σε Date object
  @field('description') description?: string;
  @field('wallet_id') walletId!: string;
  @field('trip_id') tripId?: string;

  // Μας επιτρέπει να κάνουμε π.χ. transaction.wallet.fetch() για να πάρουμε τις πληροφορίες του πορτοφολιού
  @relation('wallets', 'wallet_id') wallet!: any;
}