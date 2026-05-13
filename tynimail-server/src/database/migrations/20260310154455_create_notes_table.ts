import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const tableExists = await knex.schema.hasTable('tbl_notes');

  if (tableExists) {
    console.log('Table tbl_notes already exists, skipping...');
    return;
  }
  await knex.schema.createTable('tbl_notes', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table
      .uuid('user_id')
      .notNullable()
      .references('id')
      .inTable('tbl_users')
      .onDelete('CASCADE');
    table.string('title').notNullable();
    table.text('description').notNullable();
    table.timestamp('date').notNullable();
    table.smallint('status').notNullable().defaultTo(1); // 0=deleted, 1=live
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').nullable();
    table.timestamp('deleted_at').nullable();
  });

  console.log('✅ Created tbl_notes');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('tbl_notes');
  console.log('⏪ Dropped tbl_notes');
}
