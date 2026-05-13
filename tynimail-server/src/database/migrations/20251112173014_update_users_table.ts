import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('users', (table) => {
        table.integer('status').notNullable().defaultTo(1);
        table.integer('role').notNullable().defaultTo(0);
    });
}

export async function down(knex: Knex): Promise<void> {
}

