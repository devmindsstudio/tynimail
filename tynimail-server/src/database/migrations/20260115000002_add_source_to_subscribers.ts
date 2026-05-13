import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('tbl_subscribers', (table) => {
        table.enum('source', ['csv_import', 'single_import']).notNullable().defaultTo('single_import');
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('tbl_subscribers', (table) => {
        table.dropColumn('source');
    });
}
