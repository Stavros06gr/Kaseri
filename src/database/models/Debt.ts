import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export default class Debt extends Model {
  static table = 'debts';

  @field('person_name') personName!: string;
  @field('amount') amount!: number;
  @field('type') type!: 'i_owe' | 'owes_me';
  @field('is_resolved') isResolved!: boolean;
}