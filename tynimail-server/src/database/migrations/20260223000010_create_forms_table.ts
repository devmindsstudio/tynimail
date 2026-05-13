import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const tableExists = await knex.schema.hasTable('tbl_forms');
  
  if (tableExists) {
    console.log('Table tbl_forms already exists, skipping...');
    return;
  }

  await knex.schema.createTable('tbl_forms', (table) => {
    table
      .uuid('id')
      .primary()
      .defaultTo(knex.raw('uuid_generate_v4()'));

    table
      .uuid('user_id')
      .notNullable()
      .references('id')
      .inTable('tbl_users')
      .onDelete('CASCADE');

    table.string('name').notNullable();
    table.string('slug').notNullable().unique();
    table.text('content').notNullable().defaultTo('');
    table.integer('status').notNullable().defaultTo(0);

    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.timestamp('deleted_at').nullable();

    table.index(['user_id']);
    table.index(['status']);
    table.index(['slug']);
    table.index(['deleted_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('tbl_forms');
}
