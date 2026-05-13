import type { Knex } from 'knex';

/**
 * Migration: Create tbl_workflow_executions table
 *
 * Stores individual workflow execution instances (one contact's journey through a workflow).
 * Each execution represents a single contact going through the workflow from trigger to completion.
 *
 * Execution states:
 * - running: Currently executing nodes
 * - waiting: Paused on a delay node
 * - waiting_for_event: Paused on wait-for-event node
 * - completed: Successfully finished
 * - failed: Encountered error
 * - cancelled: Manually stopped or workflow deactivated
 */
export async function up(knex: Knex): Promise<void> {
    const tableExists = await knex.schema.hasTable('tbl_workflow_executions');

    if (tableExists) {
        console.log('⚠️  Table tbl_workflow_executions already exists, skipping...');
        return;
    }

    await knex.schema.createTable('tbl_workflow_executions', (table) => {
        // Primary key
        table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));

        // Multi-tenancy
        table.uuid('user_id')
            .notNullable()
            .references('id')
            .inTable('tbl_users')
            .onDelete('CASCADE');

        // References
        table.uuid('workflow_id')
            .notNullable()
            .references('id')
            .inTable('tbl_workflows')
            .onDelete('CASCADE')
            .comment('Which workflow is being executed');

        table.uuid('contact_id')
            .notNullable()
            .references('id')
            .inTable('tbl_subscribers')
            .onDelete('CASCADE')
            .comment('Which contact is going through the workflow');

        // Execution state
        table.enum('status', [
            'running',
            'waiting',
            'waiting_for_event',
            'completed',
            'failed',
            'cancelled'
        ])
            .defaultTo('running')
            .notNullable()
            .comment('Current execution status');

        // Position tracking
        table.string('trigger_node_id', 100).nullable()
            .comment('Which trigger node started this execution');

        table.string('current_node_id', 100).nullable()
            .comment('Current node being executed (for resuming)');

        // Execution data
        table.jsonb('trigger_data').nullable()
            .comment('Data from the trigger event (e.g., form submission data, email opened data)');

        table.jsonb('context').nullable()
            .comment('Execution context: accumulated results from previous nodes, variables');

        // Error tracking
        table.text('error').nullable()
            .comment('Error message if execution failed');

        table.string('error_node_id', 100).nullable()
            .comment('Node ID where error occurred');

        // Timestamps
        table.timestamp('started_at').defaultTo(knex.fn.now()).notNullable();
        table.timestamp('completed_at').nullable();
        table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();

        // Indexes for performance
        table.index(['user_id', 'workflow_id', 'status'], 'idx_executions_user_workflow_status');
        table.index(['user_id', 'contact_id', 'status'], 'idx_executions_user_contact_status');
        table.index(['user_id', 'status', 'updated_at'], 'idx_executions_user_status_updated');
        table.index(['workflow_id', 'status'], 'idx_executions_workflow_status');
        table.index(['contact_id'], 'idx_executions_contact');
    });

    console.log('✅ Created tbl_workflow_executions table');
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('tbl_workflow_executions');
    console.log('⏪ Dropped tbl_workflow_executions table');
}
