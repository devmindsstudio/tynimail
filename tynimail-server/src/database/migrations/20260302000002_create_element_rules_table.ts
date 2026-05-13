import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const tableExists = await knex.schema.hasTable('tbl_element_rules');

  if (tableExists) {
    console.log('Table tbl_element_rules already exists, skipping...');
    return;
  }

  await knex.schema.createTable('tbl_element_rules', (table) => {
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

    // Must match the custom_event trigger's eventName in the workflow
    table.string('event_name').notNullable();

    // Optional human-readable label for the rule
    table.string('name').nullable();

    // Array of condition objects (AND logic). See dev plan for schema.
    table.jsonb('conditions').notNullable().defaultTo('[]');

    // Static + dynamic property mappings. See dev plan for schema.
    table.jsonb('properties').notNullable().defaultTo('{"static": {}, "dynamic": []}');

    table.boolean('enabled').notNullable().defaultTo(true);

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

    table.index(['user_id', 'event_name'], 'idx_element_rules_user_event');
    table.index(['user_id', 'enabled'], 'idx_element_rules_user_enabled');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('tbl_element_rules');
}
