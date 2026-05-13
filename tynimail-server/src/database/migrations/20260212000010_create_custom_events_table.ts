import type { Knex } from 'knex';

/**
 * Migration: Create tbl_custom_events table
 *
 * Tracks custom events sent via API (POST /api/events).
 * Examples:
 * - User made a purchase
 * - User completed onboarding
 * - User upgraded plan
 * - User reached a milestone
 *
 * These events can trigger workflows (e.g., "Send thank you email when purchase occurs")
 */
export async function up(knex: Knex): Promise<void> {
    const tableExists = await knex.schema.hasTable('tbl_custom_events');

    if (tableExists) {
        console.log('⚠️  Table tbl_custom_events already exists, skipping...');
        return;
    }

    await knex.schema.createTable('tbl_custom_events', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));

        table.uuid('user_id')
            .notNullable()
            .references('id')
            .inTable('tbl_users')
            .onDelete('CASCADE');

        table.uuid('contact_id')
            .notNullable()
            .references('id')
            .inTable('tbl_subscribers')
            .onDelete('CASCADE');

        // Event details
        table.string('event_name', 255).notNullable()
            .comment('Event name (e.g., "purchase", "signup_completed", "trial_started")');

        table.jsonb('properties').nullable()
            .comment('Event properties (e.g., {amount: 99.99, product: "Pro Plan"})');

        table.timestamp('event_at').defaultTo(knex.fn.now()).notNullable()
            .comment('When the event occurred');

        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();

        table.index(['user_id', 'contact_id', 'event_name'], 'idx_custom_events_user_contact_name');
        table.index(['user_id', 'event_name', 'event_at'], 'idx_custom_events_user_name_date');
        table.index(['contact_id', 'event_at'], 'idx_custom_events_contact_date');
        table.index(['event_name'], 'idx_custom_events_name');
    });

    console.log('✅ Created tbl_custom_events table');
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('tbl_custom_events');
    console.log('⏪ Dropped tbl_custom_events table');
}
