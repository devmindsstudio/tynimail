import { Injectable } from '@nestjs/common';
import {
  ALL_NODE_TYPES,
  NODE_TYPE_CATEGORIES,
  NodeTypeMetadata,
  TRIGGER_NODE_TYPES,
  ACTION_NODE_TYPES,
  RULE_NODE_TYPES,
} from '../metadata/node-types.constants';
import {
  FILTER_OPERATORS,
  OPERATOR_CATEGORIES,
  OperatorMetadata,
} from '../metadata/operators.constants';
import {
  ALL_VARIABLES,
  VARIABLE_CATEGORIES,
  VariableMetadata,
} from '../metadata/variables.constants';

@Injectable()
export class NodeMetadataService {
  /**
   * Get all node types (triggers, actions, rules)
   */
  getAllNodeTypes() {
    return {
      triggers: TRIGGER_NODE_TYPES,
      actions: ACTION_NODE_TYPES,
      rules: RULE_NODE_TYPES,
      categories: NODE_TYPE_CATEGORIES,
    };
  }

  /**
   * Get node types by category (triggers, actions, or rules)
   */
  getNodeTypesByCategory(category: 'triggers' | 'actions' | 'rules') {
    return ALL_NODE_TYPES[category];
  }

  /**
   * Get a specific node type by ID
   */
  getNodeTypeById(nodeTypeId: string): NodeTypeMetadata | null {
    const allTypes = [...TRIGGER_NODE_TYPES, ...ACTION_NODE_TYPES, ...RULE_NODE_TYPES];
    return allTypes.find((type) => type.id === nodeTypeId) || null;
  }

  /**
   * Get all available filter operators
   */
  getFilterOperators() {
    return {
      operators: FILTER_OPERATORS,
      categories: OPERATOR_CATEGORIES,
    };
  }

  /**
   * Get operators by category
   */
  getOperatorsByCategory(category: string): OperatorMetadata[] {
    return FILTER_OPERATORS.filter((op) => op.category === category);
  }

  /**
   * Get operators supported by a data type
   */
  getOperatorsByType(dataType: string): OperatorMetadata[] {
    return FILTER_OPERATORS.filter((op) => op.supportedTypes.includes(dataType));
  }

  /**
   * Get all available variables for interpolation
   */
  getVariables() {
    return {
      contactFields: ALL_VARIABLES.contactFields,
      customAttributes: ALL_VARIABLES.customAttributes,
      systemFields: ALL_VARIABLES.systemFields,
      triggerData: ALL_VARIABLES.triggerData,
      categories: VARIABLE_CATEGORIES,
    };
  }

  /**
   * Get variables by category
   */
  getVariablesByCategory(category: string): VariableMetadata[] {
    switch (category) {
      case 'contact':
        return ALL_VARIABLES.contactFields;
      case 'custom':
        return ALL_VARIABLES.customAttributes;
      case 'system':
        return ALL_VARIABLES.systemFields;
      case 'trigger':
        return ALL_VARIABLES.triggerData;
      default:
        return [];
    }
  }

  /**
   * Validate a node configuration against its schema
   */
  validateNodeConfig(nodeTypeId: string, config: any): { valid: boolean; errors: string[] } {
    const nodeType = this.getNodeTypeById(nodeTypeId);

    if (!nodeType) {
      return {
        valid: false,
        errors: [`Unknown node type: ${nodeTypeId}`],
      };
    }

    const errors: string[] = [];
    const schema = nodeType.configSchema;

    // Check required fields
    if (schema.required) {
      for (const requiredField of schema.required) {
        if (!(requiredField in config) || config[requiredField] === undefined || config[requiredField] === null || config[requiredField] === '') {
          errors.push(`Missing required field: ${schema.properties[requiredField]?.label || requiredField}`);
        }
      }
    }

    // Type validation (basic)
    for (const [fieldName, fieldSchema] of Object.entries(schema.properties)) {
      if (fieldName in config && config[fieldName] !== undefined && config[fieldName] !== null) {
        const value = config[fieldName];
        const expectedType = fieldSchema.type;

        // Basic type checking
        if (expectedType === 'string' && typeof value !== 'string') {
          errors.push(`Field "${fieldSchema.label}" must be a string`);
        } else if (expectedType === 'number' && typeof value !== 'number') {
          errors.push(`Field "${fieldSchema.label}" must be a number`);
        } else if (expectedType === 'boolean' && typeof value !== 'boolean') {
          errors.push(`Field "${fieldSchema.label}" must be a boolean`);
        } else if (expectedType === 'object' && typeof value !== 'object') {
          errors.push(`Field "${fieldSchema.label}" must be an object`);
        } else if (expectedType === 'array' && !Array.isArray(value)) {
          errors.push(`Field "${fieldSchema.label}" must be an array`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get node type suggestions based on search query
   */
  searchNodeTypes(query: string): NodeTypeMetadata[] {
    const allTypes = [...TRIGGER_NODE_TYPES, ...ACTION_NODE_TYPES, ...RULE_NODE_TYPES];
    const lowerQuery = query.toLowerCase();

    return allTypes.filter(
      (type) =>
        type.name.toLowerCase().includes(lowerQuery) ||
        type.description.toLowerCase().includes(lowerQuery) ||
        type.category.toLowerCase().includes(lowerQuery),
    );
  }
}
