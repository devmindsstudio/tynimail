import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    const tableExists = await knex.schema.hasTable('tbl_campaign_audiences');

    if (tableExists) {
        console.log('Table tbl_campaign_audiences already exists, skipping...');
        return;
    }

    await knex.schema.createTable('tbl_campaign_audiences', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
        table.uuid('campaign_id').notNullable().references('id').inTable('tbl_campaigns').onDelete('CASCADE');
        table.smallint('audience_type').notNullable(); // 0 = segment, 1 = subscriber
        table.uuid('segment_id').nullable().references('id').inTable('tbl_segments').onDelete('CASCADE');
        table.uuid('subscriber_id').nullable().references('id').inTable('tbl_subscribers').onDelete('CASCADE');
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());

        table.index(['campaign_id']);
        table.index(['segment_id']);
        table.index(['subscriber_id']);
    });

    // Partial unique indexes — prevent duplicate segment or subscriber per campaign
    await knex.raw(`
        CREATE UNIQUE INDEX uq_campaign_audience_segment
        ON tbl_campaign_audiences (campaign_id, segment_id)
        WHERE segment_id IS NOT NULL
    `);

    await knex.raw(`
        CREATE UNIQUE INDEX uq_campaign_audience_subscriber
        ON tbl_campaign_audiences (campaign_id, subscriber_id)
        WHERE subscriber_id IS NOT NULL
    `);
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('tbl_campaign_audiences');
}
