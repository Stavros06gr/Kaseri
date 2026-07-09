import { Model } from '@nozbe/watermelondb';
import { field, date, relation } from '@nozbe/watermelondb/decorators';

export default class Subscription extends Model {
  static table = 'subscriptions';

  static associations = {
    wallets: { type: 'belongs_to' as const, key: 'wallet_id' },
  };

  @field('name') name!: string;
  @field('price') price!: number;
  @field('billing_cycle') billingCycle!: number; // σε ημέρες
  @date('next_billing_date') nextBillingDate!: Date;
  @field('wallet_id') walletId!: string;

  @relation('wallets', 'wallet_id') wallet!: any;
}