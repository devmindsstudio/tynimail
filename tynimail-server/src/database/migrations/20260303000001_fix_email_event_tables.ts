import type { Knex } from 'knex';

/**
 * Fix email event tracking tables:
 *
 * tbl_email_events:
 *  - Update event_type CHECK to use past-tense values matching the service
 *    ('opened', 'clicked', 'bounced', 'unsubscribed', etc.)
 *
 * tbl_sent_emails:
 *  - Add open_count, click_count, first_opened_at, first_clicked_at, updated_at
 *  - Update status CHECK to include 'spam'
 */
export async function up(knex: Knex): Promise<void> {
  // ── tbl_email_events ──────────────────────────────────────────────────────

  // Drop old CHECK (allowed: open, click, bounce, spam_complaint, unsubscribe, delivered)
  await knex.raw(
    'ALTER TABLE tbl_email_events DROP CONSTRAINT IF EXISTS tbl_email_events_event_type_check',
  );

  // Add new CHECK using past-tense values that match PostmarkWebhookService output
  await knex.raw(`
    ALTER TABLE tbl_email_events
    ADD CONSTRAINT tbl_email_events_event_type_check
    CHECK (event_type = ANY (ARRAY[
      'opened', 'clicked', 'bounced', 'delivered',
      'spam_complaint', 'unsubscribed'
    ]))
  `);

  // ── tbl_sent_emails ───────────────────────────────────────────────────────

  await knex.schema.alterTable('tbl_sent_emails', (table) => {
    table.integer('open_count').notNullable().defaultTo(0);
    table.integer('click_count').notNullable().defaultTo(0);
    table.timestamp('first_opened_at', { useTz: true }).nullable();
    table.timestamp('first_clicked_at', { useTz: true }).nullable();
    table.timestamp('updated_at', { useTz: true }).nullable();
  });

  // Drop old status CHECK, add new one that includes 'spam'
  await knex.raw(
    'ALTER TABLE tbl_sent_emails DROP CONSTRAINT IF EXISTS tbl_sent_emails_status_check',
  );
  await knex.raw(`
    ALTER TABLE tbl_sent_emails
    ADD CONSTRAINT tbl_sent_emails_status_check
    CHECK (status = ANY (ARRAY[
      'sent', 'delivered', 'bounced', 'failed', 'spam'
    ]))
  `);
}

export async function down(knex: Knex): Promise<void> {
  // Revert tbl_email_events event_type CHECK
  await knex.raw(
    'ALTER TABLE tbl_email_events DROP CONSTRAINT IF EXISTS tbl_email_events_event_type_check',
  );
  await knex.raw(`
    ALTER TABLE tbl_email_events
    ADD CONSTRAINT tbl_email_events_event_type_check
    CHECK (event_type = ANY (ARRAY[
      'open', 'click', 'bounce', 'spam_complaint', 'unsubscribe', 'delivered'
    ]))
  `);

  // Revert tbl_sent_emails columns
  await knex.schema.alterTable('tbl_sent_emails', (table) => {
    table.dropColumn('open_count');
    table.dropColumn('click_count');
    table.dropColumn('first_opened_at');
    table.dropColumn('first_clicked_at');
    table.dropColumn('updated_at');
  });

  // Revert status CHECK
  await knex.raw(
    'ALTER TABLE tbl_sent_emails DROP CONSTRAINT IF EXISTS tbl_sent_emails_status_check',
  );
  await knex.raw(`
    ALTER TABLE tbl_sent_emails
    ADD CONSTRAINT tbl_sent_emails_status_check
    CHECK (status = ANY (ARRAY['sent', 'delivered', 'bounced', 'failed']))
  `);
}
