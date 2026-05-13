import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTypeColumn = await knex.schema.hasColumn('tbl_campaigns', 'type');

  if (!hasTypeColumn) {
    await knex.schema.alterTable('tbl_campaigns', (table) => {
      table.integer('type').notNullable().defaultTo(0);
    });
    console.log('Added type column to tbl_campaigns');
  } else {
    console.log('tbl_campaigns already has type column, skipping...');
  }
}

export async function down(knex: Knex): Promise<void> {
  const hasTypeColumn = await knex.schema.hasColumn('tbl_campaigns', 'type');

  if (hasTypeColumn) {
    await knex.schema.alterTable('tbl_campaigns', (table) => {
      table.dropColumn('type');
    });
    console.log('Removed type column from tbl_campaigns');
  }
}
