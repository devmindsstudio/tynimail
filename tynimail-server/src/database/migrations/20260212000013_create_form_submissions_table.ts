import type { Knex } from 'knex';

/**
 * Migration: Create tbl_form_submissions table
 *
 * Stores all form submissions with submitted data.
 * Each submission can create/update a contact and trigger workflows.
 */
export async function up(knex: Knex): Promise<void> {
    const tableExists = await knex.schema.hasTable('tbl_form_submissions');

    if (tableExists) {
        console.log('⚠️  Table tbl_form_submissions already exists, skipping...');
        return;
    }

    await knex.schema.createTable('tbl_form_submissions', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));

        table.uuid('user_id')
            .notNullable()
            .references('id')
            .inTable('tbl_users')
            .onDelete('CASCADE');

        // References
        table.uuid('form_id')
            .notNullable()
            .references('id')
            .inTable('tbl_forms')
            .onDelete('CASCADE');

        table.uuid('contact_id')
            .nullable()
            .references('id')
            .inTable('tbl_subscribers')
            .onDelete('SET NULL')
            .comment('Contact created/updated from this submission');

        // Submission data
        table.jsonb('data').notNullable()
            .comment('Form field values: {firstName: "John", email: "john@example.com", ...}');

        table.string('ip_address', 45).nullable()
            .comment('IP address of submitter');

        table.string('user_agent', 500).nullable()
            .comment('Browser user agent');

        table.string('referrer', 1000).nullable()
            .comment('Referring URL');

        table.timestamp('submitted_at').defaultTo(knex.fn.now()).notNullable();

        table.index(['user_id', 'form_id'], 'idx_form_submissions_user_form');
        table.index(['form_id', 'submitted_at'], 'idx_form_submissions_form_date');
        table.index(['contact_id'], 'idx_form_submissions_contact');
    });

    console.log('✅ Created tbl_form_submissions table');
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('tbl_form_submissions');
    console.log('⏪ Dropped tbl_form_submissions table');
}
