import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    const hasColumn = await knex.schema.hasColumn('tbl_domains', 'row_status');

    if (hasColumn) {
        console.log('Column row_status already exists in tbl_domains, skipping...');
        return;
    }

    await knex.schema.alterTable('tbl_domains', (table) => {
        table.integer('row_status').notNullable().defaultTo(1).after('is_verified');
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('tbl_domains', (table) => {
        table.dropColumn('row_status');
    });
}
