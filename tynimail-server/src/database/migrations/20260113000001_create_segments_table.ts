import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('tbl_segments', (table) => {
        table
            .uuid('id')
            .primary()
            .defaultTo(knex.raw('uuid_generate_v4()'));

        table.string('name').notNullable();
        table.string('color').nullable();
        table.tinyint('row_status').notNullable().defaultTo(1);
        table.jsonb('metadata').nullable().defaultTo('{}');
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());

        // Index for faster lookups
        table.index(['name']);
        table.index(['row_status']);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('tbl_segments');
}
