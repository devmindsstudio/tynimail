import type { Knex } from 'knex';

/**
 * Migration: Create tbl_forms table
 *
 * Stores form definitions for lead capture.
 * Forms can be embedded on websites to collect contact information.
 *
 * Form submissions can trigger workflows (e.g., "Send welcome email when contact form is submitted")
 */
export async function up(knex: Knex): Promise<void> {
    const tableExists = await knex.schema.hasTable('tbl_forms');

    if (tableExists) {
        console.log('⚠️  Table tbl_forms already exists, skipping...');
        return;
    }

    await knex.schema.createTable('tbl_forms', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));

        table.uuid('user_id')
            .notNullable()
            .references('id')
            .inTable('tbl_users')
            .onDelete('CASCADE');

        table.string('name', 255).notNullable()
            .comment('Form name (e.g., "Contact Us", "Newsletter Signup")');

        table.text('description').nullable();

        // Form configuration
        table.jsonb('fields').notNullable()
            .comment('Array of field definitions: [{name, type, label, required, options}]');

        table.uuid('add_to_list_id')
            .nullable()
            .references('id')
            .inTable('tbl_segments')
            .onDelete('SET NULL')
            .comment('Automatically add submissions to this list');

        table.string('redirect_url', 1000).nullable()
            .comment('Where to redirect after successful submission');

        table.text('success_message').nullable()
            .comment('Message to show after submission');

        table.boolean('is_active').defaultTo(true).notNullable();

        table.integer('submission_count').defaultTo(0)
            .comment('Total number of submissions');

        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
        table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();

        table.index(['user_id', 'is_active'], 'idx_forms_user_active');
    });

    console.log('✅ Created tbl_forms table');
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('tbl_forms');
    console.log('⏪ Dropped tbl_forms table');
}
