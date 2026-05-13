import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const tableExists = await knex.schema.hasTable('tbl_templates');
  
  if (tableExists) {
    console.log('Table tbl_templates already exists, skipping...');
    return;
  }

  await knex.schema.createTable('tbl_templates', (table) => {
    table
      .uuid('id')
      .primary()
      .defaultTo(knex.raw('uuid_generate_v4()'));

    table.integer('type').notNullable();
    table.text('content').notNullable();
    table.tinyint('status').notNullable().defaultTo(1);

    table
      .uuid('user_id')
      .nullable()
      .references('id')
      .inTable('tbl_users')
      .onDelete('CASCADE');

    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    // Indexes for faster lookups
    table.index(['user_id']);
    table.index(['type']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('tbl_templates');
}
