import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    const hasUserIdColumn = await knex.schema.hasColumn('tbl_subscribers', 'user_id');

    if (!hasUserIdColumn) {
        await knex.schema.alterTable('tbl_subscribers', (table) => {
            table
                .uuid('user_id')
                .notNullable()
                .references('id')
                .inTable('tbl_users')
                .onDelete('CASCADE');

            // Add index for faster lookups
            table.index(['user_id']);
        });
        console.log('Added user_id column to tbl_subscribers');
    } else {
        console.log('tbl_subscribers already has user_id column, skipping...');
    }
}

export async function down(knex: Knex): Promise<void> {
    const hasUserIdColumn = await knex.schema.hasColumn('tbl_subscribers', 'user_id');

    if (hasUserIdColumn) {
        await knex.schema.alterTable('tbl_subscribers', (table) => {
            table.dropColumn('user_id');
        });
        console.log('Removed user_id column from tbl_subscribers');
    }
}
