import { Model } from '@nozbe/watermelondb';
import { field, date, children } from '@nozbe/watermelondb/decorators';

export default class Trip extends Model {
  static table = 'trips';

  static associations = {
    transactions: { type: 'has_many' as const, foreignKey: 'trip_id' },
  };

  @field('destination') destination!: string;
  @date('start_date') startDate!: Date;
  @date('end_date') endDate!: Date;
  @field('budget') budget?: number;

  @children('transactions') transactions!: any;
}