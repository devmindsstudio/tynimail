import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('tbl_subscribers', (table) => {
        table
            .uuid('id')
            .primary()
            .defaultTo(knex.raw('uuid_generate_v4()'));

        table.string('first_name').nullable();
        table.string('last_name').nullable();
        table.string('email').notNullable();
        table.tinyint('status').notNullable().defaultTo(1);
        table.tinyint('row_status').notNullable().defaultTo(1);
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());

        // Unique constraint on email
        table.unique(['email']);

        // Index for faster lookups
        table.index(['email']);
        table.index(['status']);
        table.index(['row_status']);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('tbl_subscribers');
}
