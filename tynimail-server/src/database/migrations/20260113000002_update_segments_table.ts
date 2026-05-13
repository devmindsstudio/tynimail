import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    const hasUserIdColumn = await knex.schema.hasColumn('tbl_segments', 'user_id');

    if (!hasUserIdColumn) {
        await knex.schema.alterTable('tbl_segments', (table) => {
            table
                .uuid('user_id')
                .notNullable()
                .references('id')
                .inTable('tbl_users')
                .onDelete('CASCADE');

            // Add index for faster lookups
            table.index(['user_id']);
        });
        console.log('Added user_id column to tbl_segments');
    } else {
        console.log('tbl_segments already has user_id column, skipping...');
    }

    // Add unique constraint on name
    await knex.schema.alterTable('tbl_segments', (table) => {
        table.unique(['name']);
    });
    console.log('Added unique constraint on name column in tbl_segments');
}

export async function down(knex: Knex): Promise<void> {
    // Drop unique constraint on name
    await knex.schema.alterTable('tbl_segments', (table) => {
        table.dropUnique(['name']);
    });
    console.log('Removed unique constraint on name column in tbl_segments');

    // Remove user_id column
    const hasUserIdColumn = await knex.schema.hasColumn('tbl_segments', 'user_id');
    if (hasUserIdColumn) {
        await knex.schema.alterTable('tbl_segments', (table) => {
            table.dropColumn('user_id');
        });
        console.log('Removed user_id column from tbl_segments');
    }
}
