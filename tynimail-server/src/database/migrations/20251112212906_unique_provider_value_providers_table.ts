import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('tbl_providers', (table) => {
        table.unique(['provider_value']);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('tbl_providers', (table) => {
        table.dropUnique(['provider_value']);
    });
}