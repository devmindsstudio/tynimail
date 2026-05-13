import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('tbl_meta_info', (table) => {
        table.integer('status').notNullable().defaultTo(1);
    }
    );
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('tbl_meta_info', (table) => {
        table.dropColumn('status');
    }
    );
}

