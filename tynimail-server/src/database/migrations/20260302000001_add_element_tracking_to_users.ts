import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasColumn = await knex.schema.hasColumn('tbl_users', 'element_tracking_enabled');

  if (hasColumn) {
    console.log('Column element_tracking_enabled already exists on tbl_users, skipping...');
    return;
  }

  await knex.schema.alterTable('tbl_users', (table) => {
    // Nullable — no default — to avoid breaking existing rows or other devs' queries.
    // Treat null as false in application code.
    table.boolean('element_tracking_enabled').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('tbl_users', (table) => {
    table.dropColumn('element_tracking_enabled');
  });
}
