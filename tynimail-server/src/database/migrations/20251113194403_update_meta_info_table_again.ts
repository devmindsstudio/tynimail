import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('tbl_meta_info', (table) => {
        table.uuid('user_id').notNullable().references('id').inTable('tbl_users').onDelete('CASCADE');
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('tbl_meta_info', (table) => {
        table.dropColumn('user_id');
    });
}

