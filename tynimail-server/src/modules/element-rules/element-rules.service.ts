import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Knex } from 'knex';

export interface Condition {
  field: 'tag' | 'id' | 'class' | 'text' | 'href' | 'path' | 'url' | 'attr';
  attr?: string;
  operator: 'is' | 'is_not' | 'contains' | 'does_not_contain' | 'starts_with' | 'exists';
  value?: string;
}

export interface DynamicProperty {
  key: string;
  source: 'attr' | 'text' | 'href' | 'id' | 'class';
  attr?: string;
}

export interface Properties {
  static: Record<string, any>;
  dynamic: DynamicProperty[];
}

export interface CreateElementRuleDto {
  event_name: string;
  name?: string;
  conditions: Condition[];
  properties?: Properties;
}

export interface UpdateElementRuleDto {
  event_name?: string;
  name?: string;
  conditions?: Condition[];
  properties?: Properties;
  enabled?: boolean;
}

@Injectable()
export class ElementRulesService {
  constructor(@Inject('KNEX_CONNECTION') private knex: Knex) {}

  async getRules(userId: string, eventName?: string): Promise<any[]> {
    const query = this.knex('tbl_element_rules')
      .where({ user_id: userId })
      .orderBy('created_at', 'asc');

    if (eventName) {
      query.where({ event_name: eventName });
    }

    return query;
  }

  async getEnabledRules(userId: string): Promise<any[]> {
    return this.knex('tbl_element_rules')
      .where({ user_id: userId, enabled: true })
      .orderBy('created_at', 'asc');
  }

  async createRule(userId: string, dto: CreateElementRuleDto): Promise<any> {
    const [rule] = await this.knex('tbl_element_rules')
      .insert({
        user_id: userId,
        event_name: dto.event_name,
        name: dto.name ?? null,
        conditions: JSON.stringify(dto.conditions),
        properties: JSON.stringify(dto.properties ?? { static: {}, dynamic: [] }),
        enabled: true,
        created_at: this.knex.fn.now(),
        updated_at: this.knex.fn.now(),
      })
      .returning('*');

    return rule;
  }

  async updateRule(userId: string, ruleId: string, dto: UpdateElementRuleDto): Promise<any> {
    const rule = await this.knex('tbl_element_rules')
      .where({ id: ruleId, user_id: userId })
      .first();

    if (!rule) throw new NotFoundException('Element rule not found');

    const updates: Record<string, any> = { updated_at: this.knex.fn.now() };

    if (dto.event_name !== undefined) updates.event_name = dto.event_name;
    if (dto.name !== undefined) updates.name = dto.name;
    if (dto.conditions !== undefined) updates.conditions = JSON.stringify(dto.conditions);
    if (dto.properties !== undefined) updates.properties = JSON.stringify(dto.properties);
    if (dto.enabled !== undefined) updates.enabled = dto.enabled;

    const [updated] = await this.knex('tbl_element_rules')
      .where({ id: ruleId, user_id: userId })
      .update(updates)
      .returning('*');

    return updated;
  }

  async deleteRule(userId: string, ruleId: string): Promise<void> {
    const deleted = await this.knex('tbl_element_rules')
      .where({ id: ruleId, user_id: userId })
      .delete();

    if (!deleted) throw new NotFoundException('Element rule not found');
  }

  async toggleRule(userId: string, ruleId: string, enabled: boolean): Promise<any> {
    const rule = await this.knex('tbl_element_rules')
      .where({ id: ruleId, user_id: userId })
      .first();

    if (!rule) throw new NotFoundException('Element rule not found');

    const [updated] = await this.knex('tbl_element_rules')
      .where({ id: ruleId, user_id: userId })
      .update({ enabled, updated_at: this.knex.fn.now() })
      .returning('*');

    return updated;
  }
}
