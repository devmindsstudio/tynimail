import type { Knex } from 'knex';

/**
 * Migration: Create tbl_round_robin_state table
 *
 * Tracks round-robin assignment state for "Assign User" action.
 * Ensures even distribution of contacts across team members.
 *
 * Example: Distribute new leads evenly between 3 sales reps
 */
export async function up(knex: Knex): Promise<void> {
    const tableExists = await knex.schema.hasTable('tbl_round_robin_state');

    if (tableExists) {
        console.log('⚠️  Table tbl_round_robin_state already exists, skipping...');
        return;
    }

    await knex.schema.createTable('tbl_round_robin_state', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));

        table.uuid('user_id')
            .notNullable()
            .references('id')
            .inTable('tbl_users')
            .onDelete('CASCADE');

        table.uuid('workflow_id')
            .notNullable()
            .references('id')
            .inTable('tbl_workflows')
            .onDelete('CASCADE');

        table.string('node_id', 100).notNullable()
            .comment('Assign user node ID');

        table.jsonb('team_members').notNullable()
            .comment('Array of user IDs in rotation: ["user1", "user2", "user3"]');

        table.integer('current_index').defaultTo(0).notNullable()
            .comment('Current position in rotation (0-based)');

        table.integer('total_assigned').defaultTo(0)
            .comment('Total assignments made');

        table.timestamp('last_assigned_at').nullable();

        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
        table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();

        table.unique(['workflow_id', 'node_id'], 'uq_round_robin_workflow_node');
        table.index(['user_id'], 'idx_round_robin_user');
    });

    console.log('✅ Created tbl_round_robin_state table');
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('tbl_round_robin_state');
    console.log('⏪ Dropped tbl_round_robin_state table');
}
