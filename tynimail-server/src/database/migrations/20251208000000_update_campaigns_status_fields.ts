import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasCampaignStatusColumn = await knex.schema.hasColumn('tbl_campaigns', 'campaign_status');
  
  await knex.schema.alterTable('tbl_campaigns', (table) => {
    // Add campaign_status column if it doesn't exist
    if (!hasCampaignStatusColumn) {
      table.tinyint('campaign_status').nullable().defaultTo(0);
      console.log('Added campaign_status column to tbl_campaigns');
    }

    // Modify status column to be nullable with no default
    table.integer('status').nullable().defaultTo(null).alter();
    console.log('Updated status column in tbl_campaigns to be nullable with no default');
  });
}

export async function down(knex: Knex): Promise<void> {
  const hasCampaignStatusColumn = await knex.schema.hasColumn('tbl_campaigns', 'campaign_status');
  
  await knex.schema.alterTable('tbl_campaigns', (table) => {
    // Remove campaign_status column if it exists
    if (hasCampaignStatusColumn) {
      table.dropColumn('campaign_status');
      console.log('Removed campaign_status column from tbl_campaigns');
    }

    // Restore status column to not nullable with default 0
    table.integer('status').notNullable().defaultTo(0).alter();
    console.log('Restored status column in tbl_campaigns to not nullable with default 0');
  });
}
