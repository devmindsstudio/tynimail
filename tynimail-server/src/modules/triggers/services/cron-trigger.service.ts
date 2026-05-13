import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Inject } from '@nestjs/common';
import { Knex } from 'knex';
import { CronTriggerQueueProducer } from '@/modules/queues/producers/cron-trigger-queue.producer';

const CRON_TRIGGER_SUBTYPES = [
  'anniversary',
  'contact_in_segment',
  'contact_matches_filter',
];

@Injectable()
export class CronTriggerService {
  private readonly logger = new Logger(CronTriggerService.name);

  constructor(
    @Inject('KNEX_CONNECTION') private knex: Knex,
    private cronTriggerQueueProducer: CronTriggerQueueProducer,
  ) {}

  @Cron('* * * * *') // Every minute
  async processScheduledTriggers(): Promise<void> {
    const now = new Date();
    const currentTime = `${now.getUTCHours().toString().padStart(2, '0')}:${now.getUTCMinutes().toString().padStart(2, '0')}`;

    // Find all active workflows with a cron-based trigger matching the current UTC time
    const workflows = await this.knex('tbl_workflows')
      .where({ status: 'active' })
      .whereRaw(
        `EXISTS (
          SELECT 1 FROM jsonb_array_elements(triggers) AS t
          WHERE (t->>'subtype') = ANY(?)
          AND (t->'config'->>'entryTime') = ?
        )`,
        [CRON_TRIGGER_SUBTYPES, currentTime],
      )
      .select('id', 'user_id', 'triggers');

    if (workflows.length === 0) return;

    this.logger.log(
      `[CRON-TRIGGER] ${currentTime} UTC — found ${workflows.length} workflow(s) to dispatch`,
    );

    for (const workflow of workflows) {
      const triggers =
        typeof workflow.triggers === 'string'
          ? JSON.parse(workflow.triggers)
          : workflow.triggers ?? [];

      for (const trigger of triggers) {
        if (!CRON_TRIGGER_SUBTYPES.includes(trigger.subtype)) continue;
        if (trigger.config?.entryTime !== currentTime) continue;

        await this.cronTriggerQueueProducer.enqueue({
          workflowId: workflow.id,
          userId: workflow.user_id,
          triggerSubtype: trigger.subtype,
          triggerConfig: trigger.config,
          triggerNodeId: trigger.nodeId,
        });

        this.logger.log(
          `[CRON-TRIGGER] Enqueued ${trigger.subtype} job for workflow "${workflow.id}"`,
        );
      }
    }
  }
}
