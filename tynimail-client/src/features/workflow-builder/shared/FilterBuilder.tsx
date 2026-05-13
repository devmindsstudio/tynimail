export interface FilterRule {
  field: string;
  operator: string;
  value?: any;
}

export interface FilterConfig {
  operator: 'AND' | 'OR';
  rules: FilterRule[];
}

interface FilterBuilderProps {
  value: FilterConfig | null;
  onChange: (value: FilterConfig | null) => void;
  fields?: { key: string; label: string; type: string }[];
}

const OPERATORS: Record<string, { value: string; label: string; needsValue: boolean }[]> = {
  string: [
    { value: 'equals', label: 'equals', needsValue: true },
    { value: 'not_equals', label: 'does not equal', needsValue: true },
    { value: 'contains', label: 'contains', needsValue: true },
    { value: 'not_contains', label: 'does not contain', needsValue: true },
    { value: 'starts_with', label: 'starts with', needsValue: true },
    { value: 'ends_with', label: 'ends with', needsValue: true },
    { value: 'is_empty', label: 'is empty', needsValue: false },
    { value: 'is_not_empty', label: 'is not empty', needsValue: false },
  ],
  number: [
    { value: 'equals', label: 'equals', needsValue: true },
    { value: 'not_equals', label: 'does not equal', needsValue: true },
    { value: 'greater_than', label: 'greater than', needsValue: true },
    { value: 'less_than', label: 'less than', needsValue: true },
  ],
  date: [
    { value: 'before', label: 'before', needsValue: true },
    { value: 'after', label: 'after', needsValue: true },
    { value: 'is_anniversary_of', label: 'anniversary of', needsValue: true },
  ],
};

const STANDARD_FIELDS = [
  { key: 'first_name', label: 'First name', type: 'string' },
  { key: 'last_name', label: 'Last name', type: 'string' },
  { key: 'email', label: 'Email', type: 'string' },
  { key: 'phone', label: 'Phone', type: 'string' },
  { key: 'created_at', label: 'Created date', type: 'date' },
  { key: 'attributes.plan', label: 'Attribute: plan', type: 'string' },
  { key: 'attributes.country', label: 'Attribute: country', type: 'string' },
  { key: 'attributes.city', label: 'Attribute: city', type: 'string' },
  { key: 'attributes.company', label: 'Attribute: company', type: 'string' },
];

export function FilterBuilder({ value, onChange, fields = [] }: FilterBuilderProps) {
  const allFields = [...STANDARD_FIELDS, ...fields.filter(f => !STANDARD_FIELDS.some(s => s.key === f.key))];

  const config = value ?? { operator: 'AND' as const, rules: [{ field: '', operator: 'equals', value: '' }] };

  const updateRule = (index: number, patch: Partial<FilterRule>) => {
    const newRules = config.rules.map((r, i) => i === index ? { ...r, ...patch } : r);
    onChange({ ...config, rules: newRules });
  };

  const addRule = () => {
    onChange({ ...config, rules: [...config.rules, { field: '', operator: 'equals', value: '' }] });
  };

  const removeRule = (index: number) => {
    const newRules = config.rules.filter((_, i) => i !== index);
    onChange(newRules.length === 0 ? null : { ...config, rules: newRules });
  };

  const getFieldType = (fieldKey: string) => {
    return allFields.find(f => f.key === fieldKey)?.type ?? 'string';
  };

  return (
    <div className="space-y-2">
      {config.rules.length > 1 && (
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-gray-500">Match</span>
          <select
            value={config.operator}
            onChange={e => onChange({ ...config, operator: e.target.value as 'AND' | 'OR' })}
            className="border rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-blue-400"
          >
            <option value="AND">ALL conditions (AND)</option>
            <option value="OR">ANY condition (OR)</option>
          </select>
        </div>
      )}
      {config.rules.map((rule, i) => {
        const fieldType = getFieldType(rule.field);
        const operators = OPERATORS[fieldType] ?? OPERATORS.string;
        const currentOp = operators.find(o => o.value === rule.operator) ?? operators[0];
        return (
          <div key={i} className="flex flex-col gap-1 pb-2 border-b last:border-0 last:pb-0">
            <div className="flex items-center gap-1">
              <select
                value={rule.field}
                onChange={e => updateRule(i, { field: e.target.value, operator: 'equals', value: '' })}
                className="flex-1 min-w-0 border rounded px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-400"
              >
                <option value="">Field...</option>
                {allFields.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
              </select>
              <button
                type="button"
                onClick={() => removeRule(i)}
                className="text-gray-300 hover:text-red-500 flex-shrink-0 p-1 transition-colors"
              >
                &#x2715;
              </button>
            </div>
            <div className="flex items-center gap-1">
              <select
                value={rule.operator}
                onChange={e => updateRule(i, { operator: e.target.value })}
                className="flex-1 min-w-0 border rounded px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-400"
              >
                {operators.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              {currentOp.needsValue && (
                <input
                  value={rule.value ?? ''}
                  onChange={e => updateRule(i, { value: e.target.value })}
                  placeholder="Value..."
                  className="flex-1 min-w-0 border rounded px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-400"
                />
              )}
            </div>
          </div>
        );
      })}
      <button
        type="button"
        onClick={addRule}
        className="text-xs text-blue-600 hover:underline"
      >
        + Add condition
      </button>
    </div>
  );
}
