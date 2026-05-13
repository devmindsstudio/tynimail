import type { Knex } from 'knex';

/**
 * Migration: Restructure subscriber metadata from flat to nested
 *
 * BEFORE:
 * metadata = {
 *   "open": 5,
 *   "click": 2,
 *   "unique": 3,
 *   "delivered": 10
 * }
 *
 * AFTER:
 * metadata = {
 *   "stats": {
 *     "open": 5,
 *     "click": 2,
 *     "unique": 3,
 *     "delivered": 10
 *   },
 *   "attributes": {
 *     // Custom fields like "plan", "company", etc. will go here
 *   }
 * }
 */
export async function up(knex: Knex): Promise<void> {
    console.log('📦 Migrating subscriber metadata structure...');

    // PostgreSQL-specific: Restructure metadata using jsonb functions
    await knex.raw(`
        UPDATE tbl_subscribers
        SET metadata = jsonb_build_object(
            'stats', COALESCE(metadata, '{}'::jsonb),
            'attributes', '{}'::jsonb
        )
        WHERE metadata IS NOT NULL
    `);

    // Handle records with NULL metadata
    await knex.raw(`
        UPDATE tbl_subscribers
        SET metadata = jsonb_build_object(
            'stats', jsonb_build_object(
                'open', 0,
                'click', 0,
                'unique', 0,
                'delivered', 0
            ),
            'attributes', '{}'::jsonb
        )
        WHERE metadata IS NULL
    `);

    // Get count of migrated records
    const result = await knex('tbl_subscribers').count('* as count');
    const count = result[0]?.count || 0;

    console.log(`✅ Migrated ${count} subscriber metadata records to new structure`);
}

export async function down(knex: Knex): Promise<void> {
    console.log('⏪ Rolling back subscriber metadata structure...');

    // Restore original flat structure by extracting 'stats' to top level
    await knex.raw(`
        UPDATE tbl_subscribers
        SET metadata = metadata->'stats'
        WHERE metadata IS NOT NULL
          AND metadata ? 'stats'
    `);

    // Handle records that don't have 'stats' key (shouldn't happen but safety)
    await knex.raw(`
        UPDATE tbl_subscribers
        SET metadata = jsonb_build_object(
            'open', 0,
            'click', 0,
            'unique', 0,
            'delivered', 0
        )
        WHERE metadata IS NOT NULL
          AND NOT (metadata ? 'stats')
    `);

    const result = await knex('tbl_subscribers').count('* as count');
    const count = result[0]?.count || 0;

    console.log(`✅ Rolled back ${count} subscriber metadata records to original structure`);
}
