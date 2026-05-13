import { Knex } from 'knex';

/**
 * Migration: Add GIN index on tbl_workflows.triggers JSONB column
 *
 * Powers the TriggerWorker query:
 *   WHERE triggers @> '[{"subtype":"contact_added_to_list"}]'
 * Without this index the query does a full table scan for every event.
 */
export async function up(knex: Knex): Promise<void> {
  // GIN index for JSONB containment queries (@> operator)
  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_workflows_triggers_gin
    ON tbl_workflows
    USING gin(triggers)
  `);

  // Compound index on status + user_id for the TriggerWorker WHERE clause
  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_workflows_status_user
    ON tbl_workflows(status, user_id)
  `);

  console.log('✅ Created GIN index on tbl_workflows.triggers');
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('DROP INDEX IF EXISTS idx_workflows_triggers_gin');
  await knex.raw('DROP INDEX IF EXISTS idx_workflows_status_user');
  console.log('⏪ Dropped GIN index on tbl_workflows.triggers');
}
