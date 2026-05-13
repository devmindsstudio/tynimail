import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('tbl_forms');
  if (!hasTable) return;

  const hasColumnSlug = await knex.schema.hasColumn('tbl_pages', 'slug');
  if (!hasColumnSlug) return;

  const hasColumnDeletedAt = await knex.schema.hasColumn(
    'tbl_pages',
    'deleted_at',
  );
  if (!hasColumnDeletedAt) return;

  const hasColumnContent = await knex.schema.hasColumn('tbl_pages', 'content');
  if (!hasColumnContent) return;

  const hasColumnStatus = await knex.schema.hasColumn('tbl_pages', 'status');
  if (!hasColumnStatus) return;

  await knex.schema.alterTable('tbl_forms', (table) => {
    table.string('slug').notNullable().unique();
    table.text('content').notNullable().defaultTo('');
    table.integer('status').notNullable().defaultTo(0);
    table.timestamp('deleted_at').nullable();
    table.jsonb('fields').alter({ alterType: true }).nullable();

    table.index(['slug']);
    table.index(['status']);
    table.index(['deleted_at']);
  });

  console.log('✅ Added slug + content + status + deleted_at to tbl_forms');
  console.log('✅ Altered [fields] to be null in tbl_forms');
}

export async function down(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('tbl_forms');
  if (!hasTable) return;

  await knex.schema.alterTable('tbl_forms', (table) => {
    table.dropColumn('slug');
    table.dropColumn('content');
    table.dropColumn('status');
    table.dropColumn('deleted_at');
    table
      .jsonb('fields')
      .alter({ alterType: true })
      .notNullable()
      .defaultTo({});
  });

  console.log('⏪ Dropped slug + content + status + deleted_at from tbl_forms');
  console.log(
    '⏪ Altered [fields] to be not null and defaulting to "{}" in tbl_forms',
  );
}
