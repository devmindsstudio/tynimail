import type { Knex } from 'knex';

/**
 * Migration: Create tbl_delayed_executions table
 *
 * Stores scheduled workflow execution resumptions.
 * Used for delay nodes and wait-for-event timeouts.
 */
export async function up(knex: Knex): Promise<void> {
  const tableExists = await knex.schema.hasTable('tbl_delayed_executions');

  if (tableExists) {
    console.log('⚠️  Table tbl_delayed_executions already exists, skipping...');
    return;
  }

  await knex.schema.createTable('tbl_delayed_executions', (table) => {
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
      .comment('Workflow execution to resume');

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

    // Resume details
    table
      .string('resume_from_node_id', 100)
      .notNullable()
      .comment('Node ID to resume from');

    table
      .string('resume_branch', 50)
      .notNullable()
      .defaultTo('default')
      .comment('Branch to take when resuming (default, yes, no)');

    table
      .timestamp('scheduled_for')
      .notNullable()
      .comment('When to resume this execution');

    // Status
    table
      .enum('status', ['pending', 'processing', 'completed', 'cancelled', 'failed'])
      .defaultTo('pending')
      .notNullable()
      .comment('Delayed execution status');

    table
      .text('error_message')
      .nullable()
      .comment('Error message if failed');

    // Timestamps
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();
    table
      .timestamp('processed_at')
      .nullable()
      .comment('When this delayed execution was processed');

    // Indexes for performance
    table.index(['status', 'scheduled_for'], 'idx_delayed_exec_status_schedule');
    table.index(['execution_id'], 'idx_delayed_exec_execution');
    table.index(['workflow_id'], 'idx_delayed_exec_workflow');
  });

  console.log('✅ Created tbl_delayed_executions table');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('tbl_delayed_executions');
  console.log('⏪ Dropped tbl_delayed_executions table');
}
