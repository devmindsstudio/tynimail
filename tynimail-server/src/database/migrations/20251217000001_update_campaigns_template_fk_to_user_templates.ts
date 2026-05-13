import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('tbl_campaigns');
  if (!hasTable) return;

  const hasColumn = await knex.schema.hasColumn('tbl_campaigns', 'template_id');
  if (!hasColumn) return;

  // If any existing rows point to tbl_templates, they will violate the new FK.
  // We null them out so the constraint can be applied safely.
  await knex('tbl_campaigns')
    .whereNotNull('template_id')
    .update({ template_id: null, updated_at: knex.fn.now() });

  await knex.schema.alterTable('tbl_campaigns', (table) => {
    table.dropForeign('template_id');
  });

  await knex.schema.alterTable('tbl_campaigns', (table) => {
    table
      .foreign('template_id')
      .references('id')
      .inTable('tbl_user_templates')
      .onDelete('SET NULL');
  });
}

export async function down(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('tbl_campaigns');
  if (!hasTable) return;

  const hasColumn = await knex.schema.hasColumn('tbl_campaigns', 'template_id');
  if (!hasColumn) return;

  // Existing rows may now point to tbl_user_templates; null them out before restoring old FK.
  await knex('tbl_campaigns')
    .whereNotNull('template_id')
    .update({ template_id: null, updated_at: knex.fn.now() });

  await knex.schema.alterTable('tbl_campaigns', (table) => {
    table.dropForeign('template_id');
  });

  await knex.schema.alterTable('tbl_campaigns', (table) => {
    table
      .foreign('template_id')
      .references('id')
      .inTable('tbl_templates')
      .onDelete('SET NULL');
  });
}



