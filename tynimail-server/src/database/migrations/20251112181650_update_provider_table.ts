import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.renameTable('providers', 'tbl_providers');
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.renameTable('tbl_providers', 'providers');
}

