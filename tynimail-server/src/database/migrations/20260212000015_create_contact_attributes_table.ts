import type { Knex } from 'knex';

/**
 * Migration: Create tbl_contact_attributes table
 *
 * Defines custom attribute schema for contacts.
 * Allows users to define custom fields beyond the standard firstName, lastName, email.
 *
 * Examples:
 * - "plan" (string): "free", "premium", "enterprise"
 * - "company" (string): "Acme Inc"
 * - "signup_date" (date): "2024-01-15"
 * - "trial_ends_at" (date): "2024-02-15"
 * - "monthly_spend" (number): 99.99
 *
 * Actual attribute values are stored in tbl_subscribers.metadata.attributes
 * This table just defines the schema/validation rules.
 */
export async function up(knex: Knex): Promise<void> {
    const tableExists = await knex.schema.hasTable('tbl_contact_attributes');

    if (tableExists) {
        console.log('⚠️  Table tbl_contact_attributes already exists, skipping...');
        return;
    }

    await knex.schema.createTable('tbl_contact_attributes', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));

        table.uuid('user_id')
            .notNullable()
            .references('id')
            .inTable('tbl_users')
            .onDelete('CASCADE');

        table.string('name', 100).notNullable()
            .comment('Attribute key (e.g., "plan", "company", "trial_ends_at")');

        table.string('label', 255).notNullable()
            .comment('Human-readable label (e.g., "Subscription Plan", "Company Name")');

        table.enum('data_type', ['string', 'number', 'date', 'boolean'])
            .notNullable()
            .comment('Data type for validation');

        table.text('description').nullable();

        table.boolean('is_required').defaultTo(false).notNullable();

        table.jsonb('options').nullable()
            .comment('For string fields: allowed values (e.g., ["free", "premium", "enterprise"])');

        table.string('default_value', 500).nullable();

        table.integer('display_order').defaultTo(0)
            .comment('Order to display in UI');

        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
        table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();

        table.unique(['user_id', 'name'], 'uq_attributes_user_name');
        table.index(['user_id', 'display_order'], 'idx_attributes_user_order');
    });

    console.log('✅ Created tbl_contact_attributes table');
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('tbl_contact_attributes');
    console.log('⏪ Dropped tbl_contact_attributes table');
}
