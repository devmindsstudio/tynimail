import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    const hasTotal = await knex.schema.hasColumn('tbl_campaigns', 'total_recipients');
    if (hasTotal) {
        console.log('Progress columns already exist on tbl_campaigns, skipping...');
        return;
    }

    await knex.schema.alterTable('tbl_campaigns', (table) => {
        table.integer('total_recipients').notNullable().defaultTo(0);
        table.integer('sent_count').notNullable().defaultTo(0);
        table.integer('failed_count').notNullable().defaultTo(0);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('tbl_campaigns', (table) => {
        table.dropColumn('total_recipients');
        table.dropColumn('sent_count');
        table.dropColumn('failed_count');
    });
}
