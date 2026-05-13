/**
 * Seed Script: Create Test Workflows
 *
 * Usage:
 *   ts-node -r tsconfig-paths/register src/modules/testing/scripts/seed-test-workflows.ts <userId> <listId> [onboardedListId] [engagedListId]
 *
 * Example:
 *   ts-node -r tsconfig-paths/register src/modules/testing/scripts/seed-test-workflows.ts \
 *     "123e4567-e89b-12d3-a456-426614174000" \
 *     "list-uuid-here" \
 *     "onboarded-list-uuid" \
 *     "engaged-list-uuid"
 */

import * as knexLib from 'knex';
import { config } from 'dotenv';
import { resolve } from 'path';
import { ALL_WORKFLOW_FIXTURES } from '../fixtures/workflows.fixture';

// Load environment variables
config({ path: resolve(__dirname, '../../../../.env.local') });

const knexConfig = {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'tynimail',
  },
};

const knex = knexLib.knex(knexConfig);

async function seedTestWorkflows(
  userId: string,
  listId: string,
  onboardedListId?: string,
  engagedListId?: string,
) {
  console.log('🌱 Seeding test workflows...\n');
  console.log(`User ID: ${userId}`);
  console.log(`List ID: ${listId}`);
  console.log(`Onboarded List ID: ${onboardedListId || 'N/A'}`);
  console.log(`Engaged List ID: ${engagedListId || 'N/A'}\n`);

  const createdWorkflows: any[] = [];

  for (const fixture of ALL_WORKFLOW_FIXTURES) {
    try {
      // Replace placeholder IDs
      let workflowData = JSON.stringify(fixture);
      workflowData = workflowData.replace(/\{\{REPLACE_WITH_LIST_ID\}\}/g, listId);
      workflowData = workflowData.replace(/\{\{REPLACE_WITH_ONBOARDED_LIST_ID\}\}/g, onboardedListId || listId);
      workflowData = workflowData.replace(/\{\{REPLACE_WITH_ENGAGED_LIST_ID\}\}/g, engagedListId || listId);

      const workflow = JSON.parse(workflowData);

      // Insert workflow
      const [created] = await knex('tbl_workflows')
        .insert({
          user_id: userId,
          name: workflow.name,
          description: workflow.description,
          status: workflow.status,
          allow_reentry: workflow.allow_reentry,
          exit_on_error: workflow.exit_on_error,
          triggers: JSON.stringify(workflow.triggers),
          flow_data: JSON.stringify(workflow.flow_data),
          total_executions: 0,
          active_executions: 0,
          created_at: knex.fn.now(),
          updated_at: knex.fn.now(),
        })
        .returning('*');

      createdWorkflows.push(created);

      console.log(`✅ Created: ${workflow.name} (${created.id})`);
    } catch (error) {
      console.error(`❌ Failed to create: ${fixture.name}`);
      console.error(`   Error: ${error.message}`);
    }
  }

  console.log(`\n✨ Successfully created ${createdWorkflows.length}/${ALL_WORKFLOW_FIXTURES.length} workflows\n`);

  // Print summary
  console.log('📋 Workflow Summary:');
  console.log('─────────────────────────────────────────────────────────');
  for (const w of createdWorkflows) {
    const triggers = JSON.parse(w.triggers);
    const triggerTypes = triggers.map((t: any) => t.subtype).join(', ');
    console.log(`${w.name}`);
    console.log(`  ID: ${w.id}`);
    console.log(`  Status: ${w.status}`);
    console.log(`  Triggers: ${triggerTypes}`);
    console.log('');
  }

  return createdWorkflows;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('❌ Usage: ts-node seed-test-workflows.ts <userId> <listId> [onboardedListId] [engagedListId]');
    console.error('\nExample:');
    console.error('  ts-node -r tsconfig-paths/register src/modules/testing/scripts/seed-test-workflows.ts \\');
    console.error('    "user-uuid-here" \\');
    console.error('    "list-uuid-here" \\');
    console.error('    "onboarded-list-uuid" \\');
    console.error('    "engaged-list-uuid"');
    process.exit(1);
  }

  const [userId, listId, onboardedListId, engagedListId] = args;

  try {
    await seedTestWorkflows(userId, listId, onboardedListId, engagedListId);
    console.log('✅ Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await knex.destroy();
  }
}

main();
