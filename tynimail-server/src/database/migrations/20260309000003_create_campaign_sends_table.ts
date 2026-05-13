import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    const tableExists = await knex.schema.hasTable('tbl_campaign_sends');
    if (tableExists) {
        console.log('Table tbl_campaign_sends already exists, skipping...');
        return;
    }

    await knex.schema.createTable('tbl_campaign_sends', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
        table.uuid('campaign_id').notNullable().references('id').inTable('tbl_campaigns').onDelete('CASCADE');
        table.uuid('subscriber_id').notNullable().references('id').inTable('tbl_subscribers').onDelete('CASCADE');
        table.uuid('sent_email_id').nullable().references('id').inTable('tbl_sent_emails').onDelete('SET NULL');
        table.smallint('status').notNullable().defaultTo(0); // 0=pending, 1=sent, 2=skipped, 3=failed
        table.text('error_message').nullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());

        table.unique(['campaign_id', 'subscriber_id']);
        table.index(['campaign_id']);
        table.index(['subscriber_id']);
        table.index(['status']);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('tbl_campaign_sends');
}
