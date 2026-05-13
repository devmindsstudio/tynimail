import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('tbl_subscriber_segment', (table) => {
        table
            .uuid('id')
            .primary()
            .defaultTo(knex.raw('uuid_generate_v4()'));

        table
            .uuid('subscriber_id')
            .notNullable()
            .references('id')
            .inTable('tbl_subscribers')
            .onDelete('CASCADE');

        table
            .uuid('segment_id')
            .notNullable()
            .references('id')
            .inTable('tbl_segments')
            .onDelete('CASCADE');

        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());

        // Unique constraint to prevent duplicate subscriber-segment relationships
        table.unique(['subscriber_id', 'segment_id']);

        // Indexes for faster lookups
        table.index(['subscriber_id']);
        table.index(['segment_id']);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('tbl_subscriber_segment');
}
