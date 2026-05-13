import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const tableExists = await knex.schema.hasTable('tbl_page_sessions');

  if (tableExists) {
    console.log('Table tbl_page_sessions already exists, skipping...');
    return;
  }
  await knex.schema.createTable('tbl_page_sessions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table
      .uuid('page_id')
      .notNullable()
      .references('id')
      .inTable('tbl_pages')
      .onDelete('CASCADE');
    table.integer('session_duration').notNullable();
  });

  console.log('✅ Created tbl_page_sessions');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('tbl_page_sessions');
  console.log('⏪ Dropped tbl_page_sessions');
}
