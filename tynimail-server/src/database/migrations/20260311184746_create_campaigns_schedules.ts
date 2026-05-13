import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  const tableExists = await knex.schema.hasTable("tbl_campaign_schedules");
  if (tableExists) {
    console.log("Table tbl_campaign_schedules already exists, skipping...");
    return;
  }

  await knex.schema.createTable("tbl_campaign_schedules", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table
      .uuid("campaign_id")
      .notNullable()
      .references("id")
      .inTable("tbl_campaigns")
      .onDelete("CASCADE");
    table.timestamp("date").notNullable();
    table.smallint("status").notNullable().defaultTo(0); // 0=pending, 1=queued, 2=ran, 3=skipped, 4=failed
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    table.index(["campaign_id"]);
    table.index(["status"]);
  });

  console.log("✅ Created tbl_campaign_schedules");
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("tbl_campaign_schedules");
  console.log("⏪ Dropped tbl_campaign_schedules");
}
