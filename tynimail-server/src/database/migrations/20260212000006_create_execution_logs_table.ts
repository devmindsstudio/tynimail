import type { Knex } from 'knex';

/**
 * Migration: Create tbl_execution_logs table
 *
 * Stores step-by-step execution logs for each workflow execution.
 * Each log entry represents one node execution within a workflow.
 *
 * Used for:
 * - Debugging workflow issues
 * - Displaying execution history to users
 * - Analytics (which paths do contacts take?)
 * - Audit trail (what actions were performed?)
 */
export async function up(knex: Knex): Promise<void> {
    const tableExists = await knex.schema.hasTable('tbl_execution_logs');

    if (tableExists) {
        console.log('⚠️  Table tbl_execution_logs already exists, skipping...');
        return;
    }

    await knex.schema.createTable('tbl_execution_logs', (table) => {
        // Primary key
        table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));

        // Multi-tenancy
        table.uuid('user_id')
            .notNullable()
            .references('id')
            .inTable('tbl_users')
            .onDelete('CASCADE');

        // References
        table.uuid('execution_id')
            .notNullable()
            .references('id')
            .inTable('tbl_workflow_executions')
            .onDelete('CASCADE')
            .comment('Which execution this log belongs to');

        // Node identification
        table.string('node_id', 100).notNullable()
            .comment('React Flow node ID');

        table.integer('step_id').nullable()
            .comment('Sequential step number (1, 2, 3...) for ordering');

        table.string('node_subtype', 100).notNullable()
            .comment('Node type: send_email, add_to_list, delay, conditional_split, etc.');

        // Execution status
        table.enum('status', ['pending', 'completed', 'failed', 'skipped'])
            .defaultTo('pending')
            .notNullable()
            .comment('Node execution status');

        // Execution data
        table.jsonb('input_data').nullable()
            .comment('Node configuration at execution time (what was configured)');

        table.jsonb('output_data').nullable()
            .comment('Result data from node execution (what happened)');

        table.text('error').nullable()
            .comment('Error message if node execution failed');

        table.string('branch_taken', 100).nullable()
            .comment('For conditional/percentage splits: which branch was taken');

        // Timestamps
        table.timestamp('executed_at').defaultTo(knex.fn.now()).notNullable();
        table.timestamp('completed_at').nullable();

        // Indexes for performance
        table.index(['user_id', 'execution_id'], 'idx_logs_user_execution');
        table.index(['user_id', 'execution_id', 'step_id'], 'idx_logs_user_execution_step');
        table.index(['execution_id', 'step_id'], 'idx_logs_execution_step');
        table.index(['node_subtype'], 'idx_logs_node_subtype');
    });

    console.log('✅ Created tbl_execution_logs table');
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('tbl_execution_logs');
    console.log('⏪ Dropped tbl_execution_logs table');
}
