import type { Knex } from 'knex';

/**
 * Migration: Create tbl_email_templates table
 *
 * Stores email templates for use in workflows.
 * Templates can include variables like {{firstName}}, {{email}}, {{attributes.plan}}
 *
 * Note: This is separate from tbl_user_templates (which stores general templates).
 * This table is specifically for workflow automation emails.
 */
export async function up(knex: Knex): Promise<void> {
    const tableExists = await knex.schema.hasTable('tbl_email_templates');

    if (tableExists) {
        console.log('⚠️  Table tbl_email_templates already exists, skipping...');
        return;
    }

    await knex.schema.createTable('tbl_email_templates', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));

        table.uuid('user_id')
            .notNullable()
            .references('id')
            .inTable('tbl_users')
            .onDelete('CASCADE');

        table.string('name', 255).notNullable()
            .comment('Template name (e.g., "Welcome Email", "Trial Expiring")');

        table.text('description').nullable();

        table.string('subject', 500).notNullable()
            .comment('Email subject line (can include {{variables}})');

        table.string('preheader_text', 500).nullable()
            .comment('Email preheader/preview text');

        table.text('html_content').nullable()
            .comment('HTML version of email body');

        table.text('text_content').nullable()
            .comment('Plain text version of email body');

        table.jsonb('variables').nullable()
            .comment('List of available variables: ["firstName", "email", "plan"]');

        table.boolean('is_active').defaultTo(true).notNullable();

        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
        table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();

        table.index(['user_id', 'is_active'], 'idx_email_templates_user_active');
    });

    console.log('✅ Created tbl_email_templates table');
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('tbl_email_templates');
    console.log('⏪ Dropped tbl_email_templates table');
}
