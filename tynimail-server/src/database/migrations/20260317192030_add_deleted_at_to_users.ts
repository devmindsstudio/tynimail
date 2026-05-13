import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasColumn = await knex.schema.hasColumn('tbl_users', 'deleted_at');

  if (hasColumn) {
    console.log('Column deleted_at already exists on tbl_users, skipping...');
    return;
  }

  await knex.schema.alterTable('tbl_users', (table) => {
    table.timestamp('deleted_at').nullable();
  });
  console.log('✅ Added deleted_at column in tbl_users');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('tbl_users', (table) => {
    table.dropColumn('deleted_at');
  });
  console.log('⏪ Dropped deleted_at column in tbl_users');
}
