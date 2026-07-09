import { appSchema, tableSchema } from '@nozbe/watermelondb';

export default appSchema({
  version: 1,
  tables: [
    // 1. WALLETS TABLE
    tableSchema({
      name: 'wallets',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'balance', type: 'number' },
        { name: 'currency', type: 'string' },
        { name: 'is_hidden', type: 'boolean' },
        { name: 'is_trading212', type: 'boolean' },
      ],
    }),

    // 2. TRANSACTIONS TABLE
    tableSchema({
      name: 'transactions',
      columns: [
        { name: 'type', type: 'string' }, // "income", "expense", "transfer"
        { name: 'wallet_id', type: 'string', isIndexed: true },
        { name: 'amount', type: 'number' },
        { name: 'category', type: 'string' },
        { name: 'date', type: 'number' }, // Unix Timestamp
        { name: 'description', type: 'string', isOptional: true },
        { name: 'trip_id', type: 'string', isOptional: true, isIndexed: true },
      ],
    }),

    // 3. TRANSFERS TABLE
    tableSchema({
      name: 'transfers',
      columns: [
        { name: 'from_wallet', type: 'string', isIndexed: true },
        { name: 'to_wallet', type: 'string', isIndexed: true },
        { name: 'amount', type: 'number' },
        { name: 'date', type: 'number' }, // Unix Timestamp
        { name: 'description', type: 'string', isOptional: true },
      ],
    }),

    // 4. SAVING GOALS TABLE
    tableSchema({
      name: 'saving_goals',
      columns: [
        { name: 'title', type: 'string' },
        { name: 'target_amount', type: 'number' },
        { name: 'current_amount', type: 'number' },
        { name: 'target_date', type: 'number', isOptional: true }, // Unix Timestamp
      ],
    }),

    // 5. SAVING TRANSFERS TABLE
    tableSchema({
      name: 'saving_transfers',
      columns: [
        { name: 'saving_goal_id', type: 'string', isIndexed: true },
        { name: 'wallet_id', type: 'string', isIndexed: true },
        { name: 'type', type: 'string' }, // "add" or "remove"
        { name: 'amount', type: 'number' },
        { name: 'date', type: 'number' }, // Unix Timestamp
      ],
    }),

    // 6. TRIPS TABLE
    tableSchema({
      name: 'trips',
      columns: [
        { name: 'destination', type: 'string' },
        { name: 'start_date', type: 'number' }, // Unix Timestamp
        { name: 'end_date', type: 'number' },   // Unix Timestamp
        { name: 'budget', type: 'number', isOptional: true },
      ],
    }),

    // 7. DEBTS TABLE
    tableSchema({
      name: 'debts',
      columns: [
        { name: 'person_name', type: 'string' },
        { name: 'amount', type: 'number' },
        { name: 'type', type: 'string' }, // "i_owe" or "owes_me"
        { name: 'is_resolved', type: 'boolean' },
      ],
    }),

    // 8. SUBSCRIPTIONS TABLE
    tableSchema({
      name: 'subscriptions',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'price', type: 'number' },
        { name: 'billing_cycle', type: 'number' }, // days
        { name: 'next_billing_date', type: 'number' }, // Unix Timestamp
        { name: 'wallet_id', type: 'string', isIndexed: true },
      ],
    }),
  ],
});