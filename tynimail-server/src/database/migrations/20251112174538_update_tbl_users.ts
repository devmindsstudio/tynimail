import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    const hasStatusColumn = await knex.schema.hasColumn('tbl_users', 'status');
    const hasRoleColumn = await knex.schema.hasColumn('tbl_users', 'role');

    await knex.schema.alterTable('tbl_users', (table) => {
        if (!hasStatusColumn) {
            table.integer('status').notNullable().defaultTo(1);
        }
        if (!hasRoleColumn) {
            table.integer('role').notNullable().defaultTo(0);
        }
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('tbl_users', (table) => {
        table.dropColumn('status');
        table.dropColumn('role');
    });
}

