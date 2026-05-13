import type { Knex } from 'knex';

/**
 * Migration: Create tbl_event_waiters table
 *
 * Stores workflow executions waiting for specific events.
 * Used for "wait-for-event" nodes.
 */
export async function up(knex: Knex): Promise<void> {
  const tableExists = await knex.schema.hasTable('tbl_event_waiters');

  if (tableExists) {
    console.log('⚠️  Table tbl_event_waiters already exists, skipping...');
    return;
  }

  await knex.schema.createTable('tbl_event_waiters', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));

    // Multi-tenancy
    table
      .uuid('user_id')
      .notNullable()
      .references('id')
      .inTable('tbl_users')
      .onDelete('CASCADE')
      .comment('Owner of the workflow');

    // References
    table
      .uuid('execution_id')
      .notNullable()
      .references('id')
      .inTable('tbl_workflow_executions')
      .onDelete('CASCADE')
      .comment('Workflow execution waiting for event');

    table
      .uuid('workflow_id')
      .notNullable()
      .references('id')
      .inTable('tbl_workflows')
      .onDelete('CASCADE')
      .comment('Workflow being executed');

    table
      .uuid('contact_id')
      .notNullable()
      .references('id')
      .inTable('tbl_subscribers')
      .onDelete('CASCADE')
      .comment('Contact in execution');

    table
      .string('node_id', 100)
      .notNullable()
      .comment('Wait-for-event node ID');

    // Event details
    table
      .string('event_type', 100)
      .notNullable()
      .comment('Type of event to wait for (email_opened, form_submitted, etc.)');

    table
      .jsonb('event_config')
      .nullable()
      .comment('Event matching configuration (filters, etc.)');

    table
      .timestamp('expires_at')
      .notNullable()
      .comment('When this waiter times out');

    // Resolution
    table
      .boolean('resolved')
      .defaultTo(false)
      .notNullable()
      .comment('Whether event occurred or timed out');

    table
      .timestamp('resolved_at')
      .nullable()
      .comment('When waiter was resolved');

    table
      .enum('resolution_type', ['event_matched', 'timeout'])
      .nullable()
      .comment('How waiter was resolved');

    table
      .jsonb('resolution_data')
      .nullable()
      .comment('Event data if event_matched');

    // Timestamps
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();

    // Indexes for performance
    table.index(
      ['user_id', 'contact_id', 'event_type', 'resolved'],
      'idx_event_waiters_matching',
    );
    table.index(['resolved', 'expires_at'], 'idx_event_waiters_expiry');
    table.index(['execution_id'], 'idx_event_waiters_execution');
  });

  console.log('✅ Created tbl_event_waiters table');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('tbl_event_waiters');
  console.log('⏪ Dropped tbl_event_waiters table');
}
