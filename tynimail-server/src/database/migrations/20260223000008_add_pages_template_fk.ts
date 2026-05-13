import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('tbl_pages');
  if (!hasTable) return;

  const hasColumn = await knex.schema.hasColumn('tbl_pages', 'template_id');
  if (!hasColumn) return;

  const hasForeignKey = await knex.raw(`
    SELECT constraint_name 
    FROM information_schema.table_constraints 
    WHERE table_name = 'tbl_pages' 
    AND constraint_type = 'FOREIGN KEY' 
    AND constraint_name LIKE '%template_id%'
  `);

  if (hasForeignKey.rows.length > 0) return;

  await knex.schema.alterTable('tbl_pages', (table) => {
    table
      .foreign('template_id')
      .references('id')
      .inTable('tbl_page_templates')
      .onDelete('SET NULL');
  });
}

export async function down(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('tbl_pages');
  if (!hasTable) return;

  await knex.schema.alterTable('tbl_pages', (table) => {
    table.dropForeign('template_id');
  });
}
