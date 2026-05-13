import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('tbl_subscribers', (table) => {
        table.string('notes').nullable().defaultTo(null);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('tbl_subscribers', (table) => {
        table.dropColumn('notes');
    });
}
