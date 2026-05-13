import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const tableExists = await knex.schema.hasTable('tbl_campaigns');
  
  if (tableExists) {
    console.log('Table tbl_campaigns already exists, skipping...');
    return;
  }

  await knex.schema.createTable('tbl_campaigns', (table) => {
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
    table.string('subject').notNullable();
    table.string('preheader_text').nullable();
    table.integer('type').notNullable().defaultTo(0);
    table.integer('status').notNullable().defaultTo(0);

    table
      .uuid('template_id')
      .nullable()
      .references('id')
      .inTable('tbl_templates')
      .onDelete('SET NULL');

    table
      .uuid('sender_email_id')
      .notNullable()
      .references('id')
      .inTable('tbl_sender_emails')
      .onDelete('RESTRICT');

    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    // Indexes for faster lookups
    table.index(['user_id']);
    table.index(['status']);
    table.index(['template_id']);
    table.index(['sender_email_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('tbl_campaigns');
}
