import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('tbl_providers', (table) => {
        table.integer('provider_type').notNullable();
        table.string('provider_value').notNullable();
        table.uuid('user_id').notNullable().references('id').inTable('tbl_users').onDelete('CASCADE');
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
        table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('tbl_providers', (table) => {
        table.dropColumn('provider_type');
        table.dropColumn('provider_value');
        table.dropColumn('user_id');
        table.dropColumn('created_at');
        table.dropColumn('updated_at');
    });
}

