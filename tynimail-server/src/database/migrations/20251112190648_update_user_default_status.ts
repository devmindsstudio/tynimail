import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('tbl_users', (table) => {
        table.integer('status').notNullable().defaultTo(2).alter();
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('tbl_users', (table) => {
        table.integer('status').notNullable().defaultTo(1).alter();
    });
}

