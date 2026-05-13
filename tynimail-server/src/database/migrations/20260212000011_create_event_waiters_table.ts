import type { Knex } from 'knex';

/**
 * Migration: Create tbl_event_waiters table
 *
 * Tracks executions paused on "wait-for-event" nodes.
 *
 * Example: "Wait up to 3 days for email to be opened, then continue"
 * - Creates waiter record with expiration in 3 days
 * - If email opens before expiration → resolve waiter, continue on "YES" branch
 * - If 3 days pass → timeout task resolves waiter, continue on "NO" branch
 */
export async function up(knex: Knex): Promise<void> {
    const tableExists = await knex.schema.hasTable('tbl_event_waiters');

    if (tableExists) {
        console.log('⚠️  Table tbl_event_waiters already exists, skipping...');
        return;
    }

    await knex.schema.createTable('tbl_event_waiters', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));

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
            .comment('Which execution is waiting');

        table.uuid('workflow_id')
            .notNullable()
            .references('id')
            .inTable('tbl_workflows')
            .onDelete('CASCADE');

        table.uuid('contact_id')
            .notNullable()
            .references('id')
            .inTable('tbl_subscribers')
            .onDelete('CASCADE');

        table.string('node_id', 100).notNullable()
            .comment('Wait-for-event node ID');

        // Event criteria
        table.string('event_type', 100).notNullable()
            .comment('Type of event to wait for (e.g., "email_opened", "purchase")');

        table.jsonb('event_config').nullable()
            .comment('Event matching criteria (e.g., {campaignId: "abc123"})');

        // Waiter state
        table.boolean('resolved').defaultTo(false).notNullable()
            .comment('True if waiter has been resolved (event occurred or timeout)');

        table.string('branch', 50).nullable()
            .comment('Which branch to take when resuming: "yes" (event occurred) or "no" (timeout)');

        table.timestamp('expires_at').notNullable()
            .comment('When waiter times out');

        table.timestamp('resolved_at').nullable()
            .comment('When waiter was resolved');

        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();

        table.index(['user_id', 'event_type', 'contact_id', 'resolved'], 'idx_waiters_user_event_contact_resolved');
        table.index(['execution_id'], 'idx_waiters_execution');
        table.index(['resolved', 'expires_at'], 'idx_waiters_resolved_expires');
        table.index(['event_type', 'resolved'], 'idx_waiters_type_resolved');
    });

    console.log('✅ Created tbl_event_waiters table');
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('tbl_event_waiters');
    console.log('⏪ Dropped tbl_event_waiters table');
}
