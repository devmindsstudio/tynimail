import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('tbl_subscribers', (table) => {
        table.jsonb('metadata').notNullable().defaultTo(JSON.stringify({
            open: 0,
            click: 0,
            unique: 0,
            delivered: 0
        }));
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('tbl_subscribers', (table) => {
        table.dropColumn('metadata');
    });
}
