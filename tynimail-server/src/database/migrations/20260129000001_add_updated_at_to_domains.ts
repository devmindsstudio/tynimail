import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    const hasColumn = await knex.schema.hasColumn('tbl_domains', 'updated_at');

    if (hasColumn) {
        console.log('Column updated_at already exists in tbl_domains, skipping...');
        return;
    }

    await knex.schema.alterTable('tbl_domains', (table) => {
        table.timestamp('updated_at').defaultTo(knex.fn.now()).after('created_at');
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('tbl_domains', (table) => {
        table.dropColumn('updated_at');
    });
}
