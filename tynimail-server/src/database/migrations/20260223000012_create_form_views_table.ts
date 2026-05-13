import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const tableExists = await knex.schema.hasTable('tbl_form_views');
  
  if (tableExists) {
    console.log('Table tbl_form_views already exists, skipping...');
    return;
  }

  await knex.schema.createTable('tbl_form_views', (table) => {
    table
      .uuid('id')
      .primary()
      .defaultTo(knex.raw('uuid_generate_v4()'));

    table
      .uuid('form_id')
      .notNullable()
      .references('id')
      .inTable('tbl_forms')
      .onDelete('CASCADE');

    table
      .uuid('visitor_id')
      .nullable()
      .references('id')
      .inTable('tbl_form_visitors')
      .onDelete('SET NULL');

    table.integer('device_type').notNullable().defaultTo(1);
    table.string('ip_address').nullable();
    table.string('user_agent').nullable();

    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index(['form_id']);
    table.index(['visitor_id']);
    table.index(['device_type']);
    table.index(['created_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('tbl_form_views');
}
