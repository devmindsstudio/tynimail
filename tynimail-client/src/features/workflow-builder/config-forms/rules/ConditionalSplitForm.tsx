import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';
import type { ConfigFormProps } from '../../components/NodeConfigPanel';
import { FilterBuilder, type FilterConfig } from '../../shared/FilterBuilder';
import { FormFooter } from '../FormFooter';

interface Branch {
  id: string;
  name: string;
  isFallback: boolean;
  conditions: FilterConfig | null;
}

const BRANCH_IDS = ['branch_a', 'branch_b', 'branch_c', 'branch_d'];

function buildDefaultBranches(): Branch[] {
  return [
    { id: 'branch_a', name: 'Branch A', isFallback: false, conditions: null },
    { id: 'fallback', name: 'Fallback (all others)', isFallback: true, conditions: null },
  ];
}

export function ConditionalSplitForm({ defaultValues, onSave, onCancel }: ConfigFormProps) {
  const [branches, setBranches] = useState<Branch[]>(
    defaultValues?.branches ?? buildDefaultBranches()
  );
  const [expandedId, setExpandedId] = useState<string | null>(
    // Auto-expand first non-fallback branch
    branches.find(b => !b.isFallback)?.id ?? null
  );

  const nonFallback = branches.filter(b => !b.isFallback);
  const fallback = branches.find(b => b.isFallback)!;

  const addBranch = () => {
    if (nonFallback.length >= 4) return;
    const nextId = BRANCH_IDS[nonFallback.length];
    const newBranch: Branch = {
      id: nextId,
      name: `Branch ${String.fromCharCode(65 + nonFallback.length)}`,
      isFallback: false,
      conditions: null,
    };
    // Insert before fallback
    setBranches(prev => {
      const without = prev.filter(b => !b.isFallback);
      return [...without, newBranch, fallback];
    });
    setExpandedId(nextId);
  };

  const removeBranch = (id: string) => {
    setBranches(prev => prev.filter(b => b.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const renameBranch = (id: string, name: string) => {
    setBranches(prev => prev.map(b => b.id === id ? { ...b, name } : b));
  };

  const setConditions = (id: string, conditions: FilterConfig | null) => {
    setBranches(prev => prev.map(b => b.id === id ? { ...b, conditions } : b));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ branches });
  };

  const isValid = nonFallback.every(b => b.conditions && b.conditions.rules.length > 0 && b.conditions.rules.every(r => r.field));

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <p className="text-xs text-muted-foreground mb-3">
        Contacts are routed to the first matching branch. The fallback catches everyone else.
      </p>

      {/* Non-fallback branches */}
      {nonFallback.map((branch) => (
        <div key={branch.id} className="border rounded-lg overflow-hidden">
          {/* Branch header */}
          <div
            className="flex items-center gap-2 px-3 py-2.5 bg-orange-50 cursor-pointer select-none"
            onClick={() => setExpandedId(expandedId === branch.id ? null : branch.id)}
          >
            <span className="text-orange-500 flex-shrink-0">
              {expandedId === branch.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </span>
            <input
              value={branch.name}
              onChange={e => { e.stopPropagation(); renameBranch(branch.id, e.target.value); }}
              onClick={e => e.stopPropagation()}
              className="flex-1 text-sm font-medium bg-transparent border-none outline-none text-orange-900 placeholder:text-orange-400"
              placeholder="Branch name"
            />
            <span className="text-xs text-orange-400 flex-shrink-0 mr-1">
              {branch.conditions?.rules?.filter(r => r.field).length ?? 0} condition{(branch.conditions?.rules?.filter(r => r.field).length ?? 0) !== 1 ? 's' : ''}
            </span>
            {nonFallback.length > 1 && (
              <button
                type="button"
                onClick={e => { e.stopPropagation(); removeBranch(branch.id); }}
                className="text-orange-300 hover:text-red-500 transition-colors flex-shrink-0"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>

          {/* Conditions */}
          {expandedId === branch.id && (
            <div className="px-3 py-3 bg-white">
              <p className="text-xs text-muted-foreground mb-2">Route here when contact matches:</p>
              <FilterBuilder
                value={branch.conditions}
                onChange={conditions => setConditions(branch.id, conditions)}
              />
            </div>
          )}
        </div>
      ))}

      {/* Add branch */}
      {nonFallback.length < 4 && (
        <button
          type="button"
          onClick={addBranch}
          className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 font-medium py-1"
        >
          <Plus size={12} /> Add branch
        </button>
      )}

      {/* Fallback branch */}
      <div className="border border-dashed rounded-lg px-3 py-2.5 bg-gray-50">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500">Fallback</span>
          <span className="text-xs text-gray-400">— catches contacts that don't match any branch above</span>
        </div>
      </div>

      {!isValid && nonFallback.some(b => !b.conditions || b.conditions.rules.length === 0 || b.conditions.rules.some(r => !r.field)) && (
        <p className="text-xs text-amber-600">Each branch needs at least one complete condition.</p>
      )}

      <FormFooter onCancel={onCancel} />
    </form>
  );
}
