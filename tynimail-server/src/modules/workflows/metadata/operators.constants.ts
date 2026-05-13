/**
 * Filter Operators Metadata
 *
 * Defines all available operators for conditional splits and filters.
 */

export interface OperatorMetadata {
  id: string;
  label: string;
  category: string;
  supportedTypes: string[];
  requiresValue: boolean;
  description?: string;
}

export const FILTER_OPERATORS: OperatorMetadata[] = [
  // Comparison Operators
  {
    id: 'equals',
    label: 'Equals',
    category: 'comparison',
    supportedTypes: ['string', 'number', 'boolean'],
    requiresValue: true,
    description: 'Exact match',
  },
  {
    id: 'not_equals',
    label: 'Not Equals',
    category: 'comparison',
    supportedTypes: ['string', 'number', 'boolean'],
    requiresValue: true,
    description: 'Does not match',
  },
  {
    id: 'greater_than',
    label: 'Greater Than',
    category: 'comparison',
    supportedTypes: ['number', 'date'],
    requiresValue: true,
  },
  {
    id: 'greater_than_or_equals',
    label: 'Greater Than or Equal',
    category: 'comparison',
    supportedTypes: ['number', 'date'],
    requiresValue: true,
  },
  {
    id: 'less_than',
    label: 'Less Than',
    category: 'comparison',
    supportedTypes: ['number', 'date'],
    requiresValue: true,
  },
  {
    id: 'less_than_or_equals',
    label: 'Less Than or Equal',
    category: 'comparison',
    supportedTypes: ['number', 'date'],
    requiresValue: true,
  },

  // String Operators
  {
    id: 'contains',
    label: 'Contains',
    category: 'string',
    supportedTypes: ['string'],
    requiresValue: true,
    description: 'Text contains substring',
  },
  {
    id: 'not_contains',
    label: 'Does Not Contain',
    category: 'string',
    supportedTypes: ['string'],
    requiresValue: true,
  },
  {
    id: 'starts_with',
    label: 'Starts With',
    category: 'string',
    supportedTypes: ['string'],
    requiresValue: true,
  },
  {
    id: 'ends_with',
    label: 'Ends With',
    category: 'string',
    supportedTypes: ['string'],
    requiresValue: true,
  },

  // Existence Operators
  {
    id: 'is_empty',
    label: 'Is Empty',
    category: 'existence',
    supportedTypes: ['string', 'array'],
    requiresValue: false,
    description: 'Field is empty or null',
  },
  {
    id: 'is_not_empty',
    label: 'Is Not Empty',
    category: 'existence',
    supportedTypes: ['string', 'array'],
    requiresValue: false,
    description: 'Field has a value',
  },

  // Boolean Operators
  {
    id: 'is_true',
    label: 'Is True',
    category: 'boolean',
    supportedTypes: ['boolean'],
    requiresValue: false,
  },
  {
    id: 'is_false',
    label: 'Is False',
    category: 'boolean',
    supportedTypes: ['boolean'],
    requiresValue: false,
  },

  // List Operators
  {
    id: 'in_list',
    label: 'In List',
    category: 'list',
    supportedTypes: ['string', 'number'],
    requiresValue: true,
    description: 'Value is in the list',
  },
  {
    id: 'not_in_list',
    label: 'Not In List',
    category: 'list',
    supportedTypes: ['string', 'number'],
    requiresValue: true,
    description: 'Value is not in the list',
  },
];

export const OPERATOR_CATEGORIES = [
  { id: 'comparison', name: 'Comparison', icon: 'equal' },
  { id: 'string', name: 'Text', icon: 'type' },
  { id: 'existence', name: 'Existence', icon: 'check-circle' },
  { id: 'boolean', name: 'Boolean', icon: 'toggle-left' },
  { id: 'list', name: 'List', icon: 'list' },
];
