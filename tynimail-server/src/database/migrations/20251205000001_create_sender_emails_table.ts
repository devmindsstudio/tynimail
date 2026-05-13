import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const tableExists = await knex.schema.hasTable('tbl_sender_emails');
  
  if (tableExists) {
    console.log('Table tbl_sender_emails already exists, skipping...');
    return;
  }

  await knex.schema.createTable('tbl_sender_emails', (table) => {
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

    table.string('email').notNullable();
    table.boolean('is_verified').notNullable().defaultTo(false);
    table.tinyint('status').notNullable().defaultTo(1);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    // Unique constraint on email
    table.unique(['email']);

    // Indexes for faster lookups on non-unique columns
    table.index(['user_id'], 'idx_sender_emails_user_id');
    table.index(['is_verified'], 'idx_sender_emails_is_verified');
    table.index(['created_at'], 'idx_sender_emails_created_at');
    
    // Composite index for common query patterns
    table.index(['user_id', 'is_verified'], 'idx_sender_emails_user_verified');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('tbl_sender_emails');
}
