import { Injectable, Inject, Logger } from '@nestjs/common';
import { Knex } from 'knex';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  IActionExecutor,
  ActionExecutionContext,
  ActionExecutionResult,
} from '../interfaces';

@Injectable()
export class AssignUserExecutor implements IActionExecutor {
  private readonly logger = new Logger(AssignUserExecutor.name);

  constructor(
    @Inject('KNEX_CONNECTION') private readonly knex: Knex,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    config: any,
    context: ActionExecutionContext,
  ): Promise<ActionExecutionResult> {
    const assignmentType: string = config.assignmentType || 'specific';
    let assignedUserId: string;

    if (assignmentType === 'specific') {
      if (!config.userId) {
        return {
          success: false,
          error: 'userId is required for specific assignment',
        };
      }
      assignedUserId = config.userId;
    } else if (assignmentType === 'round_robin') {
      if (!config.userIds?.length) {
        return {
          success: false,
          error: 'userIds array is required for round_robin assignment',
        };
      }
      assignedUserId = await this.getNextRoundRobinUser(
        context.workflowId,
        context.userId,
        context.nodeId || 'assign_user',
        config.userIds,
      );
    } else {
      return {
        success: false,
        error: `Unknown assignmentType: ${assignmentType}`,
      };
    }

    // Verify the user exists
    const assignedUser = await this.knex('tbl_users')
      .where({ id: assignedUserId })
      .first();

    if (!assignedUser) {
      return { success: false, error: `User ${assignedUserId} not found` };
    }

    // Set owner on contact
    await this.knex('tbl_subscribers')
      .where({ id: context.contactId, user_id: context.userId })
      .update({
        owner_id: assignedUserId,
        updated_at: this.knex.fn.now(),
      });

    this.logger.log(
      `[ASSIGN-USER] Contact ${context.contactId} assigned to user ${assignedUserId} (${assignedUser.email}) via ${assignmentType}`,
    );

    this.eventEmitter.emit('contact.assigned', {
      userId: context.userId,
      contactId: context.contactId,
      assignedUserId,
      assignedUserEmail: assignedUser.email,
      assignmentType,
      workflowId: context.workflowId,
      executionId: context.executionId,
    });

    return {
      success: true,
      data: {
        contactId: context.contactId,
        assignedUserId,
        assignedUserEmail: assignedUser.email,
        assignmentType,
      },
    };
  }

  /**
   * Atomically advances the round-robin index and returns the next user ID.
   *
   * The actual tbl_round_robin_state schema stores team_members (JSONB array)
   * alongside current_index. If the config's userIds list changes, reset index to 0.
   */
  private async getNextRoundRobinUser(
    workflowId: string,
    userId: string,
    nodeId: string,
    userIds: string[],
  ): Promise<string> {
    const existing = await this.knex('tbl_round_robin_state')
      .where({ workflow_id: workflowId, node_id: nodeId })
      .first();

    if (!existing) {
      // First time — create state row, assign first user
      await this.knex('tbl_round_robin_state').insert({
        user_id: userId,
        workflow_id: workflowId,
        node_id: nodeId,
        team_members: JSON.stringify(userIds),
        current_index: 0,
        total_assigned: 1,
        last_assigned_at: this.knex.fn.now(),
      });
      return userIds[0];
    }

    // Check if the team members list changed
    const storedMembers: string[] =
      typeof existing.team_members === 'string'
        ? JSON.parse(existing.team_members)
        : existing.team_members;

    const configChanged =
      storedMembers.length !== userIds.length ||
      storedMembers.some((id, i) => id !== userIds[i]);

    let nextIndex: number;
    if (configChanged) {
      // Config changed — reset to beginning with new list
      nextIndex = 0;
      await this.knex('tbl_round_robin_state')
        .where({ workflow_id: workflowId, node_id: nodeId })
        .update({
          team_members: JSON.stringify(userIds),
          current_index: 0,
          total_assigned: (existing.total_assigned || 0) + 1,
          last_assigned_at: this.knex.fn.now(),
          updated_at: this.knex.fn.now(),
        });
    } else {
      nextIndex = (existing.current_index + 1) % userIds.length;
      await this.knex('tbl_round_robin_state')
        .where({ workflow_id: workflowId, node_id: nodeId })
        .update({
          current_index: nextIndex,
          total_assigned: (existing.total_assigned || 0) + 1,
          last_assigned_at: this.knex.fn.now(),
          updated_at: this.knex.fn.now(),
        });
    }

    return userIds[nextIndex];
  }
}
