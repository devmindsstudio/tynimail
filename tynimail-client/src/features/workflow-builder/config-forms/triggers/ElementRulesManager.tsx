import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, ChevronDown, ChevronUp, ToggleLeft, ToggleRight } from 'lucide-react';
import axiosInstance from '@/api/axios-instance';
import { ALL_API_ENDPOINT } from '@/api/api-endpoint';

// ── Types ──────────────────────────────────────────────────────────────────

type FieldType = 'tag' | 'id' | 'class' | 'text' | 'href' | 'path' | 'url' | 'attr';
type OperatorType = 'is' | 'is_not' | 'contains' | 'does_not_contain' | 'starts_with' | 'exists';
type DynamicSource = 'attr' | 'text' | 'href' | 'id' | 'class';

interface Condition {
  field: FieldType;
  attr?: string;
  operator: OperatorType;
  value?: string;
}

interface DynamicProp {
  key: string;
  source: DynamicSource;
  attr?: string;
}

interface RuleForm {
  name: string;
  conditions: Condition[];
  staticProps: { key: string; value: string }[];
  dynamicProps: DynamicProp[];
}

const FIELD_OPTIONS: { value: FieldType; label: string }[] = [
  { value: 'tag', label: 'Tag' },
  { value: 'id', label: 'Element ID' },
  { value: 'class', label: 'CSS Class' },
  { value: 'text', label: 'Text Content' },
  { value: 'href', label: 'Href' },
  { value: 'path', label: 'Page Path' },
  { value: 'url', label: 'Full URL' },
  { value: 'attr', label: 'Data Attribute' },
];

const OPERATOR_OPTIONS: { value: OperatorType; label: string }[] = [
  { value: 'is', label: 'is exactly' },
  { value: 'is_not', label: 'is not' },
  { value: 'contains', label: 'contains' },
  { value: 'does_not_contain', label: 'does not contain' },
  { value: 'starts_with', label: 'starts with' },
  { value: 'exists', label: 'exists' },
];

const SOURCE_OPTIONS: { value: DynamicSource; label: string }[] = [
  { value: 'attr', label: 'Data attribute' },
  { value: 'text', label: 'Text content' },
  { value: 'href', label: 'Href' },
  { value: 'id', label: 'Element ID' },
  { value: 'class', label: 'CSS class' },
];

const BLANK_RULE: RuleForm = {
  name: '',
  conditions: [{ field: 'tag', operator: 'is', value: '' }],
  staticProps: [],
  dynamicProps: [],
};

// ── Sub-components ─────────────────────────────────────────────────────────

