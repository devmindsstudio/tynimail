import type { Knex } from 'knex';

/**
 * Migration: Create tbl_contact_blocklist table
 *
 * Stores contacts who should not receive emails.
 * Reasons:
 * - User unsubscribed
 * - Email marked as spam
 * - Hard bounce (invalid email)
 * - Manual blocklist by admin
 *
 * All email sending actions must check this table before sending.
 */
export async function up(knex: Knex): Promise<void> {
    const tableExists = await knex.schema.hasTable('tbl_contact_blocklist');

    if (tableExists) {
        console.log('⚠️  Table tbl_contact_blocklist already exists, skipping...');
        return;
    }

    await knex.schema.createTable('tbl_contact_blocklist', (table) => {
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

        table.string('email', 255).notNullable()
            .comment('Email address (denormalized for faster lookup)');

        table.enum('reason', [
            'unsubscribed',
            'spam_complaint',
            'hard_bounce',
            'manual',
            'compliance'
        ])
            .notNullable()
            .comment('Why contact was blocklisted');

        table.text('notes').nullable()
            .comment('Additional context');

        table.timestamp('blocked_at').defaultTo(knex.fn.now()).notNullable();

        table.unique(['user_id', 'contact_id'], 'uq_blocklist_user_contact');
        table.index(['user_id', 'email'], 'idx_blocklist_user_email');
        table.index(['email'], 'idx_blocklist_email');
    });

    console.log('✅ Created tbl_contact_blocklist table');
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('tbl_contact_blocklist');
    console.log('⏪ Dropped tbl_contact_blocklist table');
}
