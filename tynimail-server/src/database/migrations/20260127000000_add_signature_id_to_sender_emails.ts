import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    const hasSignatureId = await knex.schema.hasColumn('tbl_sender_emails', 'signature_id');

    if (!hasSignatureId) {
        await knex.schema.alterTable('tbl_sender_emails', (table) => {
            table.string('signature_id').nullable();
            table.index(['signature_id'], 'idx_sender_emails_signature_id');
        });
        console.log('Added signature_id column to tbl_sender_emails');
    } else {
        console.log('signature_id column already exists in tbl_sender_emails, skipping...');
    }
}

export async function down(knex: Knex): Promise<void> {
    const hasSignatureId = await knex.schema.hasColumn('tbl_sender_emails', 'signature_id');

    if (hasSignatureId) {
        await knex.schema.alterTable('tbl_sender_emails', (table) => {
            table.dropIndex(['signature_id'], 'idx_sender_emails_signature_id');
            table.dropColumn('signature_id');
        });
        console.log('Removed signature_id column from tbl_sender_emails');
    }
}
