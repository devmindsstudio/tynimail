import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const tableExists = await knex.schema.hasTable('tbl_brand_styles');

  if (tableExists) {
    console.log('Table tbl_brand_styles already exists, skipping...');
    return;
  }

  await knex.schema.createTable('tbl_brand_styles', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));

    table
      .uuid('user_id')
      .notNullable()
      .unique()
      .references('id')
      .inTable('tbl_users')
      .onDelete('CASCADE');

    table
      .uuid('default_logo_id')
      .nullable()
      .references('id')
      .inTable('tbl_brand_logos')
      .onDelete('SET NULL');

    table.string('company_address', 500).nullable();
    table.string('footer_email', 255).nullable();

    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').nullable();
  });
  console.log('✅ Added table tbl_brand_styles');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('tbl_brand_styles');
  console.log('⏪ Dropped table tbl_brand_styles');
}
