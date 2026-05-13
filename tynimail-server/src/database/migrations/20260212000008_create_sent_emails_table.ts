import type { Knex } from 'knex';

/**
 * Migration: Create tbl_sent_emails table
 *
 * Tracks all emails sent through workflow automations.
 * Links emails to workflow executions for complete audit trail.
 */
export async function up(knex: Knex): Promise<void> {
    const tableExists = await knex.schema.hasTable('tbl_sent_emails');

    if (tableExists) {
        console.log('⚠️  Table tbl_sent_emails already exists, skipping...');
        return;
    }

    await knex.schema.createTable('tbl_sent_emails', (table) => {
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

        table.uuid('workflow_id')
            .nullable()
            .references('id')
            .inTable('tbl_workflows')
            .onDelete('SET NULL')
            .comment('Which workflow sent this email (null if manual/campaign)');

        table.uuid('execution_id')
            .nullable()
            .references('id')
            .inTable('tbl_workflow_executions')
            .onDelete('SET NULL')
            .comment('Which execution sent this email');

        table.uuid('template_id')
            .nullable()
            .references('id')
            .inTable('tbl_email_templates')
            .onDelete('SET NULL');

        // Email details
        table.string('postmark_message_id', 255).nullable()
            .comment('Postmark Message ID for tracking');

        table.string('subject', 500).notNullable();
        table.string('from_email', 255).notNullable();
        table.string('from_name', 255).nullable();
        table.string('to_email', 255).notNullable();

        table.enum('status', ['sent', 'delivered', 'bounced', 'failed'])
            .defaultTo('sent')
            .notNullable();

        table.text('error').nullable()
            .comment('Error message if sending failed');

        table.timestamp('sent_at').defaultTo(knex.fn.now()).notNullable();
        table.timestamp('delivered_at').nullable();
        table.timestamp('bounced_at').nullable();

        table.index(['user_id', 'contact_id'], 'idx_sent_emails_user_contact');
        table.index(['user_id', 'workflow_id'], 'idx_sent_emails_user_workflow');
        table.index(['execution_id'], 'idx_sent_emails_execution');
        table.index(['postmark_message_id'], 'idx_sent_emails_postmark_id');
        table.index(['status', 'sent_at'], 'idx_sent_emails_status_sent');
    });

    console.log('✅ Created tbl_sent_emails table');
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('tbl_sent_emails');
    console.log('⏪ Dropped tbl_sent_emails table');
}
