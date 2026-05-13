import type { Knex } from 'knex';

/**
 * Migration: Extend tbl_subscriber_segment with source tracking
 *
 * Adds 'source' field to track how a contact was added to a segment/list.
 * This is important for:
 * - Analytics (how are contacts joining segments?)
 * - Compliance (GDPR consent tracking)
 * - Debugging (trace contact journey)
 *
 * Possible sources:
 * - 'manual': Manually added by user
 * - 'import': CSV/bulk import
 * - 'form': Form submission
 * - 'workflow': Automation workflow action
 * - 'api': API call
 */
export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('tbl_subscriber_segment', (table) => {
        table.string('source', 50).nullable()
            .comment('How contact was added: manual, import, form, workflow, api');

        // Index for analytics queries
        table.index(['segment_id', 'source'], 'idx_subscriber_segment_source');
    });

    // Set default source for existing records
    // Assume existing records were manually added
    await knex('tbl_subscriber_segment').update({ source: 'manual' });

    const result = await knex('tbl_subscriber_segment').count('* as count');
    const count = result[0]?.count || 0;

    console.log(`✅ Extended tbl_subscriber_segment with source field (updated ${count} existing records)`);
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('tbl_subscriber_segment', (table) => {
        // Drop index first
        table.dropIndex(['segment_id', 'source'], 'idx_subscriber_segment_source');

        // Drop column
        table.dropColumn('source');
    });

    console.log('⏪ Rolled back tbl_subscriber_segment source field');
}
