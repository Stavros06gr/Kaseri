import { Model } from '@nozbe/watermelondb';
import { field, date, relation } from '@nozbe/watermelondb/decorators';

export default class SavingTransfer extends Model {
  static table = 'saving_transfers';

  static associations = {
    saving_goals: { type: 'belongs_to' as const, key: 'saving_goal_id' },
    wallets: { type: 'belongs_to' as const, key: 'wallet_id' },
  };

  @field('saving_goal_id') savingGoalId!: string;
  @field('wallet_id') walletId!: string;
  @field('type') type!: 'add' | 'remove';
  @field('amount') amount!: number;
  @date('date') date!: Date;

  @relation('saving_goals', 'saving_goal_id') savingGoal!: any;
  @relation('wallets', 'wallet_id') wallet!: any;
}