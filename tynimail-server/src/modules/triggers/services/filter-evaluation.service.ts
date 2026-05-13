import { Injectable, Logger } from '@nestjs/common';

/**
 * FilterEvaluationService
 * Evaluates filter conditions to determine if a contact matches trigger criteria
 * Supports 15+ operators and AND/OR logic
 */
@Injectable()
export class FilterEvaluationService {
  private readonly logger = new Logger(FilterEvaluationService.name);

  /**
   * Evaluate a filter group against contact data
   */
  evaluateFilters(filters: any, contactData: any): boolean {
    if (!filters || !filters.rules || filters.rules.length === 0) {
      this.logger.log(`[FILTER] No filter rules defined — auto-match (true)`);
      return true; // No filters = always match
    }

    const operator = filters.operator || 'AND';
    this.logger.log(`[FILTER] Evaluating ${filters.rules.length} rule(s) with operator=${operator}`);

    let result: boolean;
    if (operator === 'AND') {
      result = filters.rules.every((rule: any) => {
        const ruleResult = this.evaluateRule(rule, contactData);
        this.logger.log(`[FILTER]   rule { field="${rule.field}", op="${rule.operator}", value=${JSON.stringify(rule.value)} } → ${ruleResult}`);
        return ruleResult;
      });
    } else {
      // OR
      result = filters.rules.some((rule: any) => {
        const ruleResult = this.evaluateRule(rule, contactData);
        this.logger.log(`[FILTER]   rule { field="${rule.field}", op="${rule.operator}", value=${JSON.stringify(rule.value)} } → ${ruleResult}`);
        return ruleResult;
      });
    }

    this.logger.log(`[FILTER] Final result: ${result}`);
    return result;
  }

  /**
   * Evaluate a single rule
   */
  private evaluateRule(rule: any, contactData: any): boolean {
    const { field, operator, value } = rule;

    // Get the actual value from contact data using dot notation
    const actualValue = this.getNestedValue(contactData, field);

    switch (operator) {
      case 'equals':
      case 'is':
        return this.evaluateEquals(actualValue, value);

      case 'not_equals':
      case 'is_not':
        return !this.evaluateEquals(actualValue, value);

      case 'contains':
        return this.evaluateContains(actualValue, value);

      case 'not_contains':
        return !this.evaluateContains(actualValue, value);

      case 'starts_with':
        return this.evaluateStartsWith(actualValue, value);

      case 'ends_with':
        return this.evaluateEndsWith(actualValue, value);

      case 'greater_than':
      case 'gt':
        return this.evaluateGreaterThan(actualValue, value);

      case 'greater_than_or_equal':
      case 'gte':
        return this.evaluateGreaterThanOrEqual(actualValue, value);

      case 'less_than':
      case 'lt':
        return this.evaluateLessThan(actualValue, value);

      case 'less_than_or_equal':
      case 'lte':
        return this.evaluateLessThanOrEqual(actualValue, value);

      case 'is_empty':
      case 'is_null':
        return this.evaluateIsEmpty(actualValue);

      case 'is_not_empty':
      case 'is_not_null':
        return !this.evaluateIsEmpty(actualValue);

      case 'in':
      case 'member_of':
        return this.evaluateIn(actualValue, value);

      case 'not_in':
      case 'not_member_of':
        return !this.evaluateIn(actualValue, value);

      case 'between':
        return this.evaluateBetween(actualValue, value);

      case 'regex':
      case 'matches':
        return this.evaluateRegex(actualValue, value);

      default:
        this.logger.warn(`Unknown operator: ${operator}`);
        return false;
    }
  }

  /**
   * Get nested value from object using dot notation
   * Example: "attributes.plan" from { attributes: { plan: "pro" } }
   */
  private getNestedValue(obj: any, path: string): any {
    if (!obj || !path) return undefined;

    const keys = path.split('.');
    let value = obj;

    for (const key of keys) {
      if (value && typeof value === 'object') {
        value = value[key];
      } else {
        return undefined;
      }
    }

    return value;
  }

