import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const tableExists = await knex.schema.hasTable('tbl_brand_logos');

  if (tableExists) {
    console.log('Table tbl_brand_logos already exists, skipping...');
    return;
  }

  await knex.schema.createTable('tbl_brand_logos', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));

    table
      .uuid('user_id')
      .notNullable()
      .references('id')
      .inTable('tbl_users')
      .onDelete('CASCADE');

    table.string('s3_key', 512).notNullable(); // stable S3 object key
    table.string('filename', 255).notNullable(); // original upload name
    // table.string('mime_type', 100).notNullable();
    // table.integer('size_bytes').unsigned().notNullable();
    table.boolean('is_default').notNullable().defaultTo(false);

    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // have to make sure that only one brand logo can be set as default per user
  await knex.raw(`
    CREATE UNIQUE INDEX uq_brand_logos_user_default
    ON tbl_brand_logos (user_id)
    WHERE is_default = true;
  `);

  console.log('✅ Added table tbl_brand_logos');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('tbl_brand_logos');
  console.log('⏪ Dropped table tbl_brand_logos');
}
