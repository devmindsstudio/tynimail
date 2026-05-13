import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('tbl_forms');
  if (!hasTable) return;

  await knex.schema.alterTable('tbl_forms', (table) => {
    table
      .boolean('is_active')
      .alter({ alterType: true })
      .nullable()
      .defaultTo(true);
    table.jsonb('fields').alter({ alterType: true }).nullable().defaultTo({});
  });

  console.log('✅ Changed types of is_active and fields in tbl_forms');
}

export async function down(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('tbl_forms');
  if (!hasTable) return;

  await knex.schema.alterTable('tbl_forms', (table) => {
    table
      .boolean('is_active')
      .alter({ alterType: true })
      .notNullable()
      .defaultTo(true);
    table.jsonb('fields').alter({ alterType: true }).nullable().defaultTo({});
  });

  console.log('⏪ Changed is_active and fields from tbl_forms');
}