  // Operator implementations

  private evaluateEquals(actual: any, expected: any): boolean {
    // Handle null/undefined
    if (actual == null && expected == null) return true;
    if (actual == null || expected == null) return false;

    // Case-insensitive string comparison
    if (typeof actual === 'string' && typeof expected === 'string') {
      return actual.toLowerCase() === expected.toLowerCase();
    }

    // Coerce when one side is a number and the other is a numeric string
    if (typeof actual === 'number' && typeof expected === 'string') {
      return actual === Number(expected);
    }
    if (typeof expected === 'number' && typeof actual === 'string') {
      return Number(actual) === expected;
    }

    return actual === expected;
  }

  private evaluateContains(actual: any, expected: any): boolean {
    if (actual == null) return false;

    // String contains
    if (typeof actual === 'string' && typeof expected === 'string') {
      return actual.toLowerCase().includes(expected.toLowerCase());
    }

    // Array contains
    if (Array.isArray(actual)) {
      return actual.some((item) => this.evaluateEquals(item, expected));
    }

    return false;
  }

  private evaluateStartsWith(actual: any, expected: any): boolean {
    if (typeof actual !== 'string' || typeof expected !== 'string') {
      return false;
    }
    return actual.toLowerCase().startsWith(expected.toLowerCase());
  }

  private evaluateEndsWith(actual: any, expected: any): boolean {
    if (typeof actual !== 'string' || typeof expected !== 'string') {
      return false;
    }
    return actual.toLowerCase().endsWith(expected.toLowerCase());
  }

  private evaluateGreaterThan(actual: any, expected: any): boolean {
    const actualNum = this.toNumber(actual);
    const expectedNum = this.toNumber(expected);

    if (actualNum == null || expectedNum == null) return false;

    return actualNum > expectedNum;
  }

  private evaluateGreaterThanOrEqual(actual: any, expected: any): boolean {
    const actualNum = this.toNumber(actual);
    const expectedNum = this.toNumber(expected);

    if (actualNum == null || expectedNum == null) return false;

    return actualNum >= expectedNum;
  }

  private evaluateLessThan(actual: any, expected: any): boolean {
    const actualNum = this.toNumber(actual);
    const expectedNum = this.toNumber(expected);

    if (actualNum == null || expectedNum == null) return false;

    return actualNum < expectedNum;
  }

  private evaluateLessThanOrEqual(actual: any, expected: any): boolean {
    const actualNum = this.toNumber(actual);
    const expectedNum = this.toNumber(expected);

    if (actualNum == null || expectedNum == null) return false;

    return actualNum <= expectedNum;
  }

  private evaluateIsEmpty(actual: any): boolean {
    if (actual == null) return true;
    if (typeof actual === 'string') return actual.trim() === '';
    if (Array.isArray(actual)) return actual.length === 0;
    if (typeof actual === 'object') return Object.keys(actual).length === 0;
    return false;
  }

  private evaluateIn(actual: any, expected: any): boolean {
    if (!Array.isArray(expected)) return false;
    return expected.some((item) => this.evaluateEquals(actual, item));
  }

  private evaluateBetween(actual: any, expected: any): boolean {
    if (!Array.isArray(expected) || expected.length !== 2) return false;

    const actualNum = this.toNumber(actual);
    const min = this.toNumber(expected[0]);
    const max = this.toNumber(expected[1]);

    if (actualNum == null || min == null || max == null) return false;

    return actualNum >= min && actualNum <= max;
  }

  private evaluateRegex(actual: any, pattern: any): boolean {
    if (typeof actual !== 'string' || typeof pattern !== 'string') {
      return false;
    }

    try {
      const regex = new RegExp(pattern, 'i'); // Case-insensitive
      return regex.test(actual);
    } catch (error) {
      this.logger.error(`Invalid regex pattern: ${pattern}`);
      return false;
    }
  }

  private toNumber(value: any): number | null {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const num = parseFloat(value);
      return isNaN(num) ? null : num;
    }
    return null;
  }
}
