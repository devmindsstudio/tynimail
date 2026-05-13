import type { Knex } from 'knex';

/**
 * Migration: Create tbl_workflows table
 *
 * Stores workflow automation definitions.
 * Each workflow contains:
 * - Flow data: Complete React Flow graph (nodes + edges)
 * - Triggers: Array of trigger configs extracted from flow_data
 * - Settings: Re-entry rules, error handling
 * - Stats: Execution counts
 */
export async function up(knex: Knex): Promise<void> {
    const tableExists = await knex.schema.hasTable('tbl_workflows');

    if (tableExists) {
        console.log('⚠️  Table tbl_workflows already exists, skipping...');
        return;
    }

    await knex.schema.createTable('tbl_workflows', (table) => {
        // Primary key
        table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));

        // Multi-tenancy
        table.uuid('user_id')
            .notNullable()
            .references('id')
            .inTable('tbl_users')
            .onDelete('CASCADE')
            .comment('Owner of the workflow');

        // Basic info
        table.string('name', 255).notNullable()
            .comment('Workflow name (e.g., "Welcome Series", "Abandoned Cart")');

        table.text('description').nullable()
            .comment('Workflow description for users');

        // Status
        table.enum('status', ['draft', 'active', 'paused', 'archived'])
            .defaultTo('draft')
            .notNullable()
            .comment('Workflow lifecycle status');

        // Trigger metadata (denormalized for fast querying)
        table.jsonb('triggers').nullable()
            .comment('Array of trigger configs: [{nodeId, subtype, config}]');

        // Complete React Flow graph data
        table.jsonb('flow_data').nullable()
            .comment('Complete workflow graph: {nodes: [...], edges: [...]}');

        // Workflow settings
        table.boolean('allow_reentry')
            .defaultTo(false)
            .notNullable()
            .comment('Can a contact enter this workflow multiple times?');

        table.boolean('exit_on_error')
            .defaultTo(false)
            .notNullable()
            .comment('Stop workflow on first error (true) or continue (false)');

        // Execution statistics
        table.integer('total_executions')
            .defaultTo(0)
            .notNullable()
            .comment('Total number of workflow executions (all time)');

        table.integer('active_executions')
            .defaultTo(0)
            .notNullable()
            .comment('Current number of running/waiting executions');

        // Timestamps
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
        table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();
        table.timestamp('activated_at').nullable()
            .comment('When workflow was first activated');

        // Indexes for performance
        table.index(['user_id', 'status'], 'idx_workflows_user_status');
        table.index(['user_id', 'activated_at'], 'idx_workflows_user_activated');
        table.index(['status'], 'idx_workflows_status');
    });

    console.log('✅ Created tbl_workflows table');
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('tbl_workflows');
    console.log('⏪ Dropped tbl_workflows table');
}
