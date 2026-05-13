import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  if (await knex.schema.hasTable('tbl_page_templates')) {
    const hasColumn = await knex.schema.hasColumn('tbl_page_templates', 'content');
    if (hasColumn) {
      await knex.raw(`
        ALTER TABLE tbl_page_templates
        ALTER COLUMN content TYPE text USING content::text,
        ALTER COLUMN content SET DEFAULT ''
      `);
    }
  }

  if (await knex.schema.hasTable('tbl_pages')) {
    const hasColumn = await knex.schema.hasColumn('tbl_pages', 'content');
    if (hasColumn) {
      await knex.raw(`
        ALTER TABLE tbl_pages
        ALTER COLUMN content TYPE text USING content::text,
        ALTER COLUMN content SET DEFAULT ''
      `);
    }
  }
}

export async function down(knex: Knex): Promise<void> {
  if (await knex.schema.hasTable('tbl_page_templates')) {
    await knex.raw(`
      ALTER TABLE tbl_page_templates
      ALTER COLUMN content TYPE jsonb USING content::jsonb,
      ALTER COLUMN content SET DEFAULT '{}'
    `);
  }

  if (await knex.schema.hasTable('tbl_pages')) {
    await knex.raw(`
      ALTER TABLE tbl_pages
      ALTER COLUMN content TYPE jsonb USING content::jsonb,
      ALTER COLUMN content SET DEFAULT '{}'
    `);
  }
}
