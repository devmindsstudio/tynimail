import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasSenderNameColumn = await knex.schema.hasColumn('tbl_campaigns', 'sender_name');
  
  if (!hasSenderNameColumn) {
    await knex.schema.alterTable('tbl_campaigns', (table) => {
      table.string('sender_name', 255).notNullable();
    });
    console.log('Added sender_name column to tbl_campaigns');
  } else {
    console.log('tbl_campaigns already has sender_name column, skipping...');
  }
}

export async function down(knex: Knex): Promise<void> {
  const hasSenderNameColumn = await knex.schema.hasColumn('tbl_campaigns', 'sender_name');
  
  if (hasSenderNameColumn) {
    await knex.schema.alterTable('tbl_campaigns', (table) => {
      table.dropColumn('sender_name');
    });
    console.log('Removed sender_name column from tbl_campaigns');
  }
}
