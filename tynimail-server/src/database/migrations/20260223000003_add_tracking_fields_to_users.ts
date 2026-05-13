import type { Knex } from 'knex';

/**
 * Migration: Add website tracking fields to tbl_users
 *
 * site_id       - UUID that identifies the user's website in JS snippet calls
 * tracking_enabled - whether the webpage_visited trigger is active for this user
 */
export async function up(knex: Knex): Promise<void> {
    const hasSiteId = await knex.schema.hasColumn('tbl_users', 'site_id');
    const hasTrackingEnabled = await knex.schema.hasColumn('tbl_users', 'tracking_enabled');

    await knex.schema.alterTable('tbl_users', (table) => {
        if (!hasSiteId) {
            table.uuid('site_id').nullable().unique()
                .comment('Public UUID used by the JS tracking snippet to identify this account');
        }
        if (!hasTrackingEnabled) {
            table.boolean('tracking_enabled').notNullable().defaultTo(false)
                .comment('Whether the webpage_visited workflow trigger is active');
        }
    });

    // Backfill site_id for existing users
    await knex.raw(`
        UPDATE tbl_users
        SET site_id = uuid_generate_v4()
        WHERE site_id IS NULL
    `);

    console.log('✅ Added site_id + tracking_enabled to tbl_users');
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('tbl_users', (table) => {
        table.dropColumn('site_id');
        table.dropColumn('tracking_enabled');
    });
    console.log('⏪ Dropped site_id + tracking_enabled from tbl_users');
}
