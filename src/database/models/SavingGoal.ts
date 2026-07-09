import { Model } from '@nozbe/watermelondb';
import { field, date, children } from '@nozbe/watermelondb/decorators';

export default class SavingGoal extends Model {
  static table = 'saving_goals';

  static associations = {
    saving_transfers: { type: 'has_many' as const, foreignKey: 'saving_goal_id' },
  };

  @field('title') title!: string;
  @field('target_amount') targetAmount!: number;
  @field('current_amount') currentAmount!: number;
  @date('target_date') targetDate?: Date;

  @children('saving_transfers') savingTransfers!: any;
}