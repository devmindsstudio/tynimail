import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Add status column to tbl_templates
  const hasTemplatesStatus = await knex.schema.hasColumn('tbl_templates', 'status');
  if (!hasTemplatesStatus) {
    await knex.schema.alterTable('tbl_templates', (table) => {
      table.tinyint('status').notNullable().defaultTo(1);
    });
    console.log('Added status column to tbl_templates');
  }

  // Add status column to tbl_sender_emails
  const hasSenderEmailsStatus = await knex.schema.hasColumn('tbl_sender_emails', 'status');
  if (!hasSenderEmailsStatus) {
    await knex.schema.alterTable('tbl_sender_emails', (table) => {
      table.tinyint('status').notNullable().defaultTo(1);
    });
    console.log('Added status column to tbl_sender_emails');
  }

  // Note: tbl_campaigns already has status column, skipping
  const hasCampaignsStatus = await knex.schema.hasColumn('tbl_campaigns', 'status');
  if (hasCampaignsStatus) {
    console.log('tbl_campaigns already has status column, skipping...');
  }
}

export async function down(knex: Knex): Promise<void> {
  // Remove status column from tbl_templates
  const hasTemplatesStatus = await knex.schema.hasColumn('tbl_templates', 'status');
  if (hasTemplatesStatus) {
    await knex.schema.alterTable('tbl_templates', (table) => {
      table.dropColumn('status');
    });
  }

  // Remove status column from tbl_sender_emails
  const hasSenderEmailsStatus = await knex.schema.hasColumn('tbl_sender_emails', 'status');
  if (hasSenderEmailsStatus) {
    await knex.schema.alterTable('tbl_sender_emails', (table) => {
      table.dropColumn('status');
    });
  }
}
