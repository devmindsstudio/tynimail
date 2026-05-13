import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    const hasDeletedAtColumn = await knex.schema.hasColumn('tbl_campaigns', 'deleted_at');

    if (!hasDeletedAtColumn) {
        await knex.schema.alterTable('tbl_campaigns', (table) => {
            table.timestamp('deleted_at').nullable();
        });
        console.log('Added deleted_at column to tbl_campaigns');
    } else {
        console.log('tbl_campaigns already has deleted_at column, skipping...');
    }
}

export async function down(knex: Knex): Promise<void> {
    const hasDeletedAtColumn = await knex.schema.hasColumn('tbl_campaigns', 'deleted_at');

    if (hasDeletedAtColumn) {
        await knex.schema.alterTable('tbl_campaigns', (table) => {
            table.dropColumn('deleted_at');
        });
        console.log('Removed deleted_at column from tbl_campaigns');
    }
}
