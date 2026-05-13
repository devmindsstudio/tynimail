import type { Knex } from 'knex';

/**
 * Migration: Create tbl_webhook_logs table
 *
 * Logs all webhook calls made by workflow actions.
 * Useful for debugging and monitoring webhook integrations.
 */
export async function up(knex: Knex): Promise<void> {
    const tableExists = await knex.schema.hasTable('tbl_webhook_logs');

    if (tableExists) {
        console.log('⚠️  Table tbl_webhook_logs already exists, skipping...');
        return;
    }

    await knex.schema.createTable('tbl_webhook_logs', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));

        table.uuid('user_id')
            .notNullable()
            .references('id')
            .inTable('tbl_users')
            .onDelete('CASCADE');

        // References
        table.uuid('execution_id')
            .nullable()
            .references('id')
            .inTable('tbl_workflow_executions')
            .onDelete('SET NULL')
            .comment('Which execution triggered this webhook');

        table.uuid('workflow_id')
            .nullable()
            .references('id')
            .inTable('tbl_workflows')
            .onDelete('SET NULL');

        // Webhook details
        table.string('url', 1000).notNullable()
            .comment('Webhook URL called');

        table.string('method', 10).notNullable()
            .comment('HTTP method: POST, GET, PUT, etc.');

        table.jsonb('headers').nullable()
            .comment('Request headers sent');

        table.text('request_body').nullable()
            .comment('Request payload sent');

        table.integer('status_code').nullable()
            .comment('HTTP response status code');

        table.text('response_body').nullable()
            .comment('Response received');

        table.boolean('success').defaultTo(false).notNullable();

        table.text('error').nullable()
            .comment('Error message if webhook failed');

        table.integer('duration_ms').nullable()
            .comment('Request duration in milliseconds');

        table.timestamp('called_at').defaultTo(knex.fn.now()).notNullable();

        table.index(['user_id', 'execution_id'], 'idx_webhook_logs_user_execution');
        table.index(['workflow_id', 'called_at'], 'idx_webhook_logs_workflow_date');
        table.index(['success', 'called_at'], 'idx_webhook_logs_success_date');
    });

    console.log('✅ Created tbl_webhook_logs table');
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('tbl_webhook_logs');
    console.log('⏪ Dropped tbl_webhook_logs table');
}
