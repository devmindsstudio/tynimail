import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasColumn = await knex.schema.hasColumn('tbl_event_waiters', 'timeout_job_id');
  if (hasColumn) {
    console.log('⚠️  Column timeout_job_id already exists, skipping...');
    return;
  }

  await knex.schema.alterTable('tbl_event_waiters', (table) => {
    table
      .string('timeout_job_id')
      .nullable()
      .comment('BullMQ job ID of the timeout delayed job — used to cancel it when event resolves');
  });

  console.log('✅ Added timeout_job_id to tbl_event_waiters');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('tbl_event_waiters', (table) => {
    table.dropColumn('timeout_job_id');
  });
  console.log('⏪ Dropped timeout_job_id from tbl_event_waiters');
}
