import { Model } from '@nozbe/watermelondb';
import { field, date, relation } from '@nozbe/watermelondb/decorators';

export default class Transfer extends Model {
  static table = 'transfers';

  static associations = {
    wallets: { type: 'belongs_to' as const, key: 'from_wallet' },
  };

  @field('from_wallet') fromWalletId!: string;
  @field('to_wallet') toWalletId!: string;
  @field('amount') amount!: number;
  @date('date') date!: Date;
  @field('description') description?: string;

  @relation('wallets', 'from_wallet') fromWallet!: any;
  @relation('wallets', 'to_wallet') toWallet!: any;
}