import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const tableExists = await knex.schema.hasTable('tbl_user_templates');

  if (tableExists) {
    console.log('Table tbl_user_templates already exists, skipping...');
    return;
  }

  await knex.schema.createTable('tbl_user_templates', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));

    table
      .uuid('user_id')
      .notNullable()
      .references('id')
      .inTable('tbl_users')
      .onDelete('CASCADE');

    table
      .uuid('template_id')
      .nullable()
      .references('id')
      .inTable('tbl_templates')
      .onDelete('SET NULL');

    table.text('content').notNullable();
    table.tinyint('status').notNullable().defaultTo(1);

    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.timestamp('deleted_at').nullable();

    // Indexes for common access patterns
    table.index(['user_id'], 'idx_user_templates_user_id');
    table.index(['template_id'], 'idx_user_templates_template_id');
    table.index(['status'], 'idx_user_templates_status');
    table.index(['deleted_at'], 'idx_user_templates_deleted_at');
    table.index(['user_id', 'status'], 'idx_user_templates_user_status');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('tbl_user_templates');
}


