import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const tableExists = await knex.schema.hasTable('tbl_page_templates');
  
  if (tableExists) {
    console.log('Table tbl_page_templates already exists, skipping...');
    return;
  }

  await knex.schema.createTable('tbl_page_templates', (table) => {
    table
      .uuid('id')
      .primary()
      .defaultTo(knex.raw('uuid_generate_v4()'));

    table.string('name').notNullable();
    table.string('category').nullable();
    table.jsonb('content').notNullable().defaultTo('{}');
    table.string('preview_image_url').nullable();
    table.boolean('is_system').notNullable().defaultTo(false);

    table
      .uuid('user_id')
      .nullable()
      .references('id')
      .inTable('tbl_users')
      .onDelete('CASCADE');

    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index(['is_system']);
    table.index(['user_id']);
    table.index(['category']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('tbl_page_templates');
}
