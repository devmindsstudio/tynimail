import type { Knex } from 'knex';

/**
 * Migration: Create tbl_email_events table
 *
 * Tracks email engagement events from Postmark webhooks:
 * - Opens
 * - Clicks
 * - Bounces
 * - Spam complaints
 * - Unsubscribes
 *
 * These events can trigger workflows (e.g., "Send follow-up when email is opened")
 */
export async function up(knex: Knex): Promise<void> {
    const tableExists = await knex.schema.hasTable('tbl_email_events');

    if (tableExists) {
        console.log('⚠️  Table tbl_email_events already exists, skipping...');
        return;
    }

    await knex.schema.createTable('tbl_email_events', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));

        table.uuid('user_id')
            .notNullable()
            .references('id')
            .inTable('tbl_users')
            .onDelete('CASCADE');

        // References
        table.uuid('contact_id')
            .notNullable()
            .references('id')
            .inTable('tbl_subscribers')
            .onDelete('CASCADE');

        table.uuid('sent_email_id')
            .nullable()
            .references('id')
            .inTable('tbl_sent_emails')
            .onDelete('SET NULL')
            .comment('Which sent email this event relates to');

        // Event details
        table.enum('event_type', [
            'open',
            'click',
            'bounce',
            'spam_complaint',
            'unsubscribe',
            'delivered'
        ])
            .notNullable()
            .comment('Type of email event');

        table.string('postmark_message_id', 255).nullable();

        table.string('link_url', 1000).nullable()
            .comment('For click events: which link was clicked');

        table.enum('bounce_type', ['hard', 'soft', 'transient', 'spam'])
            .nullable()
            .comment('For bounce events: type of bounce');

        table.text('bounce_description').nullable();

        table.jsonb('metadata').nullable()
            .comment('Additional event data from Postmark');

        table.boolean('is_apple_privacy')
            .defaultTo(false)
            .comment('True if open event from Apple Mail Privacy Protection');

        table.timestamp('event_at').defaultTo(knex.fn.now()).notNullable()
            .comment('When the event occurred');

        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();

        table.index(['user_id', 'contact_id', 'event_type'], 'idx_email_events_user_contact_type');
        table.index(['user_id', 'event_type', 'event_at'], 'idx_email_events_user_type_date');
        table.index(['sent_email_id'], 'idx_email_events_sent_email');
        table.index(['postmark_message_id'], 'idx_email_events_postmark_id');
        table.index(['event_type', 'event_at'], 'idx_email_events_type_date');
    });

    console.log('✅ Created tbl_email_events table');
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('tbl_email_events');
    console.log('⏪ Dropped tbl_email_events table');
}
