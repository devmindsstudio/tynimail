import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.renameTable('users', 'tbl_users');
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.renameTable('tbl_users', 'users');
}

