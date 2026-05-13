import type { Knex } from 'knex';

/**
 * Migration: Extend tbl_segments for dynamic segment support
 *
 * Adds fields to support two types of segments:
 * 1. STATIC segments (traditional lists) - manually managed contact groups
 * 2. DYNAMIC segments (filter-based) - auto-updating based on filter criteria
 *
 * Dynamic segments use a filter definition to automatically include/exclude
 * contacts based on their attributes, list membership, activity, etc.
 */
export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('tbl_segments', (table) => {
        // Segment type: static (manual list) or dynamic (filter-based)
        table.enum('segment_type', ['static', 'dynamic'])
            .defaultTo('static')
            .notNullable()
            .comment('Type: static (manual) or dynamic (auto-updated by filters)');

        // Description
        table.text('description').nullable()
            .comment('Segment description for users');

        // Filter definition for dynamic segments
        table.jsonb('filters').nullable()
            .comment('Filter definition for dynamic segments (AND/OR groups with rules)');

        // Cached contact count
        table.integer('contact_count').nullable()
            .comment('Cached count of contacts (updated periodically)');

        // Last evaluation timestamp for dynamic segments
        table.timestamp('last_evaluated_at').nullable()
            .comment('When dynamic segment filters were last evaluated');

        // Visibility flag
        table.boolean('is_public').defaultTo(false)
            .comment('Whether segment is visible to other team members');

        // Indexes for performance
        table.index(['user_id', 'segment_type'], 'idx_segments_user_type');
        table.index(['user_id', 'last_evaluated_at'], 'idx_segments_user_evaluated');
    });

    // Set all existing segments to 'static' type (they were manually created lists)
    await knex('tbl_segments').update({
        segment_type: 'static',
        contact_count: 0,
        is_public: false
    });

    // Update contact counts for existing segments
    await knex.raw(`
        UPDATE tbl_segments s
        SET contact_count = (
            SELECT COUNT(*)
            FROM tbl_subscriber_segment ss
            WHERE ss.segment_id = s.id
        )
    `);

    console.log('✅ Extended tbl_segments with dynamic segment support');
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('tbl_segments', (table) => {
        // Drop indexes first
        table.dropIndex(['user_id', 'segment_type'], 'idx_segments_user_type');
        table.dropIndex(['user_id', 'last_evaluated_at'], 'idx_segments_user_evaluated');

        // Drop columns
        table.dropColumn('segment_type');
        table.dropColumn('description');
        table.dropColumn('filters');
        table.dropColumn('contact_count');
        table.dropColumn('last_evaluated_at');
        table.dropColumn('is_public');
    });

    console.log('⏪ Rolled back tbl_segments automation fields');
}
