import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    // Drop the existing unique constraint on email
    await knex.schema.alterTable('tbl_subscribers', (table) => {
        table.dropUnique(['email']);
    });

    // Add composite unique constraint on (user_id, email)
    await knex.schema.alterTable('tbl_subscribers', (table) => {
        table.unique(['user_id', 'email'], {
            indexName: 'tbl_subscribers_user_id_email_unique'
        });
    });

    console.log('Updated subscribers email constraint to be unique per user');
}

export async function down(knex: Knex): Promise<void> {
    // Drop the composite unique constraint
    await knex.schema.alterTable('tbl_subscribers', (table) => {
        table.dropUnique(['user_id', 'email']);
    });

    // Restore the original unique constraint on email
    await knex.schema.alterTable('tbl_subscribers', (table) => {
        table.unique(['email']);
    });

    console.log('Reverted subscribers email constraint to globally unique');
}
