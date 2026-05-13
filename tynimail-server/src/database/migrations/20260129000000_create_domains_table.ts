import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    const tableExists = await knex.schema.hasTable('tbl_domains');

    if (tableExists) {
        console.log('Table tbl_domains already exists, skipping...');
        return;
    }

    await knex.schema.createTable('tbl_domains', (table) => {
        table
            .uuid('id')
            .primary()
            .defaultTo(knex.raw('uuid_generate_v4()'));

        table
            .uuid('user_id')
            .notNullable()
            .references('id')
            .inTable('tbl_users')
            .onDelete('CASCADE');

        table.string('domain_name', 255).notNullable().unique();
        table.integer('postmark_domain_id').unique().nullable();

        // DKIM record (TXT)
        table.text('dkim_host').nullable();
        table.text('dkim_value').nullable();

        // Return-Path record (CNAME)
        table.string('return_path_cname_name', 255).nullable();
        table.string('return_path_cname_value', 255).nullable();

        table.boolean('is_verified').notNullable().defaultTo(false);

        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
        table.timestamp('verified_at').nullable();

        // Indexes for common access patterns
        table.index(['user_id'], 'idx_domains_user_id');
        table.index(['is_verified'], 'idx_domains_is_verified');
        table.index(['postmark_domain_id'], 'idx_domains_postmark_id');
        table.index(['user_id', 'is_verified'], 'idx_domains_user_verified');
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('tbl_domains');
}
