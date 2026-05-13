import type { Knex } from 'knex';

/**
 * Migration: Extend tbl_subscribers for automation features
 *
 * Adds fields needed for email automation system:
 * - phone: Contact phone number
 * - owner_id: Assigned team member (for round-robin, sales assignment)
 * - last_activity_at: Track last contact activity (for activity-based triggers)
 * - hard_bounce: Flag for permanently undeliverable emails
 * - soft_bounce_count: Track temporary delivery failures
 */
export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('tbl_subscribers', (table) => {
        // Contact information
        table.string('phone', 50).nullable()
            .comment('Contact phone number');

        // Team assignment
        table.uuid('owner_id').nullable()
            .references('id')
            .inTable('tbl_users')
            .onDelete('SET NULL')
            .comment('Assigned team member for contact');

        // Activity tracking
        table.timestamp('last_activity_at').nullable()
            .comment('Last activity timestamp (email open, click, form submit, etc.)');

        // Email deliverability
        table.boolean('hard_bounce').defaultTo(false)
            .comment('True if email permanently undeliverable (invalid, non-existent)');

        table.integer('soft_bounce_count').defaultTo(0)
            .comment('Count of temporary delivery failures (full mailbox, server down)');

        // Indexes for performance
        table.index(['user_id', 'owner_id'], 'idx_subscribers_user_owner');
        table.index(['user_id', 'last_activity_at'], 'idx_subscribers_user_activity');
        table.index(['user_id', 'hard_bounce'], 'idx_subscribers_user_hard_bounce');
        table.index(['phone'], 'idx_subscribers_phone');
    });

    console.log('✅ Extended tbl_subscribers with automation fields');
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('tbl_subscribers', (table) => {
        // Drop indexes first
        table.dropIndex(['user_id', 'owner_id'], 'idx_subscribers_user_owner');
        table.dropIndex(['user_id', 'last_activity_at'], 'idx_subscribers_user_activity');
        table.dropIndex(['user_id', 'hard_bounce'], 'idx_subscribers_user_hard_bounce');
        table.dropIndex(['phone'], 'idx_subscribers_phone');

        // Drop columns
        table.dropColumn('phone');
        table.dropColumn('owner_id');
        table.dropColumn('last_activity_at');
        table.dropColumn('hard_bounce');
        table.dropColumn('soft_bounce_count');
    });

    console.log('⏪ Rolled back tbl_subscribers automation fields');
}