function ConditionRow({
  condition,
  onChange,
  onRemove,
  canRemove,
}: {
  condition: Condition;
  onChange: (c: Condition) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const select = 'border border-border rounded px-2 py-1 text-xs bg-background focus:outline-none focus:ring-1 focus:ring-primary';

  return (
    <div className="flex items-start gap-1">
      <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0">
        <select className={select} value={condition.field} onChange={e => onChange({ ...condition, field: e.target.value as FieldType, attr: undefined })}>
          {FIELD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        {condition.field === 'attr' && (
          <input
            className="border border-border rounded px-2 py-1 text-xs w-24 focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="data-plan"
            value={condition.attr ?? ''}
            onChange={e => onChange({ ...condition, attr: e.target.value })}
          />
        )}

        <select className={select} value={condition.operator} onChange={e => onChange({ ...condition, operator: e.target.value as OperatorType })}>
          {OPERATOR_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        {condition.operator !== 'exists' && (
          <input
            className="border border-border rounded px-2 py-1 text-xs w-20 focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="value"
            value={condition.value ?? ''}
            onChange={e => onChange({ ...condition, value: e.target.value })}
          />
        )}
      </div>

      {canRemove && (
        <button type="button" onClick={onRemove} className="shrink-0 mt-1 text-muted-foreground hover:text-destructive">
          <Trash2 size={12} />
        </button>
      )}
    </div>
  );
}

function RuleBuilder({
  form,
  onChange,
  onSave,
  onCancel,
  isSaving,
}: {
  form: RuleForm;
  onChange: (f: RuleForm) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const setConditions = (conditions: Condition[]) => onChange({ ...form, conditions });
  const setStaticProps = (staticProps: { key: string; value: string }[]) => onChange({ ...form, staticProps });
  const setDynamicProps = (dynamicProps: DynamicProp[]) => onChange({ ...form, dynamicProps });

  return (
    <div className="border border-border rounded-lg p-4 space-y-4 bg-muted/30">
      {/* Rule name */}
      <div>
        <label className="block text-xs font-medium mb-1">Rule name (optional)</label>
        <input
          className="w-full border border-border rounded px-2 py-1.5 text-xs bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="e.g. Pricing buy button"
          value={form.name}
          onChange={e => onChange({ ...form, name: e.target.value })}
        />
      </div>

      {/* Conditions */}
      <div>
        <label className="block text-xs font-medium mb-2">Conditions <span className="text-muted-foreground font-normal">(ALL must match)</span></label>
        <div className="space-y-2">
          {form.conditions.map((c, i) => (
            <ConditionRow
              key={i}
              condition={c}
              onChange={updated => setConditions(form.conditions.map((x, j) => j === i ? updated : x))}
              onRemove={() => setConditions(form.conditions.filter((_, j) => j !== i))}
              canRemove={form.conditions.length > 1}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => setConditions([...form.conditions, { field: 'tag', operator: 'is', value: '' }])}
          className="mt-2 text-xs text-primary flex items-center gap-1 hover:underline"
        >
          <Plus size={11} /> Add condition
        </button>
      </div>

      {/* Static properties */}
      <div>
        <label className="block text-xs font-medium mb-2">Static properties</label>
        <div className="space-y-1.5">
          {form.staticProps.map((p, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <input
                className="border border-border rounded px-2 py-1 text-xs w-24 focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="key"
                value={p.key}
                onChange={e => setStaticProps(form.staticProps.map((x, j) => j === i ? { ...x, key: e.target.value } : x))}
              />
              <span className="text-xs text-muted-foreground">:</span>
              <input
                className="border border-border rounded px-2 py-1 text-xs flex-1 min-w-0 focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="value"
                value={p.value}
                onChange={e => setStaticProps(form.staticProps.map((x, j) => j === i ? { ...x, value: e.target.value } : x))}
              />
              <button type="button" onClick={() => setStaticProps(form.staticProps.filter((_, j) => j !== i))} className="shrink-0 text-muted-foreground hover:text-destructive">
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setStaticProps([...form.staticProps, { key: '', value: '' }])}
          className="mt-1.5 text-xs text-primary flex items-center gap-1 hover:underline"
        >
          <Plus size={11} /> Add static property
        </button>
      </div>

      {/* Dynamic properties */}
      <div>
        <label className="block text-xs font-medium mb-2">Dynamic properties <span className="text-muted-foreground font-normal">(pulled from element)</span></label>
        <div className="space-y-1.5">
          {form.dynamicProps.map((p, i) => (
            <div key={i} className="flex items-start gap-1">
              <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0">
                <input
                  className="border border-border rounded px-2 py-1 text-xs w-20 focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="key"
                  value={p.key}
                  onChange={e => setDynamicProps(form.dynamicProps.map((x, j) => j === i ? { ...x, key: e.target.value } : x))}
                />
                <span className="text-xs text-muted-foreground">←</span>
                <select
                  className="border border-border rounded px-2 py-1 text-xs bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  value={p.source}
                  onChange={e => setDynamicProps(form.dynamicProps.map((x, j) => j === i ? { ...x, source: e.target.value as DynamicSource, attr: undefined } : x))}
                >
                  {SOURCE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                {p.source === 'attr' && (
                  <input
                    className="border border-border rounded px-2 py-1 text-xs w-20 focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="data-plan"
                    value={p.attr ?? ''}
                    onChange={e => setDynamicProps(form.dynamicProps.map((x, j) => j === i ? { ...x, attr: e.target.value } : x))}
                  />
                )}
              </div>
              <button type="button" onClick={() => setDynamicProps(form.dynamicProps.filter((_, j) => j !== i))} className="shrink-0 mt-1 text-muted-foreground hover:text-destructive">
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setDynamicProps([...form.dynamicProps, { key: '', source: 'attr', attr: '' }])}
          className="mt-1.5 text-xs text-primary flex items-center gap-1 hover:underline"
        >
          <Plus size={11} /> Add dynamic property
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel} className="text-xs px-3 py-1.5 rounded border border-border hover:bg-muted transition-colors">
          Cancel
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="text-xs px-3 py-1.5 rounded bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-60 transition-opacity"
        >
          {isSaving ? 'Saving…' : 'Save rule'}
        </button>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export function ElementRulesManager({ eventName }: { eventName: string }) {
  const queryClient = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<RuleForm>(BLANK_RULE);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const queryKey = ['element-rules', eventName];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await axiosInstance.get(ALL_API_ENDPOINT.ELEMENT_RULES.BY_EVENT(eventName));
      return res.data?.rules ?? [];
    },
    enabled: !!eventName,
  });

  const rules: any[] = data ?? [];

  // ── helpers ──

  function ruleToForm(rule: any): RuleForm {
    const props = typeof rule.properties === 'string' ? JSON.parse(rule.properties) : rule.properties ?? { static: {}, dynamic: [] };
    return {
      name: rule.name ?? '',
      conditions: typeof rule.conditions === 'string' ? JSON.parse(rule.conditions) : rule.conditions ?? [],
      staticProps: Object.entries(props.static ?? {}).map(([key, value]) => ({ key, value: String(value) })),
      dynamicProps: props.dynamic ?? [],
    };
  }

  function formToPayload(f: RuleForm, en: string) {
    const staticObj: Record<string, any> = {};
    f.staticProps.forEach(p => { if (p.key) staticObj[p.key] = p.value; });
    return {
      event_name: en,
      name: f.name || undefined,
      conditions: f.conditions,
      properties: { static: staticObj, dynamic: f.dynamicProps.filter(p => p.key) },
    };
  }

  // ── mutations ──

  const { mutate: createRule, isPending: isCreating } = useMutation({
    mutationFn: (payload: any) => axiosInstance.post(ALL_API_ENDPOINT.ELEMENT_RULES.ALL, payload),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); setAdding(false); setForm(BLANK_RULE); },
  });

  const { mutate: updateRule, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      axiosInstance.patch(ALL_API_ENDPOINT.ELEMENT_RULES.SINGLE(id), payload),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); setEditingId(null); },
  });

  const { mutate: deleteRule } = useMutation({
    mutationFn: (id: string) => axiosInstance.delete(ALL_API_ENDPOINT.ELEMENT_RULES.SINGLE(id)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const { mutate: toggleRule } = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      axiosInstance.patch(ALL_API_ENDPOINT.ELEMENT_RULES.TOGGLE(id), { enabled }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  if (!eventName) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium">Element Tracking Rules</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Auto-fire this event when a matching element is clicked.
          </p>
        </div>
        {!adding && (
          <button
            type="button"
            onClick={() => { setAdding(true); setForm(BLANK_RULE); }}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded border border-border hover:bg-muted transition-colors shrink-0"
          >
            <Plus size={12} /> Add rule
          </button>
        )}
      </div>

      {isLoading && <p className="text-xs text-muted-foreground">Loading rules…</p>}

      {/* Existing rules */}
      {rules.map((rule: any) => (
        <div key={rule.id} className="border border-border rounded-lg overflow-hidden">
          {editingId === rule.id ? (
            <div className="p-3">
              <RuleBuilder
                form={form}
                onChange={setForm}
                onSave={() => updateRule({ id: rule.id, payload: formToPayload(form, eventName) })}
                onCancel={() => setEditingId(null)}
                isSaving={isUpdating}
              />
            </div>
          ) : (
            <div className="px-3 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  className="flex items-center gap-1.5 text-xs font-medium text-left flex-1 truncate"
                  onClick={() => setExpandedId(expandedId === rule.id ? null : rule.id)}
                >
                  {expandedId === rule.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  <span className="truncate">{rule.name || `Rule for ${eventName}`}</span>
                </button>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleRule({ id: rule.id, enabled: !rule.enabled })}
                    className={`transition-colors ${rule.enabled ? 'text-primary' : 'text-muted-foreground'}`}
                    title={rule.enabled ? 'Disable rule' : 'Enable rule'}
                  >
                    {rule.enabled ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEditingId(rule.id); setForm(ruleToForm(rule)); }}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteRule(rule.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {expandedId === rule.id && (
                <div className="mt-2 space-y-1 pl-4">
                  {(typeof rule.conditions === 'string' ? JSON.parse(rule.conditions) : rule.conditions ?? []).map((c: Condition, i: number) => (
                    <p key={i} className="text-xs text-muted-foreground">
                      <span className="font-mono">{c.field}{c.attr ? `[${c.attr}]` : ''}</span>
                      {' '}{c.operator.replace(/_/g, ' ')}{' '}
                      {c.operator !== 'exists' && <span className="font-mono">"{c.value}"</span>}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Add new rule form */}
      {adding && (
        <RuleBuilder
          form={form}
          onChange={setForm}
          onSave={() => createRule(formToPayload(form, eventName))}
          onCancel={() => { setAdding(false); setForm(BLANK_RULE); }}
          isSaving={isCreating}
        />
      )}
    </div>
  );
}
