import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const tableExists = await knex.schema.hasTable('tbl_page_visitors');
  
  if (tableExists) {
    console.log('Table tbl_page_visitors already exists, skipping...');
    return;
  }

  await knex.schema.createTable('tbl_page_visitors', (table) => {
    table
      .uuid('id')
      .primary()
      .defaultTo(knex.raw('uuid_generate_v4()'));

    table.string('fingerprint').notNullable().unique();
    table.timestamp('first_visit').defaultTo(knex.fn.now());
    table.timestamp('last_visit').defaultTo(knex.fn.now());

    table.index(['fingerprint']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('tbl_page_visitors');
}
