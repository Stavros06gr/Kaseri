import { Model } from '@nozbe/watermelondb';
import { field, children } from '@nozbe/watermelondb/decorators';

export default class Wallet extends Model {
  static table = 'wallets';

  // Ορίζουμε τη σχέση: Ένα wallet έχει πολλές συναλλαγές (transactions)
  static associations = {
    transactions: { type: 'has_many' as const, foreignKey: 'wallet_id' },
  };

  @field('name') name!: string;
  @field('balance') balance!: number;
  @field('currency') currency!: string;
  @field('is_hidden') isHidden!: boolean;
  @field('is_trading212') isTrading212!: boolean;

  // Με αυτό μπορούμε να τραβήξουμε εύκολα όλες τις συναλλαγές του συγκεκριμένου wallet
  @children('transactions') transactions!: any;
}